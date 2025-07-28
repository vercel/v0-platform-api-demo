// components/iframe-component.tsx

'use client'

import { useState } from 'react'
import { LoadingComponent } from '@/components/loading-component'
import { ErrorComponent } from './error-component'

interface IFrameComponentProps {
  src?: string
  srcDoc?: string
  className?: string
  title?: string
  sandbox?: string
  sandboxNoHttp?: string
  onLoadingChange?: (loading: boolean) => void
  showLoadingSpinner?: boolean
  loadingComponent?: React.ReactNode
  errorComponent?: React.ReactNode
}

export const IFrameComponent = ({
  src,
  srcDoc,
  className,
  title,
  sandbox,
  sandboxNoHttp,
  onLoadingChange,
  showLoadingSpinner = true,
  loadingComponent,
  errorComponent
}: IFrameComponentProps) => {
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)

  const handleLoadStart = () => {
    setIsLoading(true)
    setHasError(false)
    onLoadingChange?.(true)
  }

const handleLoad = () => {
  console.log('IFrameComponent loaded successfully')
  setHasError(false)
  
  // Get the iframe's document
  const iframe = document.querySelector('iframe') as HTMLIFrameElement
  if (iframe?.contentDocument) {
    const iframeBody = iframe.contentDocument.body
    
    // Check if v0-loading class is removed
    const checkLoading = () => {
      if (!iframeBody.classList.contains('v0-loading')) {
        setIsLoading(false)
        onLoadingChange?.(false)
      } else {
        // Check again in 100ms
        setTimeout(checkLoading, 100)
      }
    }
    
    checkLoading()
  } else {
    // Fallback to timeout for cross-origin iframes
    setTimeout(() => {
      setIsLoading(false)
      onLoadingChange?.(false)
    }, 1000)
  }
}

  const handleError = () => {
    setIsLoading(false)
    setHasError(true)
    onLoadingChange?.(false)
  }

  // Determine if we're using src or srcDoc
  const isUrl = src || (srcDoc && (srcDoc.startsWith('http://') || srcDoc.startsWith('https://')))

  return (
    <div className="relative w-full h-full">
      {/* Show loading or error overlay */}
      {(isLoading && showLoadingSpinner) && (
        <div className="absolute inset-0 z-10">
          {loadingComponent ||
            <LoadingComponent
              message="Loading preview"
              color='#3bf692ff' // Default to Tailwind's blue-500
            />}
        </div>
      )}

      {hasError && (
        <div className="absolute inset-0 z-10">
          {errorComponent || 
          <ErrorComponent />
          }
        </div>
      )}

      {/* Iframe */}
      {isUrl || src ? (
        <iframe
          src={src || srcDoc}
          className={className || 'w-full h-full border-0'}
          title={title}
          sandbox={sandbox || 'allow-scripts allow-same-origin allow-modals allow-forms allow-popups allow-top-navigation-by-user-activation allow-pointer-lock'}
          onLoadStart={handleLoadStart}
          onLoad={handleLoad}
          onError={handleError}
        />
      ) : (
        <iframe
          srcDoc={srcDoc}
          className={className || 'w-full h-full border-0'}
          title={title || 'IFrame Preview'}
          sandbox={sandboxNoHttp || 'allow-scripts allow-same-origin allow-modals allow-forms allow-pointer-lock'}
          onLoad={handleLoad}
          onError={handleError}
        />
      )}
    </div>
  )
}

export default IFrameComponent
