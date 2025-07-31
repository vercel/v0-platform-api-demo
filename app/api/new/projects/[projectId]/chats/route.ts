// app/api/new/projects/[projectId]/chats/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { projectService } from '@/lib/services/project.service'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    const { projectId } = await params

    if (!projectId) {
      return NextResponse.json(
        { error: 'Project ID is required' },
        { status: 400 }
      )
    }

    const chats = await projectService.getProjectChats(projectId)
    return NextResponse.json(chats)
  } catch (error) {
    console.error('Get project chats API error:', error)
    
    if (error instanceof Error && error.message === 'API_KEY_MISSING') {
      return NextResponse.json(
        { error: 'API_KEY_MISSING', message: 'API key is missing or invalid' },
        { status: 401 }
      )
    }
    
    return NextResponse.json(
      { error: 'Failed to fetch project chats' },
      { status: 500 }
    )
  }
}

