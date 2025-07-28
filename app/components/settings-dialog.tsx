'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { DropdownMenuItem } from '@/components/ui/dropdown-menu'
import { SettingsIcon } from 'lucide-react'
import { Settings, ModelType, useSettings } from '../../lib/hooks/useSettings'

interface SettingsDialogProps {
  trigger?: React.ReactNode
}

export default function SettingsDialog({ trigger }: SettingsDialogProps) {
  const { settings, updateSettings } = useSettings()
  const [open, setOpen] = useState(false)
  const [tempSettings, setTempSettings] = useState<Settings>(settings)

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen)
    if (newOpen) {
      // Reset temp settings when opening
      setTempSettings(settings)
    }
  }

  const handleSave = () => {
    updateSettings(tempSettings)
    setOpen(false)
  }

  const handleCancel = () => {
    setTempSettings(settings)
    setOpen(false)
  }

  const ModelOption = ({
    value,
    label,
    description,
  }: {
    value: ModelType
    label: string
    description: string
  }) => (
    <label className="flex items-start space-x-3 p-3 rounded-lg border cursor-pointer hover:bg-gray-50 transition-colors">
      <input
        type="radio"
        name="model"
        value={value}
        checked={tempSettings.model === value}
        onChange={(e) =>
          setTempSettings({
            ...tempSettings,
            model: e.target.value as ModelType,
          })
        }
        className="mt-1"
      />
      <div className="flex-1">
        <div className="font-medium text-sm">{label}</div>
        <div className="text-xs text-gray-500">{description}</div>
      </div>
    </label>
  )

  const defaultTrigger = (
    <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
      <SettingsIcon className="mr-2 h-4 w-4" />
      Settings
    </DropdownMenuItem>
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
            <div className="space-y-2">
              <ModelOption
                value="v0-1.5-sm"
                label="v0-1.5-sm"
                description="Fast and efficient for simple apps"
              />
              <ModelOption
                value="v0-1.5-md"
                label="v0-1.5-md"
                description="Balanced performance and quality (default)"
              />
              <ModelOption
                value="v0-1.5-lg"
                label="v0-1.5-lg"
                description="Best quality for complex applications"
              />
            </div>
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
