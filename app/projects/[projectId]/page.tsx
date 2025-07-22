import { redirect } from 'next/navigation'
import { v0 } from 'v0-sdk'

interface ProjectPageProps {
  params: {
    projectId: string
  }
}

async function getLatestChat(projectId: string) {
  try {
    // Load project with chats using v0.projects.getById
    const projectData = await v0.projects.getById({ projectId })
    
    // Get the latest chat from the project
    const chats = projectData.chats || []
    if (chats.length > 0) {
      // Sort by updatedAt if available, otherwise use the first chat
      const sortedChats = chats.sort((a: any, b: any) => {
        if (a.updatedAt && b.updatedAt) {
          return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        }
        return 0
      })
      return sortedChats[0].id
    }
    
    return null
  } catch (error) {
    return null
  }
}

export default async function ProjectPage({ params }: ProjectPageProps) {
  const { projectId } = params
  
  // Get the latest chat for this project
  const latestChatId = await getLatestChat(projectId)
  
  if (latestChatId) {
    // Redirect to the latest chat
    redirect(`/projects/${projectId}/chats/${latestChatId}`)
  } else {
    // No chats found, redirect to create new chat
    redirect(`/projects/${projectId}/chats/new`)
  }
} 