import { useState, useEffect, useCallback } from 'react'
import { debugLogger, LogEntry } from '../debug-logger'

interface UseDebugLoggerOptions {
  componentName?: string
}

export function useDebugLogger(options?: UseDebugLoggerOptions) {
  const [logs, setLogs] = useState<LogEntry[]>([])

  useEffect(() => {
    setLogs(debugLogger.getLogs())
    const unsubscribe = debugLogger.subscribe(setLogs)
    return unsubscribe
  }, [])

  const log = useCallback(
    (message: string, data?: any) => {
      debugLogger.log(message, options?.componentName, data)
    },
    [options?.componentName]
  )

  const info = useCallback(
    (message: string, data?: any) => {
      debugLogger.info(message, options?.componentName, data)
    },
    [options?.componentName]
  )

  const error = useCallback(
    (message: string, data?: any) => {
      debugLogger.error(message, options?.componentName, data)
    },
    [options?.componentName]
  )

  const clearLogs = useCallback(() => {
    debugLogger.clear()
  }, [])

  return {
    log,
    info,
    error,
    logs,
    clearLogs,
  }
}