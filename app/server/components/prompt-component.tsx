// app/components/prompt-component.tsx (optimized version)
'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import {
  MoreVerticalIcon,
  TrashIcon,
  XIcon,
  PaperclipIcon,
  MicIcon,
} from 'lucide-react'
import SettingsDialog from './settings-dialog'
import RenameChatDialog from './rename-chat-dialog'
import { useSettings } from '@/lib/hooks/useSettings'
import {
  ProjectDropdown,
  ChatDropdown,
} from '../../projects/[projectId]/chats/[chatId]/components'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
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
import { Skeleton } from '@/components/ui/skeleton'

interface Attachment {
  url: string
  name?: string
  type?: string
}

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
  onSubmit: (
    prompt: string,
    settings: { modelId: string; imageGenerations: boolean; thinking: boolean },
    attachments?: Attachment[],
  ) => Promise<void>

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

  // Rename chat callback
  onRenameChat?: (newName: string) => Promise<void>

  // Optional: Control draft persistence (useful for chat pages vs homepage)
  persistDraft?: boolean
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
  onRenameChat,
  persistDraft = true, // Default to true for backward compatibility
}: PromptComponentProps) {
  const router = useRouter()
  const { settings } = useSettings()
  const [prompt, setPrompt] = useState(initialPrompt)
  const [isPromptExpanded, setIsPromptExpanded] = useState(initialExpanded)
  const [shouldAnimate, setShouldAnimate] = useState(false)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [attachments, setAttachments] = useState<Attachment[]>([])
  const [isListening, setIsListening] = useState(false)
  const [speechSupported, setSpeechSupported] = useState(false)
  const [isDeploying, setIsDeploying] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const recognitionRef = useRef<any>(null)

  // SessionStorage keys for persistence (only if enabled)
  const PROMPT_STORAGE_KEY = `v0-draft-prompt-${currentChatId || 'new'}`
  const ATTACHMENTS_STORAGE_KEY = `v0-draft-attachments-${currentChatId || 'new'}`

  // Safe sessionStorage operations
  const getFromStorage = useCallback((key: string): string | null => {
    if (!persistDraft || typeof window === 'undefined') return null
    try {
      return sessionStorage.getItem(key)
    } catch (error) {
      console.warn('Failed to read from sessionStorage:', error)
      return null
    }
  }, [persistDraft])

  const setInStorage = useCallback((key: string, value: string) => {
    if (!persistDraft || typeof window === 'undefined') return
    try {
      sessionStorage.setItem(key, value)
    } catch (error) {
      console.warn('Failed to write to sessionStorage:', error)
    }
  }, [persistDraft])

  const removeFromStorage = useCallback((key: string) => {
    if (!persistDraft || typeof window === 'undefined') return
    try {
      sessionStorage.removeItem(key)
    } catch (error) {
      console.warn('Failed to remove from sessionStorage:', error)
    }
  }, [persistDraft])

  // Load saved prompt and attachments from sessionStorage on mount
  useEffect(() => {
    if (!persistDraft) return

    const savedPrompt = getFromStorage(PROMPT_STORAGE_KEY)
    const savedAttachments = getFromStorage(ATTACHMENTS_STORAGE_KEY)
    
    if (savedPrompt && !initialPrompt) {
      setPrompt(savedPrompt)
    }
    
    if (savedAttachments) {
      try {
        const parsedAttachments = JSON.parse(savedAttachments)
        setAttachments(parsedAttachments)
      } catch (error) {
        console.warn('Failed to parse saved attachments:', error)
      }
    }
  }, [initialPrompt, persistDraft, getFromStorage, PROMPT_STORAGE_KEY, ATTACHMENTS_STORAGE_KEY])

  // Save prompt to sessionStorage whenever it changes
  useEffect(() => {
    if (persistDraft && prompt) {
      setInStorage(PROMPT_STORAGE_KEY, prompt)
    }
  }, [prompt, persistDraft, setInStorage, PROMPT_STORAGE_KEY])

  // Save attachments to sessionStorage whenever they change
  useEffect(() => {
    if (persistDraft) {
      setInStorage(ATTACHMENTS_STORAGE_KEY, JSON.stringify(attachments))
    }
  }, [attachments, persistDraft, setInStorage, ATTACHMENTS_STORAGE_KEY])

  // Clear sessionStorage function
  const clearDraft = useCallback(() => {
    if (!persistDraft) return
    removeFromStorage(PROMPT_STORAGE_KEY)
    removeFromStorage(ATTACHMENTS_STORAGE_KEY)
  }, [persistDraft, removeFromStorage, PROMPT_STORAGE_KEY, ATTACHMENTS_STORAGE_KEY])

  // Check for speech recognition support
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition =
        (window as any).SpeechRecognition ||
        (window as any).webkitSpeechRecognition
      setSpeechSupported(!!SpeechRecognition)

      if (SpeechRecognition) {
        recognitionRef.current = new SpeechRecognition()
        recognitionRef.current.continuous = true
        recognitionRef.current.interimResults = true
        recognitionRef.current.lang = 'en-US'
        recognitionRef.current.onresult = (event: any) => {
          let finalTranscript = ''
          for (let i = event.resultIndex; i < event.results.length; i++) {
            if (event.results[i].isFinal) {
              finalTranscript += event.results[i][0].transcript
            }
          }
          if (finalTranscript) {
            setPrompt((prev) => prev + finalTranscript)
          }
        }

        recognitionRef.current.onend = () => {
          setIsListening(false)
        }

        recognitionRef.current.onerror = () => {
          setIsListening(false)
        }
      }
    }

    // Cleanup function
    return () => {
      if (recognitionRef.current && isListening) {
        recognitionRef.current.stop()
      }
    }
  }, [isListening])

  const toggleListening = useCallback(() => {
    if (!recognitionRef.current) return
    if (isListening) {
      recognitionRef.current.stop()
      setIsListening(false)
    } else {
      recognitionRef.current.start()
      setIsListening(true)
    }
  }, [isListening])

  // Global keydown listener to expand prompt on typing and handle escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't handle keyboard events if any dialog is open
      if (isDialogOpen) return

      // Handle escape key
      if (e.key === 'Escape') {
        if (isPromptExpanded) {
          setIsPromptExpanded(false)
        }
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
  }, [isPromptExpanded, isLoading, isDialogOpen])

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()
    if (!prompt.trim() || isLoading) return

    // Stop listening if active
    if (isListening && recognitionRef.current) {
      recognitionRef.current.stop()
      setIsListening(false)
    }

    setIsPromptExpanded(false) // Hide prompt bar on submit
    setShouldAnimate(false) // Reset animation state

    try {
      await onSubmit(
        prompt.trim(),
        {
          modelId: settings.model,
          imageGenerations: settings.imageGenerations,
          thinking: settings.thinking,
        },
        attachments,
      )
      // Clear the prompt and attachments after successful submission
      setPrompt('')
      setAttachments([])
      // Clear sessionStorage draft
      clearDraft()
    } catch (err) {
      // Error handling is done by parent component
      console.error('Submit error:', err)
    }
  }, [prompt, isLoading, isListening, onSubmit, settings, attachments, clearDraft])

  const handleRenameChat = useCallback(async (newName: string) => {
    if (!onRenameChat) return
    await onRenameChat(newName)
  }, [onRenameChat])

  const handleFileSelect = useCallback(async (files: FileList) => {
    const newAttachments: Attachment[] = []

    for (let i = 0; i < files.length; i++) {
      const file = files[i]

      // Convert file to data URL
      const dataUrl = await new Promise<string>((resolve) => {
        const reader = new FileReader()
        reader.onload = (e) => resolve(e.target?.result as string)
        reader.readAsDataURL(file)
      })
      newAttachments.push({
        url: dataUrl,
        name: file.name,
        type: file.type,
      })
    }
    setAttachments(prev => [...prev, ...newAttachments])
  }, [])

  const removeAttachment = useCallback((index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index))
  }, [])

  const handleDeploy = useCallback(async () => {
    if (!currentProjectId || !currentChatId || !chatData?.latestVersion?.id) return
    
    setIsDeploying(true)
    try {
      const response = await fetch('/api/deployments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          projectId: currentProjectId,
          chatId: currentChatId,
          versionId: chatData.latestVersion.id,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to deploy')
      }

      const deployment = await response.json()

      // Show success message or open deployment URL
      if (deployment.webUrl) {
        window.open(deployment.webUrl, '_blank')
      }
    } catch (error) {
      console.error('Deployment failed:', error)
      // You could add a toast notification here
    } finally {
      setIsDeploying(false)
    }
  }, [currentProjectId, currentChatId, chatData])

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
            className="text-white bg-black border border-gray-800 p-4 rounded-full shadow-lg transition-all duration-200 cursor-pointer hover:opacity-80"
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
          <div className="mx-auto max-w-4xl px-3 sm:px-6 pb-4 sm:pb-8 pointer-events-auto">
            <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-2xl overflow-hidden border border-white/50">
              {/* Input area */}
              <div className="p-3 sm:p-6">
                <form onSubmit={handleSubmit}>
                  {/* Hidden file input */}
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept="image/*,.pdf,.doc,.docx,.txt"
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files && e.target.files.length > 0) {
                        handleFileSelect(e.target.files)
                        e.target.value = '' // Reset input
                      }
                    }}
                  />

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
                      className={`w-full pl-2 sm:pl-2.5 py-2 sm:py-4 text-base sm:text-lg bg-transparent border-0 focus:ring-0 focus:outline-none text-gray-900 placeholder-gray-400 font-medium resize-none overflow-hidden ${
                        speechSupported ? 'pr-24 sm:pr-32' : 'pr-20 sm:pr-24'
                      }`}
                      disabled={isLoading}
                      style={{
                        minHeight: '44px',
                        height: 'auto',
                      }}
                      onInput={(e) => {
                        const target = e.target as HTMLTextAreaElement
                        target.style.height = 'auto'
                        target.style.height =
                          Math.min(target.scrollHeight, 200) + 'px'
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault()
                          handleSubmit(e as any)
                        }
                      }}
                    />

                    {/* Mic button - only show if speech recognition is supported */}
                    {speechSupported && (
                      <button
                        type="button"
                        onClick={toggleListening}
                        disabled={isLoading}
                        className={`absolute top-1/2 -translate-y-1/2 flex items-center justify-center h-8 w-8 sm:h-10 sm:w-10 rounded-lg transition-all duration-200 cursor-pointer disabled:cursor-not-allowed ${
                          isListening
                            ? 'text-red-600 bg-red-50 hover:text-red-700 hover:bg-red-100'
                            : 'text-gray-600 hover:text-gray-900 disabled:text-gray-300'
                        }`}
                        style={{ right: '80px' }}
                      >
                        <MicIcon className="w-4 h-4" />
                      </button>
                    )}

                    {/* Attachment button */}
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isLoading}
                      className="absolute top-1/2 -translate-y-1/2 flex items-center justify-center h-8 w-8 sm:h-10 sm:w-10 rounded-lg text-gray-600 hover:text-gray-900 disabled:text-gray-300 transition-all duration-200 cursor-pointer disabled:cursor-not-allowed"
                      style={{ right: speechSupported ? '48px' : '48px' }}
                    >
                      <PaperclipIcon className="w-4 h-4" />
                    </button>

                    {/* Submit button */}
                    <button
                      type="submit"
                      disabled={isLoading || !prompt.trim()}
                      className="absolute right-0 top-1/2 -translate-y-1/2 flex items-center justify-center h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-black text-white hover:bg-gray-800 disabled:bg-gray-300 disabled:text-gray-500 transition-all duration-200 cursor-pointer disabled:cursor-not-allowed"
                    >
                      {isLoading ? (
                        <div className="animate-spin rounded-full h-4 w-4 sm:h-5 sm:w-5 border-2 border-gray-600 border-t-transparent"></div>
                      ) : (
                        <svg
                          className="w-4 h-4 sm:w-5 sm:h-5"
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

                  {/* Attachments display */}
                  {attachments.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {attachments.map((attachment, index) => (
                        <div
                          key={index}
                          className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 rounded-lg text-sm text-gray-700"
                        >
                          <PaperclipIcon className="w-3 h-3" />
                          <span className="truncate max-w-32">
                            {attachment.name || 'Attachment'}
                          </span>
                          <button
                            type="button"
                            onClick={() => removeAttachment(index)}
                            className="text-gray-400 hover:text-gray-600 transition-colors"
                          >
                            <XIcon className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Controls under input */}
                  <div className="mt-2 sm:mt-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-3">
                    <div className="flex items-center justify-between sm:flex-1">
                      <div className="flex items-center gap-0 flex-1 max-w-[300px] sm:max-w-[400px]">
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
                        ) : currentProjectId &&
                          (projects.length === 0 ||
                            projectChats.length === 0) ? (
                          <div className="flex items-center gap-2">
                            <Skeleton className="h-8 w-32" />
                            <Skeleton className="h-8 w-24" />
                          </div>
                        ) : currentProjectId ? (
                          <div className="flex gap-0">
                            <div className="h-8 w-24 bg-transparent"></div>
                            <div className="h-8 w-20 bg-transparent"></div>
                          </div>
                        ) : null}
                      </div>

                      <div className="flex items-center gap-3">
                        {/* Desktop: v0.dev Link */}
                        <a
                          href={chatData?.url || 'https://v0.dev'}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hidden sm:block text-xs font-medium text-gray-500 hover:text-gray-700 transition-colors"
                        >
                          View on v0.dev
                        </a>

                        {/* Button group */}
                        <div className="flex items-center">
                          {/* Single More Options Menu */}
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0 ml-2 sm:ml-0"
                              >
                                <MoreVerticalIcon className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" side="top">
                              {/* Settings - Always available */}
                              <SettingsDialog />

                              {/* View on v0.dev - only show on mobile */}
                              <DropdownMenuItem asChild className="sm:hidden">
                                <a
                                  href={chatData?.url || 'https://v0.dev'}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center"
                                >
                                  <svg
                                    className="mr-2 h-4 w-4"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                                    />
                                  </svg>
                                  View on v0.dev
                                </a>
                              </DropdownMenuItem>

                              {/* Deploy - Only show when appropriate */}
                              {showDropdowns &&
                                currentProjectId &&
                                currentChatId &&
                                currentChatId !== 'new' &&
                                chatData &&
                                chatData.latestVersion &&
                                chatData.latestVersion.status === 'completed' && (
                                  <>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem
                                      onClick={handleDeploy}
                                      disabled={isDeploying}
                                    >
                                      <svg
                                        className="mr-2 h-4 w-4"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                      >
                                        <path
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                          strokeWidth={2}
                                          d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                                        />
                                      </svg>
                                      {isDeploying ? 'Deploying...' : 'Deploy'}
                                    </DropdownMenuItem>
                                  </>
                                )}

                              {/* Rename Chat */}
                              {showDropdowns &&
                                currentProjectId &&
                                currentChatId &&
                                currentChatId !== 'new' &&
                                onRenameChat &&
                                chatData && (
                                  <>
                                    <DropdownMenuSeparator />
                                    <RenameChatDialog
                                      chatId={currentChatId}
                                      currentName={chatData.name || 'Untitled Chat'}
                                      onRename={handleRenameChat}
                                      onOpenChange={setIsDialogOpen}
                                    />
                                  </>
                                )}

                              {/* Delete Chat */}
                              {showDropdowns &&
                                currentProjectId &&
                                currentChatId &&
                                currentChatId !== 'new' &&
                                onDeleteChat &&
                                chatData && (
                                  <>
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
                                          <AlertDialogTitle>Delete Chat</AlertDialogTitle>
                                          <AlertDialogDescription>
                                            Are you sure you want to delete this chat? This action cannot be undone.
                                          </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                                          <AlertDialogAction
                                            onClick={onDeleteChat}
                                            className="bg-destructive text-white hover:bg-destructive/90"
                                          >
                                            Delete
                                          </AlertDialogAction>
                                        </AlertDialogFooter>
                                      </AlertDialogContent>
                                    </AlertDialog>
                                  </>
                                )}
                            </DropdownMenuContent>
                          </DropdownMenu>

                          {/* Close button - only show on mobile */}
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 sm:hidden"
                            onClick={() => setIsPromptExpanded(false)}
                          >
                            <XIcon className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
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