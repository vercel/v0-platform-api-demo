// app/server/server/projects/[projectId]/chats/[chatId]/components/chat-page-client.tsx
'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { ProjectDropdown, ChatDropdown } from '../components'
import PromptComponent from '../../../../../components/prompt-component'
import { LoadingComponent } from '@/components/loading-component'
import { IFrameComponent } from '@/components/iframe-component'
import { useChatPolling } from '@/lib/hooks/useChatPollingNew'
import { useDebugLogger } from '@/lib/hooks/useDebugLogger'
import { 
  useProjectsQuery, 
  useProjectQuery, 
  useChatQuery 
} from '@/lib/queries/project.queries'
import { 
  useDeleteChatMutation, 
  useUpdateChatMutation 
} from '@/lib/mutations/project.mutations'

interface ChatPageClientProps {
  projectId: string
  chatId: string
  user?: any
}

export default function ChatPageClient({
  projectId,
  chatId,
  user,
}: ChatPageClientProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [generatedApp, setGeneratedApp] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Debug logger
  const { log, info, error: logError } = useDebugLogger({ componentName: 'ChatPageClient' })

  // These queries will use the prefetched data from server
  const { 
    data: projects = [], 
    isLoading: projectsLoading 
  } = useProjectsQuery()
  
  const { 
    data: projectData, 
    isLoading: projectLoading 
  } = useProjectQuery(projectId)
  
  const { 
    data: chatData, 
    isLoading: chatLoading 
  } = useChatQuery(chatId !== 'new' && chatId !== 'new-chat' ? chatId : '')

  // Mutations using your existing mutation hooks
  const deleteChatMutation = useDeleteChatMutation()
  const updateChatMutation = useUpdateChatMutation()

  // Chat polling hook
  const { status: chatStatus, error: pollingError } = useChatPolling({
    chatId: chatId && chatId !== 'new' && chatId !== 'new-chat' ? chatId : null,
    enabled: true, // API validation already done server-side
    onStatusChange: (status) => {
      info(`Chat status changed to: ${status}`, { chatId, status })
      if (status === 'failed' && !error) {
        setError('Chat generation failed. Please try again.')
      }
    }
  })

  // Set generated app when chat data loads
  useEffect(() => {
    if (chatData) {
      if (chatData.demo) {
        setGeneratedApp(chatData.demo)
      } else if (chatData.url) {
        setGeneratedApp(chatData.url)
      }
    }
  }, [chatData])

  const handleProjectChange = useCallback(async (newProjectId: string) => {
    if (newProjectId === 'new') {
      router.push('/server') // Go to homepage
    } else if (newProjectId !== projectId) {
      router.push(`/server/projects/${newProjectId}`)
    }
  }, [router, projectId])

  const handleChatChange = useCallback((newChatId: string) => {
    if (newChatId === 'new') {
      router.push(`/server/projects/${projectId}/chats/new-chat`)
    } else if (newChatId !== chatId) {
      router.push(`/server/projects/${projectId}/chats/${newChatId}`)
    }
  }, [router, projectId, chatId])

  const handleDeleteChat = useCallback(async () => {
    try {
      await deleteChatMutation.mutateAsync(chatId)
      router.push(`/server/projects/${projectId}`)
    } catch (error) {
      setError('Failed to delete chat. Please try again.')
    }
  }, [deleteChatMutation, chatId, projectId, router])

  const handleRenameChat = useCallback(async (newName: string) => {
    try {
      await updateChatMutation.mutateAsync({ 
        chatId, 
        updates: { name: newName } 
      })
    } catch (error) {
      throw error // Re-throw to let dialog handle the error display
    }
  }, [updateChatMutation, chatId])

  const handleSubmit = useCallback(async (
    prompt: string,
    settings: { modelId: string; imageGenerations: boolean; thinking: boolean },
    attachments?: { url: string; name?: string; type?: string }[],
  ) => {
    setIsLoading(true)
    setError(null)
    log('Submitting prompt', { 
      prompt: prompt.substring(0, 50), 
      settings, 
      attachmentCount: attachments?.length || 0 
    })

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: prompt,
          chatId: chatId !== 'new' && chatId !== 'new-chat' ? chatId : undefined,
          projectId: projectId,
          modelId: settings.modelId,
          imageGenerations: settings.imageGenerations,
          thinking: settings.thinking,
          ...(attachments && attachments.length > 0 && { attachments }),
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        if (response.status === 401 && errorData.error === 'API_KEY_MISSING') {
          router.push('/server?error=api_key_missing')
          return
        }
        throw new Error(errorData.error || 'Failed to generate app')
      }

      const data = await response.json()

      // If this was a new chat, redirect to the actual chat ID
      if ((chatId === 'new' || chatId === 'new-chat') && (data.id || data.chatId)) {
        const newChatId = data.id || data.chatId
        const newProjectId = data.projectId || projectId
        router.replace(`/server/projects/${newProjectId}/chats/${newChatId}`)
        return
      }

      // Update generated app preview
      if (data.demo) {
        setGeneratedApp(data.demo)
      } else if (data.url) {
        setGeneratedApp(data.url)
      } else {
        // Fallback preview
        const fallbackPreview = `
          <!DOCTYPE html>
          <html>
          <head>
            <script src="https://cdn.tailwindcss.com"></script>
          </head>
          <body class="p-8 bg-gray-50 flex items-center justify-center min-h-dvh">
            <div class="max-w-md mx-auto text-center">
              <div class="text-4xl mb-4">✨</div>
              <h1 class="text-xl font-semibold mb-4">App Generated Successfully!</h1>
              <p class="text-gray-600 mb-4">${data.text || 'Your app has been created.'}</p>
              ${data.url ? `
                <a href="${data.url}" target="_blank" class="inline-block bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors">
                  View on v0.dev
                </a>
              ` : ''}
            </div>
          </body>
          </html>
        `
        setGeneratedApp(fallbackPreview)
      }

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to generate app. Please try again.'
      setError(errorMessage)
      throw err // Re-throw to prevent clearing prompt
    } finally {
      setIsLoading(false)
    }
  }, [chatId, projectId, router, log])

  // Since data is prefetched, loading states should be minimal
  const showInitialLoading = projectsLoading || projectLoading || 
    (chatId !== 'new' && chatId !== 'new-chat' && chatLoading)

  return (
    <div className="relative min-h-dvh bg-gray-50">
      {/* Preview Area */}
      <div className="absolute inset-0 overflow-hidden">
        {generatedApp ? (
          <IFrameComponent src={generatedApp} />
        ) : null}
      </div>

      {/* Loading overlays */}
      <div className="absolute inset-0 z-10">
        {showInitialLoading ? (
          <LoadingComponent
            message="Loading chat data"
            color="#10b981"
          />
        ) : isLoading ? (
          <LoadingComponent
            message="Generating your app"
            color="#10b981"
          />
        ) : null}
      </div>

      {/* User Control & Input Area */}
      <PromptComponent
        onSubmit={handleSubmit}
        isLoading={isLoading}
        error={error}
        placeholder={
          chatId !== 'new' && chatId !== 'new-chat'
            ? 'Refine your app...'
            : 'Describe your app...'
        }
        showDropdowns={!showInitialLoading}
        projects={projects}
        projectChats={projectData?.chats || []}
        currentProjectId={projectId}
        currentChatId={chatId}
        chatData={chatData}
        onProjectChange={handleProjectChange}
        onChatChange={handleChatChange}
        onDeleteChat={handleDeleteChat}
        onRenameChat={handleRenameChat}
        persistDraft={true}
      />
    </div>
  )
}