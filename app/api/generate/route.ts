import { v0 } from 'v0-sdk'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { message, chatId, modelId = 'v0-1.5-md' } = await request.json()

    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { error: 'Message is required and must be a string' },
        { status: 400 },
      )
    }

    let response

    if (chatId) {
      // Continue existing chat using sendMessage
      response = await v0.chats.sendMessage({
        chatId: chatId,
        message: message.trim(),
        modelConfiguration: {
          modelId: modelId,
          imageGenerations: true,
        },
      })
    } else {
      // Create new chat
      response = await v0.chats.create({
        message: message.trim(),
        modelConfiguration: {
          modelId: modelId,
          imageGenerations: true,
        },
      })
    }

    return NextResponse.json(response)
  } catch (error) {
    // Check if it's an API key error
    if (error instanceof Error) {
      const errorMessage = error.message.toLowerCase()
      if (
        errorMessage.includes('api key is required') ||
        errorMessage.includes('v0_api_key') ||
        errorMessage.includes('config.apikey')
      ) {
        return NextResponse.json(
          { error: 'API_KEY_MISSING', message: error.message },
          { status: 401 },
        )
      }

      return NextResponse.json(
        { error: `Failed to generate app: ${error.message}` },
        { status: 500 },
      )
    }

    return NextResponse.json(
      { error: 'Failed to generate app. Please try again.' },
      { status: 500 },
    )
  }
}
