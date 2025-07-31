// app/server/page.tsx (optimized version)
import { Suspense } from 'react'
import { HydrationBoundary, QueryClient, dehydrate } from '@tanstack/react-query'
import { queryKeys } from '@/lib/query-keys'
import { projectService } from '@/lib/services/project.service'
import HomePageClient from './components/home-page-client'
import ApiKeyError from '../components/api-key-error'

async function getServerSideData() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        // Prevent queries from retrying on the server
        retry: false,
        // Set a reasonable stale time
        staleTime: 2 * 60 * 1000,
      },
    },
  })

  try {
    // Validate API key first
    const apiValidation = await projectService.validateApiKey()
    
    if (!apiValidation.isValid) {
      return {
        queryClient,
        showApiKeyError: true,
        validationError: apiValidation.error,
      }
    }

    // Prefetch projects if API is valid
    // Use prefetchQuery to avoid throwing on server
    await queryClient.prefetchQuery({
      queryKey: queryKeys.projects.list(),
      queryFn: () => projectService.getProjects(),
      staleTime: 2 * 60 * 1000,
    })

    return {
      queryClient,
      showApiKeyError: false,
      user: apiValidation.user,
    }
  } catch (error) {
    console.error('Server-side data fetching error:', error)
    
    // Handle specific error types
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

export default async function HomePage({ 
  searchParams 
}: { 
  searchParams: Promise<{ error?: string }>
}) {
  const { error } = await searchParams
  const { queryClient, showApiKeyError, validationError, user } = await getServerSideData()

  if (showApiKeyError) {
    return <ApiKeyError error={validationError} />
  }

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <Suspense fallback={<HomePageLoading />}>
        <HomePageClient 
          initialError={error}
          user={user}
        />
      </Suspense>
    </HydrationBoundary>
  )
}

function HomePageLoading() {
  return (
    <div className="relative min-h-dvh bg-gray-50">
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center" style={{ transform: 'translateY(-25%)' }}>
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-4">
            What can I help you build?
          </h1>
        </div>
      </div>
      <div className="absolute bottom-0 left-0 right-0 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-sm border animate-pulse">
            <div className="p-4">
              <div className="h-20 bg-gray-200 rounded mb-4"></div>
              <div className="flex justify-between items-center">
                <div className="flex space-x-2">
                  <div className="h-8 w-20 bg-gray-200 rounded"></div>
                  <div className="h-8 w-20 bg-gray-200 rounded"></div>
                </div>
                <div className="h-8 w-16 bg-gray-200 rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}