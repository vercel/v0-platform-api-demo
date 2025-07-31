// lib/actions/project.actions.ts
'use server'

import { redirect } from 'next/navigation'
import { revalidateTag } from 'next/cache'
import { projectService, type GenerateRequest } from '../services/project.service'

export async function generateAppAction(
  formData: FormData | GenerateRequest
): Promise<{ success: boolean; error?: string; chatId?: string; projectId?: string }> {
  try {
    let request: GenerateRequest

    if (formData instanceof FormData) {
      // Handle FormData from form submission
      const attachmentsJson = formData.get('attachments') as string
      const attachments = attachmentsJson ? JSON.parse(attachmentsJson) : undefined

      request = {
        message: formData.get('message') as string,
        modelId: formData.get('modelId') as string,
        imageGenerations: formData.get('imageGenerations') === 'true',
        thinking: formData.get('thinking') === 'true',
        ...(attachments && { attachments }),
      }
    } else {
      // Handle direct object
      request = formData
    }

    const result = await projectService.generateApp(request)
    
    // Revalidate related data
    revalidateTag('projects')
    revalidateTag(`project-${result.projectId}`)
    revalidateTag(`chat-${result.chatId}`)
    
    return {
      success: true,
      chatId: result.chatId,
      projectId: result.projectId,
    }
  } catch (error) {
    console.error('Generate app action error:', error)
    
    if (error instanceof Error) {
      return {
        success: false,
        error: error.message,
      }
    }
    
    return {
      success: false,
      error: 'Failed to generate app. Please try again.',
    }
  }
}

export async function generateAppActionWithRedirect(
  formData: FormData | GenerateRequest
): Promise<never> {
  const result = await generateAppAction(formData)
  
  if (result.success && result.chatId && result.projectId) {
    redirect(`/server/projects/${result.projectId}/chats/${result.chatId}`)
  } else {
    // Redirect back with error - you might want to handle this differently
    redirect(`/?error=${encodeURIComponent(result.error || 'Unknown error')}`)
  }
}

export async function updateChatAction(
  chatId: string,
  updates: { name?: string }
): Promise<{ success: boolean; error?: string }> {
  try {
    await projectService.updateChat(chatId, updates)
    
    // Revalidate related data
    revalidateTag(`chat-${chatId}`)
    revalidateTag('projects')
    
    return { success: true }
  } catch (error) {
    console.error('Update chat action error:', error)
    
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update chat',
    }
  }
}

export async function deleteChatAction(
  chatId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const success = await projectService.deleteChat(chatId)
    
    if (success) {
      // Revalidate related data
      revalidateTag(`chat-${chatId}`)
      revalidateTag('projects')
      
      return { success: true }
    } else {
      return { success: false, error: 'Failed to delete chat' }
    }
  } catch (error) {
    console.error('Delete chat action error:', error)
    
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to delete chat',
    }
  }
}

export async function createDeploymentAction(
  projectId: string,
  chatId: string,
  versionId: string
): Promise<{ success: boolean; error?: string; deployment?: any }> {
  try {
    const deployment = await projectService.createDeployment(projectId, chatId, versionId)
    
    return {
      success: true,
      deployment,
    }
  } catch (error) {
    console.error('Create deployment action error:', error)
    
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create deployment',
    }
  }
}

export async function sendMessageAction(
  chatId: string,
  message: string,
  settings?: { modelId: string; imageGenerations: boolean; thinking: boolean }
): Promise<{ success: boolean; error?: string; response?: any }> {
  try {
    const response = await projectService.sendMessage(chatId, message, settings)
    
    // Revalidate chat data
    revalidateTag(`chat-${chatId}`)
    
    return {
      success: true,
      response,
    }
  } catch (error) {
    console.error('Send message action error:', error)
    
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to send message',
    }
  }
}