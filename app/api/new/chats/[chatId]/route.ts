// app/api/new/chats/[chatId]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { projectService } from '@/lib/services/project.service'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ chatId: string }> }
) {
  try {
    const { chatId } = await params

    if (!chatId) {
      return NextResponse.json(
        { error: 'Chat ID is required' },
        { status: 400 }
      )
    }

    const chat = await projectService.getChat(chatId)
    
    if (!chat) {
      return NextResponse.json(
        { error: 'Chat not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(chat)
  } catch (error) {
    console.error('Get chat API error:', error)
    
    if (error instanceof Error && error.message === 'API_KEY_MISSING') {
      return NextResponse.json(
        { error: 'API_KEY_MISSING', message: 'API key is missing or invalid' },
        { status: 401 }
      )
    }
    
    return NextResponse.json(
      { error: 'Failed to fetch chat' },
      { status: 500 }
    )
  }
}