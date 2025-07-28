import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

// Create Redis instance
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
})

// Create rate limiter: 3 requests per 12 hours (43200 seconds)
export const generationRateLimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(3, '43200 s'), // 3 requests per 12 hours
  analytics: true,
  prefix: 'v0_generation_limit',
})

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