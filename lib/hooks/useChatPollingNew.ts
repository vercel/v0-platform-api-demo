import { useState, useEffect, useCallback, useRef } from 'react'
import { config } from '../config'
import { useDebugLogger } from './useDebugLogger'

export type ChatStatus = 'pending' | 'completed' | 'failed' | null

interface UseChatPollingOptions {
  chatId: string | null
  enabled?: boolean
  onStatusChange?: (status: ChatStatus) => void
}

export function useChatPolling({
  chatId,
  enabled = true,
  onStatusChange,
}: UseChatPollingOptions) {
  const [status, setStatus] = useState<ChatStatus>(null)
  const [error, setError] = useState<string | null>(null)
  const [isPolling, setIsPolling] = useState(false)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const { log, error: logError } = useDebugLogger({ componentName: 'useChatPolling' })

  const fetchChatStatus = useCallback(async () => {
    if (!chatId) return

    try {
      log(`Polling chat status for: ${chatId}`)
      const response = await fetch(`/api/new/chats/${chatId}`)
      
      if (!response.ok) {
        throw new Error(`Failed to fetch chat status: ${response.statusText}`)
      }

      const data = await response.json()
      const newStatus = data.status as ChatStatus

      if (newStatus !== status) {
        log(`Chat status changed: ${status} -> ${newStatus}`)
        setStatus(newStatus)
        setError(null)
        onStatusChange?.(newStatus)

        // Stop polling if completed or failed
        if (newStatus === 'completed' || newStatus === 'failed') {
          stopPolling()
        }
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error'
      logError(`Failed to poll chat status: ${errorMessage}`)
      setError(errorMessage)
    }
  }, [chatId, status, onStatusChange, log, logError])

  const startPolling = useCallback(() => {
    if (!chatId || !enabled) return

    log(`Starting polling for chat: ${chatId}`)
    setIsPolling(true)

    // Initial fetch
    fetchChatStatus()

    // Set up interval
    const frequency = config.get('pollingFrequency')
    intervalRef.current = setInterval(fetchChatStatus, frequency)
  }, [chatId, enabled, fetchChatStatus, log])

  const stopPolling = useCallback(() => {
    if (intervalRef.current) {
      log('Stopping polling')
      clearInterval(intervalRef.current)
      intervalRef.current = null
      setIsPolling(false)
    }
  }, [log])

  // Auto-start polling when chatId changes
  useEffect(() => {
    if (chatId && enabled) {
      startPolling()
    }

    return () => {
      stopPolling()
    }
  }, [chatId, enabled])

  return {
    status,
    error,
    isPolling,
    startPolling,
    stopPolling,
  }
}