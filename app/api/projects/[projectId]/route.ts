import { NextRequest, NextResponse } from 'next/server'
import { v0 } from 'v0-sdk'
import { getUserIP, checkProjectOwnership, migrateProjectOwnership } from '@/lib/rate-limiter'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string }> },
) {
  try {
    const { projectId } = await params

    if (!projectId) {
      return NextResponse.json(
        { error: 'Project ID is required' },
        { status: 400 },
      )
    }

    // Get user's IP and check ownership
    const userIP = getUserIP(request)
    let hasAccess = await checkProjectOwnership(projectId, userIP)
    
    // If no access, try migration (for existing projects created before IP isolation)
    if (!hasAccess) {
      await migrateProjectOwnership(projectId, userIP)
      hasAccess = await checkProjectOwnership(projectId, userIP)
    }
    
    if (!hasAccess) {
      return NextResponse.json(
        { error: 'Project not found or access denied' },
        { status: 404 },
      )
    }

    // Get project details (includes chats)
    const project = await v0.projects.getById({ projectId })

    return NextResponse.json(project)
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
    }

    return NextResponse.json(
      { error: 'Failed to fetch project' },
      { status: 500 },
    )
  }
}
