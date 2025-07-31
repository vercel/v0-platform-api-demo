// app/api/new/projects/route.ts
import { NextResponse } from 'next/server'
import { projectService } from '@/lib/services/project.service'

export async function GET() {
  try {
    const projects = await projectService.getProjects()
    return NextResponse.json(projects)
  } catch (error) {
    console.error('Get projects API error:', error)
    
    if (error instanceof Error && error.message === 'API_KEY_MISSING') {
      return NextResponse.json(
        { error: 'API_KEY_MISSING', message: 'API key is missing or invalid' },
        { status: 401 }
      )
    }
    
    return NextResponse.json(
      { error: 'Failed to fetch projects' },
      { status: 500 }
    )
  }
}

