import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

// Check if Upstash credentials are available
const upstashUrl = process.env.UPSTASH_REDIS_REST_URL
const upstashToken = process.env.UPSTASH_REDIS_REST_TOKEN
const isRateLimitingEnabled = upstashUrl && upstashToken && upstashUrl.trim() !== '' && upstashToken.trim() !== ''

// Create Redis instance and rate limiter only if credentials are available
let generationRateLimit: Ratelimit | null = null

if (isRateLimitingEnabled) {
  const redis = new Redis({
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