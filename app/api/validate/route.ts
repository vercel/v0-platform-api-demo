import { v0 } from 'v0-sdk'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    // Make a simple API call to test if the key is valid
    // Using projects.find() as it's a lightweight operation
    await v0.projects.find()
    
    return NextResponse.json({ 
      valid: true, 
      message: 'API key is configured correctly' 
    })
  } catch (error) {
    if (error instanceof Error) {
      const errorMessage = error.message.toLowerCase()
      
      // Check if it's an API key related error
      if (errorMessage.includes('api key is required') || 
          errorMessage.includes('v0_api_key') || 
          errorMessage.includes('config.apikey') ||
          errorMessage.includes('unauthorized') ||
          errorMessage.includes('invalid api key')) {
        return NextResponse.json(
          { 
            valid: false, 
            error: 'API_KEY_MISSING',
            message: error.message 
          },
          { status: 401 }
        )
      }

      // Other errors (network, etc.)
      return NextResponse.json(
        { 
          valid: false, 
          error: 'VALIDATION_ERROR',
          message: error.message 
        },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { 
        valid: false, 
        error: 'UNKNOWN_ERROR',
        message: 'Unknown error occurred during validation' 
      },
      { status: 500 }
    )
  }
} 