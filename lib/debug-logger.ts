import { config } from './config'

export type LogLevel = 'log' | 'info' | 'error'

export interface LogEntry {
  id: string
  timestamp: Date
  level: LogLevel
  component?: string
  message: string
  data?: any
}

class DebugLogger {
  private static instance: DebugLogger
  private logs: LogEntry[] = []
  private listeners: Set<(logs: LogEntry[]) => void> = new Set()
  private maxLogs = 1000 // Prevent memory issues

  private constructor() {}

  static getInstance(): DebugLogger {
    if (!DebugLogger.instance) {
      DebugLogger.instance = new DebugLogger()
    }
    return DebugLogger.instance
  }

  private addLog(level: LogLevel, message: string, component?: string, data?: any): void {
    if (!config.get('debugEnabled')) return

    const entry: LogEntry = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      level,
      component,
      message,
      data,
    }

    this.logs.push(entry)

    // Keep logs under max limit
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(-this.maxLogs)
    }

    // Notify listeners
    this.notifyListeners()

    // Also log to console in development
    if (process.env.NODE_ENV === 'development') {
      const prefix = component ? `[${component}]` : ''
      console[level](`${prefix} ${message}`, data || '')
    }
  }

  log(message: string, component?: string, data?: any): void {
    this.addLog('log', message, component, data)
  }

  info(message: string, component?: string, data?: any): void {
    this.addLog('info', message, component, data)
  }

  error(message: string, component?: string, data?: any): void {
    this.addLog('error', message, component, data)
  }

  clear(): void {
    this.logs = []
    this.notifyListeners()
  }

  getLogs(): LogEntry[] {
    return [...this.logs]
  }

  subscribe(listener: (logs: LogEntry[]) => void): () => void {
    this.listeners.add(listener)
    return () => {
      this.listeners.delete(listener)
    }
  }

  private notifyListeners(): void {
    const logs = this.getLogs()
    this.listeners.forEach(listener => listener(logs))
  }
}

export const debugLogger = DebugLogger.getInstance()