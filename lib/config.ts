export interface AppConfig {
  pollingFrequency: number // in milliseconds
  debugEnabled: boolean
  debugPosition: 'left' | 'right'
}

class ConfigManager {
  private static instance: ConfigManager
  private config: AppConfig

  private constructor() {
    this.config = {
      pollingFrequency: parseInt(process.env.NEXT_PUBLIC_POLLING_FREQUENCY || '3000', 10), // 3000 milliseconds = 3 seconds
      debugEnabled: process.env.NEXT_PUBLIC_DEBUG_ENABLED === 'true' || process.env.NODE_ENV === 'development',
      debugPosition: (process.env.NEXT_PUBLIC_DEBUG_POSITION as 'left' | 'right') || 'right',
    }
  }

  static getInstance(): ConfigManager {
    if (!ConfigManager.instance) {
      ConfigManager.instance = new ConfigManager()
    }
    return ConfigManager.instance
  }

  get<K extends keyof AppConfig>(key: K): AppConfig[K] {
    return this.config[key]
  }

  set<K extends keyof AppConfig>(key: K, value: AppConfig[K]): void {
    this.config[key] = value
  }

  getAll(): AppConfig {
    return { ...this.config }
  }
}

export const config = ConfigManager.getInstance()