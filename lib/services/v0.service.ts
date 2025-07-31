// lib/services/v0-service.ts
import { createClient } from 'v0-sdk'
import type {
  V0ClientConfig,
} from 'v0-sdk'
import type {
  ChatsCreateRequest,
  ChatsCreateResponse,
  ChatsInitRequest,
  ChatsInitResponse,
  ChatsUpdateRequest,
  ChatsUpdateResponse,
  ChatsSendMessageRequest,
  ChatsSendMessageResponse,
  ChatsFavoriteRequest,
  ChatsForkRequest,
  ChatDetail,
  ChatSummary,
  ProjectDetail,
  ProjectSummary,
  ProjectsCreateRequest,
  MessageDetail,
  DeploymentDetail,
  DeploymentsCreateRequest,
  HookDetail,
  HooksCreateRequest,
  HooksUpdateRequest,
  UserDetail,
  UserGetBillingResponse,
  VercelProjectDetail,
  ChatsGetByIdResponse,
  ChatsForkResponse,
} from './v0-sdk-types'

// Custom error types for better error handling
export class V0ServiceError extends Error {
  constructor(
    message: string,
    public code: string,
    public originalError?: unknown
  ) {
    super(message)
    this.name = 'V0ServiceError'
  }
}

export class V0ApiKeyError extends V0ServiceError {
  constructor() {
    super('V0 API key is missing or invalid', 'API_KEY_ERROR')
  }
}

export class V0NotFoundError extends V0ServiceError {
  constructor(resource: string) {
    super(`${resource} not found`, 'NOT_FOUND')
  }
}

export class V0RateLimitError extends V0ServiceError {
  constructor() {
    super('Rate limit exceeded', 'RATE_LIMIT_EXCEEDED')
  }
}

// Configuration interface
interface V0ServiceConfig extends V0ClientConfig {
  timeout?: number
  retryAttempts?: number
}

// Service result wrapper for better error handling
type ServiceResult<T> = {
  success: true
  data: T
} | {
  success: false
  error: V0ServiceError
}

/**
 * Comprehensive V0 Service for interacting with the V0 API
 * Provides type-safe methods with proper error handling and validation
 */
export class V0Service {
  private client: ReturnType<typeof createClient>
  private config: V0ServiceConfig

  constructor(config: V0ServiceConfig = {}) {
    this.config = {
      apiKey: process.env.V0_API_KEY,
      baseUrl: process.env.V0_BASE_URL,
      timeout: 30000,
      retryAttempts: 3,
      ...config,
    }

    if (!this.config.apiKey) {
      throw new V0ApiKeyError()
    }

    this.client = createClient({
      apiKey: this.config.apiKey,
      baseUrl: this.config.baseUrl,
    })
  }

  // ==================== CHAT METHODS ====================

  /**
   * Create a new chat with a message
   */
  async createChat(params: ChatsCreateRequest): Promise<ServiceResult<ChatDetail>> {
    try {
      this.validateMessage(params.message)
      const data = await this.client.chats.create(params)
      return { success: true, data }
    } catch (error) {
      return { success: false, error: this.handleError(error, 'Failed to create chat') }
    }
  }

  /**
   * Initialize a chat with files, repo, or registry
   */
  async initChat(params: ChatsInitRequest): Promise<ServiceResult<ChatsInitResponse>> {
    try {
      const data = await this.client.chats.init(params)
      return { success: true, data }
    } catch (error) {
      return { success: false, error: this.handleError(error, 'Failed to initialize chat') }
    }
  }

  /**
   * Find chats with optional filters
   */
  async findChats(params?: {
    limit?: string
    offset?: string
    isFavorite?: string
  }): Promise<ServiceResult<ChatSummary[]>> {
    try {
      const response = await this.client.chats.find(params)
      return { success: true, data: response.data }
    } catch (error) {
      return { success: false, error: this.handleError(error, 'Failed to find chats') }
    }
  }

  /**
   * Get a specific chat by ID
   */
  async getChat(chatId: string): Promise<ServiceResult<ChatsGetByIdResponse>> {
    try {
      this.validateId(chatId, 'chatId')
      const data = await this.client.chats.getById({ chatId })
      return { success: true, data }
    } catch (error) {
      return { success: false, error: this.handleError(error, 'Failed to get chat') }
    }
  }

  /**
   * Update chat properties
   */
  async updateChat(
    chatId: string,
    params: ChatsUpdateRequest
  ): Promise<ServiceResult<ChatsUpdateResponse>> {
    try {
      this.validateId(chatId, 'chatId')
      const data = await this.client.chats.update({ chatId, ...params })
      return { success: true, data }
    } catch (error) {
      return { success: false, error: this.handleError(error, 'Failed to update chat') }
    }
  }

  /**
   * Send a message to a chat
   */
  async sendMessage(
    chatId: string,
    params: ChatsSendMessageRequest
  ): Promise<ServiceResult<ChatsSendMessageResponse>> {
    try {
      this.validateId(chatId, 'chatId')
      this.validateMessage(params.message)
      const data = await this.client.chats.sendMessage({ chatId, ...params })
      return { success: true, data }
    } catch (error) {
      return { success: false, error: this.handleError(error, 'Failed to send message') }
    }
  }

  /**
   * Favorite or unfavorite a chat
   */
  async favoriteChat(
    chatId: string,
    isFavorite: boolean
  ): Promise<ServiceResult<{ id: string; object: 'chat'; favorited: boolean }>> {
    try {
      this.validateId(chatId, 'chatId')
      const data = await this.client.chats.favorite({ chatId, isFavorite })
      return { success: true, data }
    } catch (error) {
      return { success: false, error: this.handleError(error, 'Failed to favorite chat') }
    }
  }

  /**
   * Fork a chat
   */
  async forkChat(
    chatId: string,
    params?: ChatsForkRequest
  ): Promise<ServiceResult<ChatsForkResponse>> {
    try {
      this.validateId(chatId, 'chatId')
      const data = await this.client.chats.fork({ chatId, ...params })
      return { success: true, data }
    } catch (error) {
      return { success: false, error: this.handleError(error, 'Failed to fork chat') }
    }
  }

  /**
   * Resume a chat from a specific message
   */
  async resumeChat(chatId: string, messageId: string): Promise<ServiceResult<MessageDetail>> {
    try {
      this.validateId(chatId, 'chatId')
      this.validateId(messageId, 'messageId')
      const data = await this.client.chats.resume({ chatId, messageId })
      return { success: true, data }
    } catch (error) {
      return { success: false, error: this.handleError(error, 'Failed to resume chat') }
    }
  }

  /**
   * Delete a chat
   */
  async deleteChat(chatId: string): Promise<ServiceResult<{ id: string; object: 'chat'; deleted: true }>> {
    try {
      this.validateId(chatId, 'chatId')
      const data = await this.client.chats.delete({ chatId })
      return { success: true, data }
    } catch (error) {
      return { success: false, error: this.handleError(error, 'Failed to delete chat') }
    }
  }

  // ==================== PROJECT METHODS ====================

  /**
   * Find all projects
   */
  async findProjects(): Promise<ServiceResult<ProjectSummary[]>> {
    try {
      const response = await this.client.projects.find()
      return { success: true, data: response.data }
    } catch (error) {
      return { success: false, error: this.handleError(error, 'Failed to find projects') }
    }
  }

  /**
   * Create a new project
   */
  async createProject(params: ProjectsCreateRequest): Promise<ServiceResult<ProjectDetail>> {
    try {
      this.validateProjectName(params.name)
      const data = await this.client.projects.create(params)
      return { success: true, data }
    } catch (error) {
      return { success: false, error: this.handleError(error, 'Failed to create project') }
    }
  }

  /**
   * Get a project by ID
   */
  async getProject(projectId: string): Promise<ServiceResult<ProjectDetail>> {
    try {
      this.validateId(projectId, 'projectId')
      const data = await this.client.projects.getById({ projectId })
      return { success: true, data }
    } catch (error) {
      return { success: false, error: this.handleError(error, 'Failed to get project') }
    }
  }

  /**
   * Get project by chat ID
   */
  async getProjectByChatId(chatId: string): Promise<ServiceResult<ProjectDetail>> {
    try {
      this.validateId(chatId, 'chatId')
      const data = await this.client.projects.getByChatId({ chatId })
      return { success: true, data }
    } catch (error) {
      return { success: false, error: this.handleError(error, 'Failed to get project by chat ID') }
    }
  }

  /**
   * Assign a chat to a project
   */
  async assignChatToProject(
    projectId: string,
    chatId: string
  ): Promise<ServiceResult<{ object: 'project'; id: string; assigned: true }>> {
    try {
      this.validateId(projectId, 'projectId')
      this.validateId(chatId, 'chatId')
      const data = await this.client.projects.assign({ projectId, chatId })
      return { success: true, data }
    } catch (error) {
      return { success: false, error: this.handleError(error, 'Failed to assign chat to project') }
    }
  }

  // ==================== DEPLOYMENT METHODS ====================

  /**
   * Find deployments
   */
  async findDeployments(params: {
    projectId: string
    chatId: string
    versionId: string
  }): Promise<ServiceResult<DeploymentDetail[]>> {
    try {
      this.validateId(params.projectId, 'projectId')
      this.validateId(params.chatId, 'chatId')
      this.validateId(params.versionId, 'versionId')
      const response = await this.client.deployments.find(params)
      return { success: true, data: response.data }
    } catch (error) {
      return { success: false, error: this.handleError(error, 'Failed to find deployments') }
    }
  }

  /**
   * Create a deployment
   */
  async createDeployment(params: DeploymentsCreateRequest): Promise<ServiceResult<DeploymentDetail>> {
    try {
      this.validateId(params.projectId, 'projectId')
      this.validateId(params.chatId, 'chatId')
      this.validateId(params.versionId, 'versionId')
      const data = await this.client.deployments.create(params)
      return { success: true, data }
    } catch (error) {
      return { success: false, error: this.handleError(error, 'Failed to create deployment') }
    }
  }

  /**
   * Get deployment by ID
   */
  async getDeployment(deploymentId: string): Promise<ServiceResult<DeploymentDetail>> {
    try {
      this.validateId(deploymentId, 'deploymentId')
      const data = await this.client.deployments.getById({ deploymentId })
      return { success: true, data }
    } catch (error) {
      return { success: false, error: this.handleError(error, 'Failed to get deployment') }
    }
  }

  /**
   * Delete a deployment
   */
  async deleteDeployment(
    deploymentId: string
  ): Promise<ServiceResult<{ id: string; object: 'deployment'; deleted: true }>> {
    try {
      this.validateId(deploymentId, 'deploymentId')
      const data = await this.client.deployments.delete({ deploymentId })
      return { success: true, data }
    } catch (error) {
      return { success: false, error: this.handleError(error, 'Failed to delete deployment') }
    }
  }

  /**
   * Get deployment logs
   */
  async getDeploymentLogs(
    deploymentId: string,
    since?: string
  ): Promise<ServiceResult<{ error?: string; logs: string[]; nextSince?: number }>> {
    try {
      this.validateId(deploymentId, 'deploymentId')
      const data = await this.client.deployments.findLogs({ deploymentId, since })
      return { success: true, data }
    } catch (error) {
      return { success: false, error: this.handleError(error, 'Failed to get deployment logs') }
    }
  }

  /**
   * Get deployment errors
   */
  async getDeploymentErrors(
    deploymentId: string
  ): Promise<ServiceResult<{
    error?: string
    fullErrorText?: string
    errorType?: string
    formattedError?: string
  }>> {
    try {
      this.validateId(deploymentId, 'deploymentId')
      const data = await this.client.deployments.findErrors({ deploymentId })
      return { success: true, data }
    } catch (error) {
      return { success: false, error: this.handleError(error, 'Failed to get deployment errors') }
    }
  }

  // ==================== WEBHOOK METHODS ====================

  /**
   * Find all hooks
   */
  async findHooks(): Promise<ServiceResult<{ id: string; object: 'hook'; name: string }[]>> {
    try {
      const response = await this.client.hooks.find()
      return { success: true, data: response.data }
    } catch (error) {
      return { success: false, error: this.handleError(error, 'Failed to find hooks') }
    }
  }

  /**
   * Create a webhook
   */
  async createHook(params: HooksCreateRequest): Promise<ServiceResult<HookDetail>> {
    try {
      this.validateUrl(params.url)
      const data = await this.client.hooks.create(params)
      return { success: true, data }
    } catch (error) {
      return { success: false, error: this.handleError(error, 'Failed to create hook') }
    }
  }

  /**
   * Get hook by ID
   */
  async getHook(hookId: string): Promise<ServiceResult<HookDetail>> {
    try {
      this.validateId(hookId, 'hookId')
      const data = await this.client.hooks.getById({ hookId })
      return { success: true, data }
    } catch (error) {
      return { success: false, error: this.handleError(error, 'Failed to get hook') }
    }
  }

  /**
   * Update a webhook
   */
  async updateHook(hookId: string, params: HooksUpdateRequest): Promise<ServiceResult<HookDetail>> {
    try {
      this.validateId(hookId, 'hookId')
      if (params.url) this.validateUrl(params.url)
      const data = await this.client.hooks.update({ hookId, ...params })
      return { success: true, data }
    } catch (error) {
      return { success: false, error: this.handleError(error, 'Failed to update hook') }
    }
  }

  /**
   * Delete a webhook
   */
  async deleteHook(hookId: string): Promise<ServiceResult<{ id: string; object: 'hook'; deleted: true }>> {
    try {
      this.validateId(hookId, 'hookId')
      const data = await this.client.hooks.delete({ hookId })
      return { success: true, data }
    } catch (error) {
      return { success: false, error: this.handleError(error, 'Failed to delete hook') }
    }
  }

  // ==================== USER METHODS ====================

  /**
   * Get current user information
   */
  async getUser(): Promise<ServiceResult<UserDetail>> {
    try {
      const data = await this.client.user.get()
      return { success: true, data }
    } catch (error) {
      return { success: false, error: this.handleError(error, 'Failed to get user') }
    }
  }

  /**
   * Get user billing information
   */
  async getUserBilling(scope?: string): Promise<ServiceResult<UserGetBillingResponse>> {
    try {
      const data = await this.client.user.getBilling({ scope })
      return { success: true, data }
    } catch (error) {
      return { success: false, error: this.handleError(error, 'Failed to get user billing') }
    }
  }

  /**
   * Get user plan information
   */
  async getUserPlan(): Promise<ServiceResult<{
    object: 'plan'
    plan: string
    billingCycle: { start: number; end: number }
    balance: { remaining: number; total: number }
  }>> {
    try {
      const data = await this.client.user.getPlan()
      return { success: true, data }
    } catch (error) {
      return { success: false, error: this.handleError(error, 'Failed to get user plan') }
    }
  }

  /**
   * Get user scopes
   */
  async getUserScopes(): Promise<ServiceResult<{ id: string; object: 'scope'; name?: string }[]>> {
    try {
      const response = await this.client.user.getScopes()
      return { success: true, data: response.data }
    } catch (error) {
      return { success: false, error: this.handleError(error, 'Failed to get user scopes') }
    }
  }

  // ==================== RATE LIMITS ====================

  /**
   * Get rate limit information
   */
  async getRateLimits(scope?: string): Promise<ServiceResult<{
    remaining?: number
    reset?: number
    limit: number
  }>> {
    try {
      const data = await this.client.rateLimits.find({ scope })
      return { success: true, data }
    } catch (error) {
      return { success: false, error: this.handleError(error, 'Failed to get rate limits') }
    }
  }

  // ==================== VERCEL INTEGRATION ====================

  /**
   * Find Vercel projects
   */
  async findVercelProjects(): Promise<ServiceResult<VercelProjectDetail[]>> {
    try {
      const response = await this.client.integrations.vercel.projects.find()
      return { success: true, data: response.data }
    } catch (error) {
      return { success: false, error: this.handleError(error, 'Failed to find Vercel projects') }
    }
  }

  /**
   * Create Vercel project integration
   */
  async createVercelProject(params: {
    projectId: string
    name: string
  }): Promise<ServiceResult<VercelProjectDetail>> {
    try {
      this.validateId(params.projectId, 'projectId')
      this.validateProjectName(params.name)
      const data = await this.client.integrations.vercel.projects.create(params)
      return { success: true, data }
    } catch (error) {
      return { success: false, error: this.handleError(error, 'Failed to create Vercel project') }
    }
  }

  // ==================== UTILITY METHODS ====================

  /**
   * Health check for the service
   */
  async healthCheck(): Promise<ServiceResult<{ status: 'healthy' | 'unhealthy'; timestamp: string }>> {
    try {
      // Try to fetch user info as a health check
      const userResult = await this.getUser()
      if (userResult.success) {
        return {
          success: true,
          data: { status: 'healthy', timestamp: new Date().toISOString() }
        }
      } else {
        return {
          success: true,
          data: { status: 'unhealthy', timestamp: new Date().toISOString() }
        }
      }
    } catch (error) {
      return {
        success: false,
        error: this.handleError(error, 'Health check failed')
      }
    }
  }

  // ==================== PRIVATE VALIDATION METHODS ====================

  private validateId(id: string, fieldName: string): void {
    if (!id || typeof id !== 'string' || id.trim().length === 0) {
      throw new V0ServiceError(`Invalid ${fieldName}: must be a non-empty string`, 'VALIDATION_ERROR')
    }
  }

  private validateMessage(message: string): void {
    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      throw new V0ServiceError('Invalid message: must be a non-empty string', 'VALIDATION_ERROR')
    }
    if (message.length > 10000) {
      throw new V0ServiceError('Message too long: maximum 10,000 characters', 'VALIDATION_ERROR')
    }
  }

  private validateProjectName(name: string): void {
    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      throw new V0ServiceError('Invalid project name: must be a non-empty string', 'VALIDATION_ERROR')
    }
    if (name.length > 100) {
      throw new V0ServiceError('Project name too long: maximum 100 characters', 'VALIDATION_ERROR')
    }
  }

  private validateUrl(url: string): void {
    if (!url || typeof url !== 'string') {
      throw new V0ServiceError('Invalid URL: must be a non-empty string', 'VALIDATION_ERROR')
    }
    try {
      new URL(url)
    } catch {
      throw new V0ServiceError('Invalid URL format', 'VALIDATION_ERROR')
    }
  }

  // ==================== ERROR HANDLING ====================

  private handleError(error: unknown, defaultMessage: string): V0ServiceError {
    if (error instanceof V0ServiceError) {
      return error
    }

    if (error instanceof Error) {
      const message = error.message.toLowerCase()
      
      // API key errors
      if (message.includes('api key') || message.includes('unauthorized') || message.includes('401')) {
        return new V0ApiKeyError()
      }
      
      // Rate limit errors
      if (message.includes('rate limit') || message.includes('429')) {
        return new V0RateLimitError()
      }
      
      // Not found errors
      if (message.includes('not found') || message.includes('404')) {
        return new V0NotFoundError('Resource')
      }
      
      return new V0ServiceError(`${defaultMessage}: ${error.message}`, 'API_ERROR', error)
    }

    return new V0ServiceError(defaultMessage, 'UNKNOWN_ERROR', error)
  }
}

// ==================== SINGLETON INSTANCE ====================

/**
 * Default singleton instance for server-side usage
 * Uses environment variables for configuration
 */
export const v0Service = new V0Service()

// ==================== HELPER FUNCTIONS ====================

/**
 * Create a custom V0 service instance with specific configuration
 */
export function createV0Service(config: V0ServiceConfig): V0Service {
  return new V0Service(config)
}

/**
 * Check if a result is successful
 */
export function isSuccessResult<T>(result: ServiceResult<T>): result is { success: true; data: T } {
  return result.success === true
}

/**
 * Check if a result is an error
 */
export function isErrorResult<T>(result: ServiceResult<T>): result is { success: false; error: V0ServiceError } {
  return result.success === false
}

// ==================== TYPE EXPORTS ====================

export type {
  ServiceResult,
  V0ServiceConfig,
  ChatsCreateRequest,
  ChatsCreateResponse,
  ChatsInitRequest,
  ChatsInitResponse,
  ChatDetail,
  ChatSummary,
  ProjectDetail,
  ProjectSummary,
  MessageDetail,
  DeploymentDetail,
  HookDetail,
  UserDetail,
}

