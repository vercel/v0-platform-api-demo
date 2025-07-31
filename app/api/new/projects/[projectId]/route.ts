// app/api/new/projects/[projectId]/route.ts
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

    const projectData = await projectService.getProject(projectId)
    
    if (!projectData) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(projectData)
  } catch (error) {
    console.error('Get project API error:', error)
    
    if (error instanceof Error && error.message === 'API_KEY_MISSING') {
      return NextResponse.json(
        { error: 'API_KEY_MISSING', message: 'API key is missing or invalid' },
        { status: 401 }
      )
    }
    
    return NextResponse.json(
      { error: 'Failed to fetch project' },
      { status: 500 }
    )
  }
}

