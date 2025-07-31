// app/components/settings-dialog.tsx (optimized)
'use client'

import { useState, useCallback } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { DropdownMenuItem as DialogDropdownMenuItem } from '@/components/ui/dropdown-menu'
import { SettingsIcon, ChevronDownIcon, CheckIcon } from 'lucide-react'
import { Settings, ModelType, useSettings } from '@/lib/hooks/useSettingsNew'

interface SettingsDialogProps {
  trigger?: React.ReactNode
}

export default function SettingsDialog({ trigger }: SettingsDialogProps) {
  const { settings, updateSettings } = useSettings()
  const [open, setOpen] = useState(false)
  const [tempSettings, setTempSettings] = useState<Settings>(settings)

  const handleOpenChange = useCallback((newOpen: boolean) => {
    setOpen(newOpen)
    if (newOpen) {
      // Reset temp settings when opening
      setTempSettings(settings)
    }
  }, [settings])

  const handleSave = useCallback(() => {
    updateSettings(tempSettings)
    setOpen(false)
  }, [tempSettings, updateSettings])

  const handleCancel = useCallback(() => {
    setTempSettings(settings)
    setOpen(false)
  }, [settings])

  const handleModelChange = useCallback((modelValue: ModelType) => {
    setTempSettings(prev => ({ ...prev, model: modelValue }))
  }, [])

  const handleImageGenerationsChange = useCallback((checked: boolean) => {
    setTempSettings(prev => ({ ...prev, imageGenerations: checked }))
  }, [])

  const handleThinkingChange = useCallback((checked: boolean) => {
    setTempSettings(prev => ({ ...prev, thinking: checked }))
  }, [])

  const modelOptions = [
    {
      value: 'v0-1.5-sm' as ModelType,
      label: 'v0-1.5-sm',
      description: 'Fast and efficient for simple apps',
    },
    {
      value: 'v0-1.5-md' as ModelType,
      label: 'v0-1.5-md',
      description: 'Balanced performance and quality (default)',
    },
    {
      value: 'v0-1.5-lg' as ModelType,
      label: 'v0-1.5-lg',
      description: 'Best quality for complex applications',
    },
  ]

  const currentModel = modelOptions.find(
    (option) => option.value === tempSettings.model,
  )

  const defaultTrigger = (
    <DialogDropdownMenuItem onSelect={(e) => e.preventDefault()}>
      <SettingsIcon className="mr-2 h-4 w-4" />
      Settings
    </DialogDropdownMenuItem>
  )

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild onClick={() => setOpen(true)}>
        {trigger || defaultTrigger}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Settings</DialogTitle>
          <DialogDescription>
            Configure your preferences for app generation.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Model Selection */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-gray-900">Model</h3>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="w-full justify-between">
                  <span className="font-medium">{currentModel?.label}</span>
                  <ChevronDownIcon className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-full min-w-[400px]">
                {modelOptions.map((option) => (
                  <DropdownMenuItem
                    key={option.value}
                    onClick={() => handleModelChange(option.value)}
                  >
                    <div className="flex items-center justify-between w-full">
                      <div className="flex flex-col">
                        <span className="font-medium">{option.label}</span>
                        <span className="text-xs text-gray-500">
                          {option.description}
                        </span>
                      </div>
                      {tempSettings.model === option.value && (
                        <CheckIcon className="h-4 w-4 text-primary" />
                      )}
                    </div>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Image Generations */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <h3 className="text-sm font-medium text-gray-900">
                Image Generations
              </h3>
              <p className="text-xs text-gray-500">
                Enable AI-generated images in your apps
              </p>
            </div>
            <Switch
              checked={tempSettings.imageGenerations}
              onCheckedChange={handleImageGenerationsChange}
            />
          </div>

          {/* Thinking */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <h3 className="text-sm font-medium text-gray-900">Thinking</h3>
              <p className="text-xs text-gray-500">
                Show AI reasoning process during generation
              </p>
            </div>
            <Switch
              checked={tempSettings.thinking}
              onCheckedChange={handleThinkingChange}
            />
          </div>
        </div>

        <div className="flex justify-end space-x-2 pt-4">
          <Button variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save Changes</Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}