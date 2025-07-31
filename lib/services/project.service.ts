// lib/services/project.service.ts
import { v0Service, type V0ServiceError, isSuccessResult, ServiceResult } from './v0.service'
import type { 
  ProjectSummary, 
  ProjectDetail, 
  ChatSummary, 
  ChatDetail, 
  UserDetail,
  ChatsGetByIdResponse 
} from './v0-sdk-types'

// Export V0 types directly - no more custom interfaces
export type { 
  ProjectSummary, 
  ProjectDetail, 
  ChatSummary, 
  ChatDetail, 
  UserDetail,
  ChatsGetByIdResponse 
}

export interface GenerateRequest {
  message: string
  modelId: string
  imageGenerations: boolean
  thinking: boolean
  attachments?: { url: string; name?: string; type?: string }[]
}

export interface GenerateResponse {
  id: string
  chatId: string
  projectId: string
}

export interface ApiValidationResult {
  isValid: boolean
  error?: string
  user?: UserDetail
}

class ProjectService {
  private retryAttempts = 3
  private retryDelay = 1000 // 1 second

  /**
   * Retry wrapper for V0 service calls
   */
  private async withRetry<T>(
    operation: () => Promise<ServiceResult<T>>,
    context: string
  ): Promise<T> {
    let lastError: V0ServiceError | undefined

    for (let attempt = 1; attempt <= this.retryAttempts; attempt++) {
      try {
        const result = await operation()
        
        if (isSuccessResult(result)) {
          return result.data
        } else {
          lastError = result.error
          
          // Don't retry on authentication errors
          if (result.error && result.error.code === 'API_KEY_ERROR') {
            throw result.error
          }

          // Don't retry on validation errors
          if (result.error && result.error.code === 'VALIDATION_ERROR') {
            throw result.error
          }

          // Don't retry on not found errors
          if (result.error && result.error.code === 'NOT_FOUND') {
            throw result.error
          }

          // Retry on rate limits and other errors
          if (attempt < this.retryAttempts) {
            await new Promise(resolve => setTimeout(resolve, this.retryDelay * attempt))
            continue
          }

          throw result.error
        }
      } catch (error) {
        if (error instanceof Error && error.name === 'V0ServiceError') {
          lastError = error as V0ServiceError
          
          // Same retry logic as above
          if (lastError.code === 'API_KEY_ERROR' || 
              lastError.code === 'VALIDATION_ERROR' || 
              lastError.code === 'NOT_FOUND') {
            throw lastError
          }
          
          if (attempt < this.retryAttempts) {
            await new Promise(resolve => setTimeout(resolve, this.retryDelay * attempt))
            continue
          }
        }
        
        throw error
      }
    }
    
    throw lastError || new Error(`${context} failed after ${this.retryAttempts} attempts`)
  }

  /**
   * Validate API key and get user information
   */
  async validateApiKey(): Promise<ApiValidationResult> {
    try {
      const result = await this.withRetry(
        () => v0Service.getUser(),
        'API key validation'
      )
      
      return {
        isValid: true,
        user: result,
      }
    } catch (error) {
      if (error instanceof Error && error.name === 'V0ServiceError') {
        const v0Error = error as V0ServiceError
        
        if (v0Error.code === 'API_KEY_ERROR') {
          return { isValid: false, error: 'API_KEY_MISSING' }
        }
        
        return { isValid: false, error: 'API_KEY_INVALID' }
      }
      
      return { isValid: false, error: 'VALIDATION_ERROR' }
    }
  }

  /**
   * Get all projects
   */
  async getProjects(): Promise<ProjectSummary[]> {
    try {
      const projects = await this.withRetry(
        () => v0Service.findProjects(),
        'Fetching projects'
      )
      
      return projects
    } catch (error) {
      if (error instanceof Error && error.name === 'V0ServiceError') {
        const v0Error = error as V0ServiceError
        if (v0Error.code === 'API_KEY_ERROR') {
          throw new Error('API_KEY_MISSING')
        }
      }
      
      console.error('Error fetching projects:', error)
      return []
    }
  }

  /**
   * Get a specific project with its chats
   */
  async getProject(projectId: string): Promise<{ project: ProjectDetail; chats: ChatSummary[] } | null> {
    try {
      const projectDetail = await this.withRetry(
        () => v0Service.getProject(projectId),
        'Fetching project'
      )
      
      return { 
        project: projectDetail, 
        chats: projectDetail.chats || [] 
      }
    } catch (error) {
      if (error instanceof Error && error.name === 'V0ServiceError') {
        const v0Error = error as V0ServiceError
        
        if (v0Error.code === 'API_KEY_ERROR') {
          throw new Error('API_KEY_MISSING')
        }
        
        if (v0Error.code === 'NOT_FOUND') {
          return null
        }
      }
      
      console.error('Error fetching project:', error)
      return null
    }
  }

  /**
   * Get chats for a specific project
   */
  async getProjectChats(projectId: string): Promise<ChatSummary[]> {
    try {
      const projectData = await this.getProject(projectId)
      return projectData?.chats || []
    } catch (error) {
      if (error instanceof Error && error.message === 'API_KEY_MISSING') {
        throw error
      }
      
      console.error('Error fetching project chats:', error)
      return []
    }
  }

  /**
   * Create a new project
   */
  async createProject(name: string, description?: string): Promise<ProjectDetail> {
    return await this.withRetry(
      () => v0Service.createProject({ name, description }),
      'Creating project'
    )
  }

  /**
   * Get or create a default project for new chats
   */
  async getOrCreateDefaultProject(): Promise<ProjectDetail> {
    try {
      const projects = await this.getProjects()
      
      // Look for existing default project
      const defaultProject = projects.find(p => p.name === 'Default Project')
      if (defaultProject) {
        // Get full project details
        const projectData = await this.getProject(defaultProject.id)
        return projectData!.project
      }
      
      // Create default project if none exists
      return await this.createProject('Default Project', 'Default project for new chats')
    } catch (error) {
      console.error('Error getting/creating default project:', error)
      throw error
    }
  }

  /**
   * Generate a new app/chat
   */
  async generateApp(request: GenerateRequest): Promise<GenerateResponse> {
    try {
      // Create the chat with V0
      const chatDetail = await this.withRetry(
        () => v0Service.createChat({
          message: request.message,
          modelConfiguration: {
            modelId: this.mapModelId(request.modelId),
            imageGenerations: request.imageGenerations,
            thinking: request.thinking,
          },
          attachments: request.attachments?.map(att => ({ url: att.url })),
        }),
        'Generating app'
      )

      // Get or create a default project for the chat
      const defaultProject = await this.getOrCreateDefaultProject()
      
      // Assign chat to project if V0 supports it and chat doesn't already have a project
      if (!chatDetail.projectId) {
        try {
          await this.withRetry(
            () => v0Service.assignChatToProject(defaultProject.id, chatDetail.id),
            'Assigning chat to project'
          )
        } catch (error) {
          // If assignment fails, continue - the chat still exists
          console.warn('Failed to assign chat to project:', error)
        }
      }

      return {
        id: chatDetail.id,
        chatId: chatDetail.id,
        projectId: chatDetail.projectId || defaultProject.id,
      }
    } catch (error) {
      if (error instanceof Error && error.name === 'V0ServiceError') {
        const v0Error = error as V0ServiceError
        
        if (v0Error.code === 'API_KEY_ERROR') {
          throw new Error('API_KEY_MISSING')
        }
        
        throw new Error(v0Error.message || 'Failed to generate app')
      }
      
      throw new Error('Failed to generate app')
    }
  }

  /**
   * Map our model IDs to V0's model IDs
   */
  private mapModelId(modelId: string): 'v0-1.5-sm' | 'v0-1.5-md' | 'v0-1.5-lg' {
    switch (modelId) {
      case 'gpt-3.5-turbo':
      case 'small':
        return 'v0-1.5-sm'
      case 'gpt-4':
      case 'medium':
        return 'v0-1.5-md'
      case 'large':
        return 'v0-1.5-lg'
      default:
        return 'v0-1.5-md' // Default to medium
    }
  }

  /**
   * Get a specific chat
   */
  async getChat(chatId: string): Promise<ChatsGetByIdResponse | null> {
    try {
      const result = await this.withRetry(
        () => v0Service.getChat(chatId),
        'Fetching chat'
      )
      
      return result
    } catch (error) {
      if (error instanceof Error && error.name === 'V0ServiceError') {
        const v0Error = error as V0ServiceError
        
        if (v0Error.code === 'API_KEY_ERROR') {
          throw new Error('API_KEY_MISSING')
        }
        
        if (v0Error.code === 'NOT_FOUND') {
          return null
        }
      }
      
      console.error('Error fetching chat:', error)
      return null
    }
  }

  /**
   * Send a message to an existing chat
   */
  async sendMessage(chatId: string, message: string, settings?: { modelId: string; imageGenerations: boolean; thinking: boolean }): Promise<any> {
    return await this.withRetry(
      () => v0Service.sendMessage(chatId, { 
        message,
        ...(settings && {
          modelConfiguration: {
            modelId: this.mapModelId(settings.modelId),
            imageGenerations: settings.imageGenerations,
            thinking: settings.thinking,
          }
        })
      }),
      'Sending message'
    )
  }

  /**
   * Update a chat (e.g., rename)
   */
  async updateChat(chatId: string, updates: { name?: string }): Promise<any> {
    return await this.withRetry(
      () => v0Service.updateChat(chatId, updates),
      'Updating chat'
    )
  }

  /**
   * Delete a chat
   */
  async deleteChat(chatId: string): Promise<boolean> {
    try {
      await this.withRetry(
        () => v0Service.deleteChat(chatId),
        'Deleting chat'
      )
      return true
    } catch (error) {
      console.error('Error deleting chat:', error)
      return false
    }
  }

  /**
   * Create a deployment
   */
  async createDeployment(projectId: string, chatId: string, versionId: string): Promise<any> {
    return await this.withRetry(
      () => v0Service.createDeployment({ projectId, chatId, versionId }),
      'Creating deployment'
    )
  }
}

export const projectService = new ProjectService()