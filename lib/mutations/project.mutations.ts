// lib/mutations/project.mutations.ts (minor improvements)
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { queryKeys } from '../query-keys'
import { 
  generateAppAction, 
  generateAppActionWithRedirect,
  updateChatAction,
  deleteChatAction,
  createDeploymentAction,
  sendMessageAction,
} from '../actions/project.actions'
import { type GenerateRequest } from '../services/project.service'

export function useGenerateAppMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (request: GenerateRequest) => generateAppAction(request),
    onSuccess: (data) => {
      if (data.success && data.projectId) {
        // Invalidate projects list
        queryClient.invalidateQueries({
          queryKey: queryKeys.projects.list(),
        })
        
        // Invalidate project chats
        queryClient.invalidateQueries({
          queryKey: queryKeys.projects.chats(data.projectId),
        })
        
        // Invalidate project detail
        queryClient.invalidateQueries({
          queryKey: queryKeys.projects.detail(data.projectId),
        })

        // If you have a chat detail query, prefetch it
        if (data.chatId) {
          queryClient.invalidateQueries({
            queryKey: queryKeys.chats.detail(data.chatId),
          })
        }
      }
    },
    onError: (error) => {
      console.error('Generate app mutation error:', error)
    },
  })
}

// This one is perfect as-is for server-side redirects
export function useGenerateAppWithRedirectMutation() {
  return useMutation({
    mutationFn: (request: GenerateRequest) => generateAppActionWithRedirect(request),
    onError: (error) => {
      console.error('Generate app with redirect mutation error:', error)
    },
  })
}

// Your navigation version is great - keep it
export function useGenerateAppWithNavigation() {
  const queryClient = useQueryClient()
  const router = useRouter()

  return useMutation({
    mutationFn: (request: GenerateRequest) => generateAppAction(request),
    onSuccess: (data) => {
      if (data.success && data.chatId && data.projectId) {
        // Invalidate related queries
        queryClient.invalidateQueries({
          queryKey: queryKeys.projects.list(),
        })
        queryClient.invalidateQueries({
          queryKey: queryKeys.projects.chats(data.projectId),
        })
        queryClient.invalidateQueries({
          queryKey: queryKeys.projects.detail(data.projectId),
        })

        // Navigate to the new chat
        router.push(`/server/projects/${data.projectId}/chats/${data.chatId}`)
      }
    },
    onError: (error) => {
      console.error('Generate app with navigation mutation error:', error)
    },
  })
}

// Add support for settings in sendMessage
export function useSendMessageMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ 
      chatId, 
      message, 
      settings 
    }: { 
      chatId: string; 
      message: string;
      settings?: { modelId: string; imageGenerations: boolean; thinking: boolean }
    }) =>
      sendMessageAction(chatId, message, settings), // Pass settings through
    onSuccess: (data, variables) => {
      if (data.success) {
        // Invalidate chat details
        queryClient.invalidateQueries({
          queryKey: queryKeys.chats.detail(variables.chatId),
        })
        
        // Invalidate chat messages if you have that query
        queryClient.invalidateQueries({
          queryKey: queryKeys.chats.messages(variables.chatId),
        })
      }
    },
    onError: (error) => {
      console.error('Send message mutation error:', error)
    },
  })
}

// Rest of your mutations are perfect as-is!
export function useUpdateChatMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ chatId, updates }: { chatId: string; updates: { name?: string } }) =>
      updateChatAction(chatId, updates),
    onSuccess: (data, variables) => {
      if (data.success) {
        queryClient.invalidateQueries({
          queryKey: queryKeys.chats.detail(variables.chatId),
        })
        queryClient.invalidateQueries({
          queryKey: queryKeys.projects.all,
        })
      }
    },
    onError: (error) => {
      console.error('Update chat mutation error:', error)
    },
  })
}

export function useDeleteChatMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (chatId: string) => deleteChatAction(chatId),
    onSuccess: (data, chatId) => {
      if (data.success) {
        queryClient.removeQueries({
          queryKey: queryKeys.chats.detail(chatId),
        })
        queryClient.invalidateQueries({
          queryKey: queryKeys.projects.all,
        })
      }
    },
    onError: (error) => {
      console.error('Delete chat mutation error:', error)
    },
  })
}

export function useCreateDeploymentMutation() {
  return useMutation({
    mutationFn: ({ projectId, chatId, versionId }: { 
      projectId: string; 
      chatId: string; 
      versionId: string; 
    }) => createDeploymentAction(projectId, chatId, versionId),
    onError: (error) => {
      console.error('Create deployment mutation error:', error)
    },
  })
}