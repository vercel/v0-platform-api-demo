// app/server/projects/[projectId]/chats/[chatId]/page.tsx (hybrid approach)
import { Suspense } from 'react'
import { notFound } from 'next/navigation'
import { HydrationBoundary, QueryClient, dehydrate } from '@tanstack/react-query'
import { projectService } from '@/lib/services/project.service'
import { queryKeys } from '@/lib/query-keys'
import ChatPageClient from './components/chat-page-client'
import ApiKeyError from '@/app/components/api-key-error'

interface ChatPageProps {
  params: Promise<{
    projectId: string
    chatId: string
  }>
}

async function getChatPageData(projectId: string, chatId: string) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        staleTime: 2 * 60 * 1000,
      },
    },
  })

  try {
    // Validate API key first using your existing service
    const apiValidation = await projectService.validateApiKey()
    if (!apiValidation.isValid) {
      return {
        queryClient,
        showApiKeyError: true,
        validationError: apiValidation.error,
      }
    }

    // Prefetch all data in parallel using your existing service methods
    const prefetchPromises = [
      // Prefetch projects list
      queryClient.prefetchQuery({
        queryKey: queryKeys.projects.list(),
        queryFn: () => projectService.getProjects(),
        staleTime: 2 * 60 * 1000,
      }),
      
      // Prefetch current project
      queryClient.prefetchQuery({
        queryKey: queryKeys.projects.detail(projectId),
        queryFn: () => projectService.getProject(projectId),
        staleTime: 2 * 60 * 1000,
      }),
    ]

    // Prefetch chat data if it's not a new chat
    if (chatId !== 'new' && chatId !== 'new-chat') {
      prefetchPromises.push(
        queryClient.prefetchQuery({
          queryKey: queryKeys.chats.detail(chatId),
          queryFn: () => projectService.getChat(chatId),
          staleTime: 30 * 1000,
        })
      )
    }

    await Promise.all(prefetchPromises)

    // Verify project exists (this will be cached from prefetch)
    const projectData = await projectService.getProject(projectId)
    if (!projectData) {
      notFound()
    }

    return {
      queryClient,
      showApiKeyError: false,
      user: apiValidation.user,
    }
  } catch (error) {
    console.error('Server-side chat page data fetching error:', error)
    
    // Handle API key errors
    if (error instanceof Error && error.message === 'API_KEY_MISSING') {
      return {
        queryClient,
        showApiKeyError: true,
        validationError: 'API_KEY_MISSING',
      }
    }
    
    return {
      queryClient,
      showApiKeyError: true,
      validationError: 'UNKNOWN_ERROR',
    }
  }
}

export default async function ChatPage({ params }: ChatPageProps) {
  const { projectId, chatId } = await params
  
  const {
    queryClient,
    showApiKeyError,
    validationError,
    user,
  } = await getChatPageData(projectId, chatId)

  if (showApiKeyError) {
    return <ApiKeyError error={validationError} />
  }

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <Suspense fallback={<ChatPageLoading />}>
        <ChatPageClient
          projectId={projectId}
          chatId={chatId}
          user={user}
        />
      </Suspense>
    </HydrationBoundary>
  )
}

function ChatPageLoading() {
  return (
    <div className="relative min-h-dvh bg-gray-50">
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-gray-900 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600">Loading chat...</p>
        </div>
      </div>
    </div>
  )
}