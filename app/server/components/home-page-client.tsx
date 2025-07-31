// app/server/components/home-page-client.tsx (optimized version)
'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useProjectsQuery, useProjectChatsQuery } from '@/lib/queries/project.queries'
import { useGenerateAppWithNavigation } from '@/lib/mutations/project.mutations'
import { type GenerateRequest, type UserDetail } from '@/lib/services/project.service'
import PromptComponent from '@/app/components/prompt-component'

interface HomePageClientProps {
  initialError?: string
  user?: UserDetail
}

export default function HomePageClient({ initialError, user }: HomePageClientProps) {
  const router = useRouter()
  const [selectedProjectId, setSelectedProjectId] = useState('new')
  const [selectedChatId, setSelectedChatId] = useState('new')
  const [error, setError] = useState<string | null>(initialError || null)

  // Clear URL error parameter after displaying
  useEffect(() => {
    if (initialError) {
      // Replace URL to remove error parameter without navigation
      window.history.replaceState(null, '', window.location.pathname)
    }
  }, [initialError])

  // Queries - these will use the prefetched data from server
  const { 
    data: projects = [], 
    isLoading: projectsLoading,
    error: projectsError 
  } = useProjectsQuery()
  
  const { 
    data: projectChats = [],
    isLoading: chatsLoading 
  } = useProjectChatsQuery(selectedProjectId)

  // Use the navigation version for better UX
  const generateAppMutation = useGenerateAppWithNavigation()

  const handleProjectChange = useCallback(async (newProjectId: string) => {
    if (newProjectId === 'new') {
      setSelectedProjectId('new')
      setSelectedChatId('new')
    } else {
      router.push(`/server/projects/${newProjectId}`)
    }
  }, [router])

  const handleChatChange = useCallback((newChatId: string) => {
    setSelectedChatId(newChatId)
  }, [])

  const handleSubmit = useCallback(async (
    prompt: string,
    settings: { modelId: string; imageGenerations: boolean; thinking: boolean },
    attachments?: { url: string; name?: string; type?: string }[],
  ) => {
    setError(null) // Clear any existing errors

    const request: GenerateRequest = {
      message: prompt,
      modelId: settings.modelId,
      imageGenerations: settings.imageGenerations,
      thinking: settings.thinking,
      ...(attachments && attachments.length > 0 && { attachments }),
    }

    try {
      await generateAppMutation.mutateAsync(request)
      // Navigation is handled by the mutation hook
    } catch (error) {
      // Set error state for PromptComponent
      const errorMessage = error instanceof Error ? error.message : 'Failed to generate app'
      setError(errorMessage)
      console.error('Generate app error:', error)
      // Don't re-throw - let the component handle the error state
    }
  }, [generateAppMutation])

  // Handle query errors
  useEffect(() => {
    if (projectsError && !error) {
      const errorMessage = projectsError instanceof Error 
        ? projectsError.message 
        : 'Failed to load projects'
      setError(errorMessage)
    }
  }, [projectsError, error])

  return (
    <div className="relative min-h-dvh bg-gray-50">
      {/* Homepage Welcome Message */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center" style={{ transform: 'translateY(-25%)' }}>
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-4">
            What can I help you build?
          </h1>
          {user && (
            <p className="text-lg text-gray-600 mt-2">
              Welcome back, {user.name || user.email || 'there'}!
            </p>
          )}
        </div>
      </div>

      <PromptComponent
        onSubmit={handleSubmit}
        isLoading={generateAppMutation.isPending}
        error={error}
        placeholder="Describe your app..."
        showDropdowns={!projectsLoading && !chatsLoading}
        projects={projects}
        projectChats={projectChats}
        currentProjectId={selectedProjectId}
        currentChatId={selectedChatId}
        onProjectChange={handleProjectChange}
        onChatChange={handleChatChange}
      />
    </div>
  )
}