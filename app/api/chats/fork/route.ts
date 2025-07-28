import { NextRequest, NextResponse } from 'next/server'
import { v0 } from 'v0-sdk'
import { getUserIP, checkChatOwnership, associateChatWithIP } from '@/lib/rate-limiter'

export async function POST(request: NextRequest) {
  try {
    const { chatId, projectId } = await request.json()

    if (!chatId) {
      return NextResponse.json(
        { error: 'Chat ID is required' },
        { status: 400 },
      )
    }

    // Get user's IP and check if they own the original chat
    const userIP = getUserIP(request)
    const hasAccess = await checkChatOwnership(chatId, userIP)
    
    if (!hasAccess) {
      return NextResponse.json(
        { error: 'Chat not found or access denied' },
        { status: 404 },
      )
    }

    // Fork the chat using v0 SDK
    const forkedChat = await v0.chats.fork({
      chatId: chatId,
      ...(projectId && { projectId }), // Include projectId if provided
    })

    // Associate the forked chat with the user's IP
    if (forkedChat.id) {
      await associateChatWithIP(forkedChat.id, userIP)
    }

    return NextResponse.json(forkedChat)
  } catch (error) {
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
        { error: `Failed to fork chat: ${error.message}` },
        { status: 500 },
      )
    }

    return NextResponse.json({ error: 'Failed to fork chat' }, { status: 500 })
  }
}
