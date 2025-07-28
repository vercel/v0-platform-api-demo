'use client'

import { useState, useEffect } from 'react'
import { XIcon, ChevronDownIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function DeployBanner() {
  const [isVisible, setIsVisible] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const [isAnimating, setIsAnimating] = useState(false)
  const [isExpanding, setIsExpanding] = useState(false)

  useEffect(() => {
    // Check if banner was previously minimized in this session
    const isMinimizedSession = sessionStorage.getItem('deploy-banner-minimized')
    if (isMinimizedSession === 'true') {
      setIsMinimized(true)
    }
    // Show banner after determining state
    setIsVisible(true)
  }, [])

  const handleToggle = () => {
    const newMinimized = !isMinimized
    
    if (!newMinimized) {
      // Expanding - animate down
      setIsMinimized(false)
      setIsExpanding(true)
      sessionStorage.setItem('deploy-banner-minimized', 'false')
      
      // After animation completes, clear expanding state
      setTimeout(() => {
        setIsExpanding(false)
      }, 300) // Match animation duration
    } else {
      // Minimizing - animate up first
      setIsAnimating(true)
      
      // After animation completes, actually minimize
      setTimeout(() => {
        setIsMinimized(true)
        setIsAnimating(false)
        sessionStorage.setItem('deploy-banner-minimized', 'true')
      }, 300) // Match animation duration
    }
  }

  if (!isVisible) return null

  return (
    <>
      {isMinimized ? (
        // Minimized state - floating toggle button
        <div className="fixed top-4 right-4 z-50">
          <Button
            variant="outline"
            size="sm"
            onClick={handleToggle}
            className="h-8 w-8 p-0 bg-background border-border shadow-lg hover:bg-muted"
          >
            <ChevronDownIcon className="h-4 w-4 rotate-180" />
            <span className="sr-only">Expand banner</span>
          </Button>
        </div>
      ) : (
        // Expanded state - full banner
        <div className={`fixed top-0 left-0 right-0 z-40 bg-background/80 backdrop-blur-md border-b border-border text-foreground ${
          isAnimating ? 'animate-slide-out-up' : isExpanding ? 'animate-slide-in-down' : ''
        }`}>
          <div className="py-3 px-4">
            <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
              <div className="flex flex-col gap-1 flex-1">
                <div className="flex items-center gap-2">
                  <svg className="h-5 w-5" viewBox="0 0 76 76" fill="none">
                    <path d="M38 1L74 74H2L38 1Z" fill="currentColor" />
                  </svg>
                  <span className="font-semibold">v0 Platform API Demo</span>
                </div>
                <div className="text-sm text-muted-foreground">
                  Deploy your own copy of this demo to get started building with
                  the v0 Platform API.
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Button variant="default" size="sm" asChild>
                  <a
                    href="https://vercel.com/new/clone?demo-description=A%20Next.js%20application%20demonstrating%20the%20v0%20Platform%20API&demo-image=%2F%2Fimages.ctfassets.net%2Fe5382hct74si%2F28EABpFanXbK3bENHYGPe7%2F2b37a0cf17f3f8f9a19ee23e539b62eb%2Fscreenshot.png&demo-title=v0%20Platform%20API%20Demo&demo-url=https%3A%2F%2Fv0-centered-text-om.vercel.sh%2F&from=templates&project-name=v0%20Platform%20API%20Demo&repository-name=v0-platform-api-demo&repository-url=https%3A%2F%2Fgithub.com%2Fvercel%2Fv0-platform-api-demo&skippable-integrations=1"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2"
                  >
                    <svg className="h-4 w-4" viewBox="0 0 76 76" fill="none">
                      <path d="M38 1L74 74H2L38 1Z" fill="currentColor" />
                    </svg>
                    <span className="hidden sm:inline">Deploy with Vercel</span>
                    <span className="sm:hidden">Deploy</span>
                  </a>
                </Button>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleToggle}
                  className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground hover:bg-muted"
                >
                  <ChevronDownIcon className="h-4 w-4" />
                  <span className="sr-only">Minimize banner</span>
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
