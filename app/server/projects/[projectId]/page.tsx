// app/server/projects/[projectId]/page.tsx (pure server-side)
import { redirect, notFound } from 'next/navigation'
import { projectService } from '@/lib/services/project.service'
import ApiKeyError from '@/app/components/api-key-error'

interface ProjectPageProps {
  params: Promise<{
    projectId: string
  }>
}

async function getProjectPageData(projectId: string) {
  try {
    // Validate API key first using your existing service
    const apiValidation = await projectService.validateApiKey()
    
    if (!apiValidation.isValid) {
      return {
        showApiKeyError: true,
        validationError: apiValidation.error,
      }
    }

    // Get project data using your existing service
    const projectData = await projectService.getProject(projectId)
    
    if (!projectData) {
      notFound()
    }

    return {
      showApiKeyError: false,
      projectData,
    }
  } catch (error) {
    console.error('Server-side project page data fetching error:', error)
    
    // Handle API key errors specifically
    if (error instanceof Error && error.message === 'API_KEY_MISSING') {
      return {
        showApiKeyError: true,
        validationError: 'API_KEY_MISSING',
      }
    }
    
    return {
      showApiKeyError: true,
      validationError: 'UNKNOWN_ERROR',
    }
  }
}

export default async function ProjectPage({ params }: ProjectPageProps) {
  const { projectId } = await params
  
  const { showApiKeyError, validationError, projectData } = await getProjectPageData(projectId)

  if (showApiKeyError) {
    return <ApiKeyError error={validationError} />
  }

  // Get the latest chat from the project
  const chats = projectData?.chats || []
  
  if (chats.length > 0) {
    // Sort by updatedAt if available, otherwise use the first chat
    const sortedChats = chats.sort((a: any, b: any) => {
      if (a.updatedAt && b.updatedAt) {
        return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      }
      return 0
    })
    const latestChatId = sortedChats[0].id

    // Server-side redirect to the latest chat
    redirect(`/server/projects/${projectId}/chats/${latestChatId}`)
  } else {
    // No chats found, redirect to create new chat
    redirect(`/server/projects/${projectId}/chats/new`)
  }
}