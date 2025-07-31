// lib/queries/project.queries.ts
import { useQuery } from '@tanstack/react-query'
import { queryKeys } from '../query-keys'

// API fetch functions
async function fetchProjects() {
  const response = await fetch('/api/projects')
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.message || 'Failed to fetch projects')
  }
  return response.json()
}

async function fetchProject(projectId: string) {
  const response = await fetch(`/api/new/projects/${projectId}`)
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.message || 'Failed to fetch project')
  }
  return response.json()
}

async function fetchProjectChats(projectId: string) {
  const response = await fetch(`/api/new/projects/${projectId}/chats`)
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.message || 'Failed to fetch project chats')
  }
  return response.json()
}

async function fetchChat(chatId: string) {
  const response = await fetch(`/api/chats/${chatId}`)
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.message || 'Failed to fetch chat')
  }
  return response.json()
}

// TanStack Query hooks for client-side data fetching
export function useProjectsQuery() {
  return useQuery({
    queryKey: queryKeys.projects.list(),
    queryFn: fetchProjects,
    staleTime: 2 * 60 * 1000, // 2 minutes
    retry: (failureCount, error) => {
      // Don't retry on API key errors
      if (error.message?.includes('API_KEY_MISSING')) {
        return false
      }
      return failureCount < 3
    },
  })
}

export function useProjectQuery(projectId: string) {
  return useQuery({
    queryKey: queryKeys.projects.detail(projectId),
    queryFn: () => fetchProject(projectId),
    enabled: !!projectId && projectId !== 'new',
    staleTime: 2 * 60 * 1000,
    retry: (failureCount, error) => {
      if (error.message?.includes('API_KEY_MISSING')) {
        return false
      }
      return failureCount < 3
    },
  })
}

export function useProjectChatsQuery(projectId: string) {
  return useQuery({
    queryKey: queryKeys.projects.chats(projectId),
    queryFn: () => fetchProjectChats(projectId),
    enabled: !!projectId && projectId !== 'new',
    staleTime: 1 * 60 * 1000, // 1 minute
    retry: (failureCount, error) => {
      if (error.message?.includes('API_KEY_MISSING')) {
        return false
      }
      return failureCount < 3
    },
  })
}

export function useChatQuery(chatId: string) {
  return useQuery({
    queryKey: queryKeys.chats.detail(chatId),
    queryFn: () => fetchChat(chatId),
    enabled: !!chatId && chatId !== 'new',
    staleTime: 30 * 1000, // 30 seconds
    retry: (failureCount, error) => {
      if (error.message?.includes('API_KEY_MISSING')) {
        return false
      }
      return failureCount < 3
    },
  })
}