import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

// Check if Upstash credentials are available
const upstashUrl = process.env.KV_REST_API_URL
const upstashToken = process.env.KV_REST_API_TOKEN
const isRateLimitingEnabled = upstashUrl && upstashToken && upstashUrl.trim() !== '' && upstashToken.trim() !== ''

// Create Redis instance and rate limiter only if credentials are available
let generationRateLimit: Ratelimit | null = null
let redis: Redis | null = null

if (isRateLimitingEnabled) {
  redis = new Redis({
    url: upstashUrl!,
    token: upstashToken!,
  })

  // Create rate limiter: 3 requests per 12 hours (43200 seconds)
  generationRateLimit = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(3, '43200 s'), // 3 requests per 12 hours
    analytics: true,
    prefix: 'v0_generation_limit',
  })
}

// Function to get user identifier from request
export function getUserIdentifier(request: Request): string {
  // Try to get IP address from various headers
  const forwarded = request.headers.get('x-forwarded-for')
  const realIp = request.headers.get('x-real-ip')
  const cfConnectingIp = request.headers.get('cf-connecting-ip')
  
  // Use the first available IP, fallback to a default
  const ip = forwarded?.split(',')[0] || realIp || cfConnectingIp || 'unknown'
  
  // You can extend this to use user authentication if available
  // For now, we'll use IP-based rate limiting
  return `ip:${ip}`
}

// Function to get just the IP address from request
export function getUserIP(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for')
  const realIp = request.headers.get('x-real-ip')
  const cfConnectingIp = request.headers.get('cf-connecting-ip')
  
  return forwarded?.split(',')[0] || realIp || cfConnectingIp || 'unknown'
}

// Function to associate an IP with a project
export async function associateProjectWithIP(projectId: string, userIP: string): Promise<void> {
  if (!redis) return // Skip if Redis is not available
  
  try {
    // Store both directions of the mapping
    await redis.sadd(`user_projects:${userIP}`, projectId)
    await redis.set(`project_owner:${projectId}`, userIP)
  } catch (error) {
    console.warn('Failed to associate project with IP:', error)
  }
}

// Function to associate an IP with a chat
export async function associateChatWithIP(chatId: string, userIP: string): Promise<void> {
  if (!redis) return // Skip if Redis is not available
  
  try {
    // Store both directions of the mapping
    await redis.sadd(`user_chats:${userIP}`, chatId)
    await redis.set(`chat_owner:${chatId}`, userIP)
  } catch (error) {
    console.warn('Failed to associate chat with IP:', error)
  }
}

// Function to check if a user owns a project
export async function checkProjectOwnership(projectId: string, userIP: string): Promise<boolean> {
  if (!redis) return true // Allow access if Redis is not available
  
  try {
    const owner = await redis.get(`project_owner:${projectId}`)
    return owner === userIP
  } catch (error) {
    console.warn('Failed to check project ownership:', error)
    return true // Allow access on error
  }
}

// Function to check if a user owns a chat
export async function checkChatOwnership(chatId: string, userIP: string): Promise<boolean> {
  if (!redis) return true // Allow access if Redis is not available
  
  try {
    const owner = await redis.get(`chat_owner:${chatId}`)
    return owner === userIP
  } catch (error) {
    console.warn('Failed to check chat ownership:', error)
    return true // Allow access on error
  }
}

// Function to get user's projects
export async function getUserProjects(userIP: string): Promise<string[]> {
  if (!redis) return [] // Return empty if Redis is not available
  
  try {
    const projectIds = await redis.smembers(`user_projects:${userIP}`)
    return projectIds as string[]
  } catch (error) {
    console.warn('Failed to get user projects:', error)
    return []
  }
}

// Function to get user's chats
export async function getUserChats(userIP: string): Promise<string[]> {
  if (!redis) return [] // Return empty if Redis is not available
  
  try {
    const chatIds = await redis.smembers(`user_chats:${userIP}`)
    return chatIds as string[]
  } catch (error) {
    console.warn('Failed to get user chats:', error)
    return []
  }
}

// Migration function: associate unowned projects with the accessing user
export async function migrateProjectOwnership(projectId: string, userIP: string): Promise<void> {
  if (!redis) return // Skip if Redis is not available
  
  try {
    // Check if project already has an owner
    const existingOwner = await redis.get(`project_owner:${projectId}`)
    
    // If no owner exists, associate it with this user
    if (!existingOwner) {
      await associateProjectWithIP(projectId, userIP)
    }
  } catch (error) {
    console.warn('Failed to migrate project ownership:', error)
  }
}

// Migration function: associate unowned chats with the accessing user
export async function migrateChatOwnership(chatId: string, userIP: string): Promise<void> {
  if (!redis) return // Skip if Redis is not available
  
  try {
    // Check if chat already has an owner
    const existingOwner = await redis.get(`chat_owner:${chatId}`)
    
    // If no owner exists, associate it with this user
    if (!existingOwner) {
      await associateChatWithIP(chatId, userIP)
    }
  } catch (error) {
    console.warn('Failed to migrate chat ownership:', error)
  }
}

// Check if rate limit is exceeded
export async function checkRateLimit(identifier: string) {
  // If rate limiting is not enabled, always allow the request
  if (!isRateLimitingEnabled || !generationRateLimit) {
    return {
      success: true,
      limit: 3,
      reset: Date.now() + 43200000, // 12 hours from now
      remaining: 3,
      resetTime: new Date(Date.now() + 43200000),
    }
  }

  try {
    const { success, limit, reset, remaining } = await generationRateLimit.limit(identifier)
    
    return {
      success,
      limit,
      reset,
      remaining,
      resetTime: new Date(reset),
    }
  } catch (error) {
    console.error('Rate limit check failed:', error)
    // On error, allow the request (fail open)
    return {
      success: true,
      limit: 3,
      reset: Date.now() + 43200000, // 12 hours from now
      remaining: 3,
      resetTime: new Date(Date.now() + 43200000),
    }
  }
} 