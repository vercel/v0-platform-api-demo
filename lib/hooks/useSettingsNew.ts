// lib/hooks/useSettings.ts (optimized)
import { useState, useEffect, useCallback } from 'react'

export type ModelType = 'v0-1.5-sm' | 'v0-1.5-md' | 'v0-1.5-lg'

export interface Settings {
  model: ModelType
  imageGenerations: boolean
  thinking: boolean
}

const DEFAULT_SETTINGS: Settings = {
  model: 'v0-1.5-md',
  imageGenerations: false,
  thinking: false,
}

const STORAGE_KEY = 'v0-settings'

// Safe localStorage operations
const safeLocalStorage = {
  getItem: (key: string): string | null => {
    if (typeof window === 'undefined') return null
    try {
      return localStorage.getItem(key)
    } catch (error) {
      console.warn(`Failed to read from localStorage (${key}):`, error)
      return null
    }
  },
  
  setItem: (key: string, value: string): boolean => {
    if (typeof window === 'undefined') return false
    try {
      localStorage.setItem(key, value)
      return true
    } catch (error) {
      console.warn(`Failed to write to localStorage (${key}):`, error)
      return false
    }
  },
}

// Validate settings object
function validateSettings(settings: any): Settings {
  const validModels: ModelType[] = ['v0-1.5-sm', 'v0-1.5-md', 'v0-1.5-lg']
  
  return {
    model: validModels.includes(settings?.model) ? settings.model : DEFAULT_SETTINGS.model,
    imageGenerations: typeof settings?.imageGenerations === 'boolean' 
      ? settings.imageGenerations 
      : DEFAULT_SETTINGS.imageGenerations,
    thinking: typeof settings?.thinking === 'boolean' 
      ? settings.thinking 
      : DEFAULT_SETTINGS.thinking,
  }
}

export function useSettings() {
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS)
  const [isLoaded, setIsLoaded] = useState(false)

  // Load settings from localStorage on mount
  useEffect(() => {
    const loadSettings = () => {
      const saved = safeLocalStorage.getItem(STORAGE_KEY)
      if (saved) {
        try {
          const parsed = JSON.parse(saved)
          const validated = validateSettings(parsed)
          setSettings(validated)
        } catch (error) {
          console.warn('Failed to parse settings from localStorage:', error)
          // Keep default settings on parse error
        }
      }
      setIsLoaded(true)
    }

    loadSettings()
  }, [])

  // Save settings to localStorage when they change (but only after initial load)
  const updateSettings = useCallback((newSettings: Partial<Settings>) => {
    const updated = { ...settings, ...newSettings }
    const validated = validateSettings(updated)
    
    setSettings(validated)

    // Only save to localStorage after initial load to avoid overwriting during hydration
    if (isLoaded) {
      safeLocalStorage.setItem(STORAGE_KEY, JSON.stringify(validated))
    }
  }, [settings, isLoaded])

  // Reset to defaults
  const resetSettings = useCallback(() => {
    setSettings(DEFAULT_SETTINGS)
    safeLocalStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_SETTINGS))
  }, [])

  return {
    settings,
    updateSettings,
    resetSettings,
    isLoaded, // Useful for preventing hydration mismatches
  }
}