'use client'

import { useState, useEffect } from 'react'
import { config } from '@/lib/config'
import { useDebugLogger } from '@/lib/hooks/useDebugLogger'
import { ChevronLeft, ChevronRight, X, Bug } from 'lucide-react'

export function DebugPanel() {
  const [isOpen, setIsOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<'info' | 'logs'>('logs')
  const { logs, clearLogs } = useDebugLogger()
  const position = config.get('debugPosition')

  // Component info state
  const [componentInfo, setComponentInfo] = useState({
    pathname: '',
    userAgent: '',
    screenSize: '',
    timestamp: new Date().toISOString(),
  })

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setComponentInfo({
        pathname: window.location.pathname,
        userAgent: navigator.userAgent,
        screenSize: `${window.innerWidth}x${window.innerHeight}`,
        timestamp: new Date().toISOString(),
      })
    }
  }, [])

  if (!config.get('debugEnabled')) {
    return null
  }

  const positionClasses = position === 'left' 
    ? 'left-0 rounded-r-lg' 
    : 'right-0 rounded-l-lg'

  const iconRotation = position === 'left'
    ? isOpen ? 'rotate-0' : 'rotate-180'
    : isOpen ? 'rotate-180' : 'rotate-0'

  return (
    <div
      className={`fixed top-20 ${position}-0 z-50 flex items-start`}
    >
      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`
          ${position === 'left' ? 'order-2 ml-0' : 'order-1 mr-0'}
          bg-gray-900 text-white p-2 shadow-lg hover:bg-gray-800 transition-colors
          ${isOpen ? 'rounded-none' : positionClasses}
        `}
      >
        <Bug className={`w-5 h-5 transition-transform ${iconRotation}`} />
      </button>

      {/* Panel Content */}
      {isOpen && (
        <div
          className={`
            ${position === 'left' ? 'order-1' : 'order-2'}
            bg-white border border-gray-200 shadow-xl w-96 max-h-[80vh] flex flex-col
            ${positionClasses}
          `}
        >
          {/* Header */}
          <div className="border-b border-gray-200 px-4 py-3 flex items-center justify-between">
            <h3 className="font-semibold text-gray-900">Debug Panel</h3>
            <button
              onClick={() => setIsOpen(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Tabs */}
          <div className="border-b border-gray-200 flex">
            <button
              onClick={() => setActiveTab('info')}
              className={`flex-1 px-4 py-2 text-sm font-medium transition-colors ${
                activeTab === 'info'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Component Info
            </button>
            <button
              onClick={() => setActiveTab('logs')}
              className={`flex-1 px-4 py-2 text-sm font-medium transition-colors ${
                activeTab === 'logs'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Debug Logs ({logs.length})
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-auto">
            {activeTab === 'info' ? (
              <div className="p-4 space-y-3">
                <InfoItem label="Path" value={componentInfo.pathname} />
                <InfoItem label="Screen" value={componentInfo.screenSize} />
                <InfoItem label="Time" value={new Date(componentInfo.timestamp).toLocaleTimeString()} />
                <InfoItem 
                  label="User Agent" 
                  value={componentInfo.userAgent}
                  className="text-xs break-all"
                />
              </div>
            ) : (
              <div className="p-4">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-sm text-gray-600">
                    {logs.length} log entries
                  </span>
                  <button
                    onClick={clearLogs}
                    className="text-sm text-blue-600 hover:text-blue-800"
                  >
                    Clear
                  </button>
                </div>
                <div className="space-y-2">
                  {logs.length === 0 ? (
                    <p className="text-sm text-gray-500 text-center py-4">
                      No debug logs yet
                    </p>
                  ) : (
                    logs.slice().reverse().map((log) => (
                      <LogEntry key={log.id} log={log} />
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

function InfoItem({ 
  label, 
  value, 
  className = '' 
}: { 
  label: string
  value: string
  className?: string 
}) {
  return (
    <div>
      <dt className="text-xs font-medium text-gray-500">{label}</dt>
      <dd className={`mt-1 text-sm text-gray-900 ${className}`}>{value}</dd>
    </div>
  )
}

function LogEntry({ log }: { log: any }) {
  const levelColors = {
    log: 'text-gray-600',
    info: 'text-blue-600',
    error: 'text-red-600',
  }

  return (
    <div className="border border-gray-100 rounded p-2 text-xs">
      <div className="flex items-start gap-2">
        <span className={`font-medium ${levelColors[log.level as keyof typeof levelColors]}`}>
          {log.level.toUpperCase()}
        </span>
        <span className="text-gray-500">
          {new Date(log.timestamp).toLocaleTimeString()}
        </span>
        {log.component && (
          <span className="text-purple-600 font-medium">
            [{log.component}]
          </span>
        )}
      </div>
      <div className="mt-1 text-gray-700">{log.message}</div>
      {log.data && (
        <pre className="mt-1 text-xs bg-gray-50 p-1 rounded overflow-x-auto">
          {JSON.stringify(log.data, null, 2)}
        </pre>
      )}
    </div>
  )
}