'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { MoreVerticalIcon, TrashIcon } from 'lucide-react'
import {
  ProjectDropdown,
  ChatDropdown,
} from '../projects/[projectId]/chats/[chatId]/components'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'

interface PromptComponentProps {
  // Initial state
  initialPrompt?: string
  initialExpanded?: boolean

  // Data for dropdowns (optional)
  projects?: any[]
  projectChats?: any[]
  currentProjectId?: string
  currentChatId?: string

  // Optional chat data for v0.dev link
  chatData?: any

  // Submit handler - different behavior for homepage vs chat pages
  onSubmit: (prompt: string) => Promise<void>

  // Loading state from parent
  isLoading: boolean

  // Error state from parent
  error: string | null

  // Placeholder text
  placeholder?: string

  // Show dropdowns?
  showDropdowns?: boolean

  // Callbacks for dropdown changes
  onProjectChange?: (projectId: string) => void
  onChatChange?: (chatId: string) => void

  // Delete callbacks
  onDeleteChat?: () => Promise<void>
}

export default function PromptComponent({
  initialPrompt = '',
  initialExpanded = true,
  projects = [],
  projectChats = [],
  currentProjectId,
  currentChatId,
  chatData,
  onSubmit,
  isLoading,
  error,
  placeholder = 'Describe your app...',
  showDropdowns = false,
  onProjectChange,
  onChatChange,
  onDeleteChat,
}: PromptComponentProps) {
  const router = useRouter()
  const [prompt, setPrompt] = useState(initialPrompt)
  const [isPromptExpanded, setIsPromptExpanded] = useState(initialExpanded)
  const [shouldAnimate, setShouldAnimate] = useState(false)

  // Global keydown listener to expand prompt on typing and handle escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Handle escape key
      if (e.key === 'Escape') {
        if (isPromptExpanded) {
          // If prompt is expanded, collapse it
          setIsPromptExpanded(false)
        }
        // Remove navigation behavior - just handle prompt collapse
        return
      }

      // Don't expand if prompt is already expanded or if loading
      if (isPromptExpanded || isLoading) return

      // Don't expand for special keys
      if (e.ctrlKey || e.metaKey || e.altKey || e.shiftKey) return
      if (e.key === 'Tab' || e.key === 'Enter') return
      if (e.key.startsWith('Arrow') || e.key.startsWith('F')) return

      // Expand for printable characters
      if (e.key.length === 1) {
        setShouldAnimate(true)
        setIsPromptExpanded(true)
        // Add the typed character to prompt
        setPrompt(e.key)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isPromptExpanded, isLoading, router, currentProjectId])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!prompt.trim()) return

    setIsPromptExpanded(false) // Hide prompt bar on submit
    setShouldAnimate(false) // Reset animation state

    try {
      await onSubmit(prompt.trim())
      // Clear the prompt after successful submission
      setPrompt('')
    } catch (err) {
      // Error handling is done by parent component
    }
  }

  return (
    <>
      {/* Floating v0 Button */}
      {!isPromptExpanded && (
        <div className="fixed bottom-6 right-6 z-50 animate-fade-in">
          <button
            onClick={() => {
              setShouldAnimate(true)
              setIsPromptExpanded(true)
            }}
            className="text-white bg-black border border-gray-500 p-4 rounded-full shadow-lg transition-all duration-200 cursor-pointer hover:opacity-80"
          >
            {isLoading ? (
              <div className="animate-spin rounded-full h-6 w-6 border-2 border-white border-t-transparent"></div>
            ) : (
              <img src="/v0-logo.svg" alt="v0" className="w-6 h-6" />
            )}
          </button>
        </div>
      )}

      {/* Premium Prompt Area */}
      {isPromptExpanded && (
        <div
          className={`fixed inset-x-0 bottom-0 z-30 pointer-events-none ${shouldAnimate ? 'animate-slide-up' : ''}`}
        >
          {/* Main prompt container */}
          <div className="mx-auto max-w-4xl px-6 pb-8 pointer-events-auto">
            <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-2xl overflow-hidden border border-white/50">
              {/* Input area */}
              <div className="p-6">
                <form onSubmit={handleSubmit}>
                  <div className="relative">
                    {/* Input field */}
                    <textarea
                      ref={(textarea) => {
                        if (
                          textarea &&
                          isPromptExpanded &&
                          prompt.length === 1
                        ) {
                          setTimeout(() => {
                            textarea.focus()
                            textarea.setSelectionRange(
                              textarea.value.length,
                              textarea.value.length,
                            )
                          }, 0)
                        } else if (
                          textarea &&
                          isPromptExpanded &&
                          prompt.length === 0
                        ) {
                          setTimeout(() => textarea.focus(), 0)
                        }
                      }}
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                      placeholder={placeholder}
                      rows={1}
                      className="w-full pl-2.5 pr-16 py-4 text-lg bg-transparent border-0 focus:ring-0 focus:outline-none text-gray-900 placeholder-gray-400 font-medium resize-none overflow-hidden"
                      disabled={isLoading}
                      style={{
                        minHeight: '56px', // Match the original height
                        height: 'auto',
                      }}
                      onInput={(e) => {
                        const target = e.target as HTMLTextAreaElement
                        target.style.height = 'auto'
                        target.style.height =
                          Math.min(target.scrollHeight, 200) + 'px' // Max height of 200px
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault()
                          handleSubmit(e as any)
                        }
                      }}
                    />

                    {/* Submit button */}
                    <button
                      type="submit"
                      disabled={isLoading || !prompt.trim()}
                      className="absolute right-0 top-1/2 -translate-y-1/2 flex items-center justify-center h-12 rounded-xl text-gray-600 hover:text-gray-900 disabled:text-gray-300 transition-all duration-200 cursor-pointer disabled:cursor-not-allowed"
                      style={{
                        width: 'fit-content',
                        minWidth: '48px',
                        paddingLeft: '12px',
                        paddingRight: '12px',
                      }}
                    >
                      {isLoading ? (
                        <div className="animate-spin rounded-full h-5 w-5 border-2 border-gray-600 border-t-transparent"></div>
                      ) : (
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 10l7-7m0 0l7 7m-7-7v18"
                          />
                        </svg>
                      )}
                    </button>
                  </div>

                  {/* Controls under input */}
                  <div className="mt-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                      {/* Project and Chat Dropdowns */}
                      {showDropdowns && currentProjectId ? (
                        <>
                          <ProjectDropdown
                            currentProjectId={currentProjectId}
                            currentChatId={currentChatId || 'new'}
                            projects={projects}
                            onProjectChange={onProjectChange}
                          />
                          <ChatDropdown
                            projectId={currentProjectId}
                            currentChatId={currentChatId || 'new'}
                            chats={projectChats}
                            onChatChange={onChatChange}
                          />
                        </>
                      ) : currentProjectId ? (
                        // Placeholder to prevent layout shift
                        <div className="flex gap-3">
                          <div className="h-8 w-24 bg-transparent"></div>
                          <div className="h-8 w-20 bg-transparent"></div>
                        </div>
                      ) : null}
                    </div>

                    <div className="flex items-center space-x-3">
                      {/* v0.dev Link */}
                      {chatData?.url && (
                        <a
                          href={chatData.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs font-medium text-gray-500 hover:text-gray-700 transition-colors"
                        >
                          View on v0.dev
                        </a>
                      )}

                      {/* More Options Menu */}
                      {showDropdowns && currentProjectId && (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0"
                            >
                              <MoreVerticalIcon className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" side="top">
                            {/* Delete Chat */}
                            {currentChatId &&
                              currentChatId !== 'new' &&
                              onDeleteChat && (
                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <DropdownMenuItem
                                      onSelect={(e) => e.preventDefault()}
                                    >
                                      <TrashIcon className="mr-2 h-4 w-4" />
                                      Delete Chat
                                    </DropdownMenuItem>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent>
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>
                                        Delete Chat
                                      </AlertDialogTitle>
                                      <AlertDialogDescription>
                                        Are you sure you want to delete this
                                        chat? This action cannot be undone.
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>
                                        Cancel
                                      </AlertDialogCancel>
                                      <AlertDialogAction
                                        onClick={onDeleteChat}
                                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                      >
                                        Delete
                                      </AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                              )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </div>
                  </div>
                </form>

                {error && (
                  <div className="mt-4 px-4 py-3 text-red-700 text-sm bg-red-50 border border-red-200 rounded-xl">
                    {error}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
