// lib/services/v0-sdk-types.ts

export type ChatDetail = {
    id: string;
    object: 'chat';
    shareable: boolean;
    privacy: 'public' | 'private' | 'team' | 'team-edit' | 'unlisted';
    name?: string;
    /** @deprecated */
    title?: string;
    updatedAt?: string;
    favorite: boolean;
    authorId: string;
    projectId?: string;
    latestVersion?: {
        id: string;
        object: 'version';
        status: 'pending' | 'completed' | 'failed';
        demoUrl?: string;
        files: {
            object: 'file';
            name: string;
            content: string;
        }[];
    };
    url: string;
    messages: Array<{
        id: string;
        object: 'message';
        content: string;
        createdAt: string;
        type: 'message' | 'forked-block' | 'forked-chat' | 'open-in-v0' | 'refinement' | 'added-environment-variables' | 'added-integration' | 'deleted-file' | 'moved-file' | 'renamed-file' | 'edited-file' | 'replace-src' | 'reverted-block' | 'fix-with-v0' | 'auto-fix-with-v0' | 'sync-git';
        role: 'user' | 'assistant';
    }>;
    files?: {
        lang: string;
        meta: Record<string, any>;
        source: string;
    }[];
    /** @deprecated */
    demo?: string;
    text: string;
    modelConfiguration: {
        modelId: 'v0-1.5-sm' | 'v0-1.5-md' | 'v0-1.5-lg';
        imageGenerations?: boolean;
        thinking?: boolean;
    };
};
export type ChatSummary = {
    id: string;
    object: 'chat';
    shareable: boolean;
    privacy: 'public' | 'private' | 'team' | 'team-edit' | 'unlisted';
    name?: string;
    /** @deprecated */
    title?: string;
    updatedAt?: string;
    favorite: boolean;
    authorId: string;
    projectId?: string;
    latestVersion?: {
        id: string;
        object: 'version';
        status: 'pending' | 'completed' | 'failed';
        demoUrl?: string;
    };
};
export interface DeploymentDetail {
    id: string;
    object: 'deployment';
    inspectorUrl: string;
    chatId: string;
    projectId: string;
    versionId: string;
    apiUrl: string;
    webUrl: string;
}
export interface FileDetail {
    object: 'file';
    name: string;
    content: string;
}
export type HookDetail = {
    id: string;
    object: 'hook';
    name: string;
    events: Array<'chat.created' | 'chat.updated' | 'chat.deleted' | 'message.created' | 'message.updated' | 'message.deleted' | 'project.created' | 'project.updated' | 'project.deleted'>;
    chatId?: string;
    projectId?: string;
    url: string;
};
export interface HookSummary {
    id: string;
    object: 'hook';
    name: string;
}
export type MessageDetail = {
    id: string;
    object: 'message';
    chatId: string;
    url: string;
    files: {
        object: 'file';
        name: string;
    }[];
    demo?: string;
    text: string;
    modelConfiguration: {
        modelId: 'v0-1.5-sm' | 'v0-1.5-md' | 'v0-1.5-lg';
        imageGenerations?: boolean;
        thinking?: boolean;
    };
};
export type MessageSummary = {
    id: string;
    object: 'message';
    content: string;
    createdAt: string;
    type: 'message' | 'forked-block' | 'forked-chat' | 'open-in-v0' | 'refinement' | 'added-environment-variables' | 'added-integration' | 'deleted-file' | 'moved-file' | 'renamed-file' | 'edited-file' | 'replace-src' | 'reverted-block' | 'fix-with-v0' | 'auto-fix-with-v0' | 'sync-git';
    role: 'user' | 'assistant';
};
export type ProjectDetail = {
    id: string;
    object: 'project';
    name: string;
    vercelProjectId?: string;
    createdAt: string;
    updatedAt?: string;
    apiUrl: string;
    webUrl: string;
    chats: Array<{
        id: string;
        object: 'chat';
        shareable: boolean;
        privacy: 'public' | 'private' | 'team' | 'team-edit' | 'unlisted';
        name?: string;
        /** @deprecated */
        title?: string;
        updatedAt?: string;
        favorite: boolean;
        authorId: string;
        projectId?: string;
        latestVersion?: {
            id: string;
            object: 'version';
            status: 'pending' | 'completed' | 'failed';
            demoUrl?: string;
        };
    }>;
};
export interface ProjectSummary {
    id: string;
    object: 'project';
    name: string;
    vercelProjectId?: string;
    createdAt: string;
    updatedAt?: string;
    apiUrl: string;
    webUrl: string;
}
export interface ScopeSummary {
    id: string;
    object: 'scope';
    name?: string;
}
export interface UserDetail {
    id: string;
    object: 'user';
    name?: string;
    email: string;
    avatar: string;
}
export interface VercelProjectDetail {
    id: string;
    object: 'vercel_project';
    name: string;
}
export interface ChatsCreateRequest {
    message: string;
    attachments?: {
        url: string;
    }[];
    system?: string;
    chatPrivacy?: 'public' | 'private' | 'team-edit' | 'team' | 'unlisted';
    projectId?: string;
    modelConfiguration?: {
        modelId: 'v0-1.5-sm' | 'v0-1.5-md' | 'v0-1.5-lg';
        imageGenerations?: boolean;
        thinking?: boolean;
    };
    responseMode?: 'sync' | 'async';
}
export type ChatsCreateResponse = ChatDetail;
export interface ChatsFindResponse {
    object: 'list';
    data: ChatSummary[];
}
export type ChatsInitRequest = {
    name?: string;
    chatPrivacy?: 'public' | 'private' | 'team-edit' | 'team' | 'unlisted';
    projectId?: string;
} & ({
    type: 'files';
    files: Array<{
        name: string;
        url: string;
        content?: never;
    } | {
        name: string;
        content: string;
        url?: never;
    }>;
    repo?: never;
    registry?: never;
    zip?: never;
} | {
    type: 'repo';
    repo: {
        url: string;
        branch?: string;
    };
    files?: never;
    registry?: never;
    zip?: never;
} | {
    type: 'registry';
    registry: {
        url: string;
    };
    files?: never;
    repo?: never;
    zip?: never;
} | {
    type: 'zip';
    zip: {
        url: string;
    };
    files?: never;
    repo?: never;
    registry?: never;
});
export type ChatsInitResponse = {
    id: string;
    object: 'chat';
    shareable: boolean;
    privacy: 'public' | 'private' | 'team' | 'team-edit' | 'unlisted';
    name?: string;
    /** @deprecated */
    title?: string;
    updatedAt?: string;
    favorite: boolean;
    authorId: string;
    projectId?: string;
    latestVersion?: {
        id: string;
        object: 'version';
        status: 'pending' | 'completed' | 'failed';
        demoUrl?: string;
        files: FileDetail[];
    };
    url: string;
    messages: MessageSummary[];
    files?: {
        lang: string;
        meta: Record<string, any>;
        source: string;
    }[];
    /** @deprecated */
    demo?: string;
    text: string;
};
export interface ChatsDeleteResponse {
    id: string;
    object: 'chat';
    deleted: true;
}
export type ChatsGetByIdResponse = {
    id: string;
    object: 'chat';
    shareable: boolean;
    privacy: 'public' | 'private' | 'team' | 'team-edit' | 'unlisted';
    name?: string;
    /** @deprecated */
    title?: string;
    updatedAt?: string;
    favorite: boolean;
    authorId: string;
    projectId?: string;
    latestVersion?: {
        id: string;
        object: 'version';
        status: 'pending' | 'completed' | 'failed';
        demoUrl?: string;
        files: FileDetail[];
    };
    url: string;
    messages: MessageSummary[];
    files?: {
        lang: string;
        meta: Record<string, any>;
        source: string;
    }[];
    /** @deprecated */
    demo?: string;
    text: string;
};
export interface ChatsUpdateRequest {
    name?: string;
    privacy?: 'public' | 'private' | 'team' | 'team-edit' | 'unlisted';
}
export type ChatsUpdateResponse = {
    id: string;
    object: 'chat';
    shareable: boolean;
    privacy: 'public' | 'private' | 'team' | 'team-edit' | 'unlisted';
    name?: string;
    /** @deprecated */
    title?: string;
    updatedAt?: string;
    favorite: boolean;
    authorId: string;
    projectId?: string;
    latestVersion?: {
        id: string;
        object: 'version';
        status: 'pending' | 'completed' | 'failed';
        demoUrl?: string;
        files: FileDetail[];
    };
    url: string;
    messages: MessageSummary[];
    files?: {
        lang: string;
        meta: Record<string, any>;
        source: string;
    }[];
    /** @deprecated */
    demo?: string;
    text: string;
};
export interface ChatsFavoriteRequest {
    isFavorite: boolean;
}
export interface ChatsFavoriteResponse {
    id: string;
    object: 'chat';
    favorited: boolean;
}
export interface ChatsForkRequest {
    versionId?: string;
}
export type ChatsForkResponse = {
    id: string;
    object: 'chat';
    shareable: boolean;
    privacy: 'public' | 'private' | 'team' | 'team-edit' | 'unlisted';
    name?: string;
    /** @deprecated */
    title?: string;
    updatedAt?: string;
    favorite: boolean;
    authorId: string;
    projectId?: string;
    latestVersion?: {
        id: string;
        object: 'version';
        status: 'pending' | 'completed' | 'failed';
        demoUrl?: string;
        files: FileDetail[];
    };
    url: string;
    messages: MessageSummary[];
    files?: {
        lang: string;
        meta: Record<string, any>;
        source: string;
    }[];
    /** @deprecated */
    demo?: string;
    text: string;
};
export type ProjectsGetByChatIdResponse = ProjectDetail;
export interface ChatsSendMessageRequest {
    message: string;
    attachments?: {
        url: string;
    }[];
    modelConfiguration?: {
        modelId: 'v0-1.5-sm' | 'v0-1.5-md' | 'v0-1.5-lg';
        imageGenerations?: boolean;
        thinking?: boolean;
    };
    responseMode?: 'sync' | 'async';
}
export type ChatsSendMessageResponse = {
    id: string;
    object: 'chat';
    shareable: boolean;
    privacy: 'public' | 'private' | 'team' | 'team-edit' | 'unlisted';
    name?: string;
    /** @deprecated */
    title?: string;
    updatedAt?: string;
    favorite: boolean;
    authorId: string;
    projectId?: string;
    latestVersion?: {
        id: string;
        object: 'version';
        status: 'pending' | 'completed' | 'failed';
        demoUrl?: string;
        files: FileDetail[];
    };
    url: string;
    messages: MessageSummary[];
    files?: {
        lang: string;
        meta: Record<string, any>;
        source: string;
    }[];
    /** @deprecated */
    demo?: string;
    text: string;
    modelConfiguration: {
        modelId: 'v0-1.5-sm' | 'v0-1.5-md' | 'v0-1.5-lg';
        imageGenerations?: boolean;
        thinking?: boolean;
    };
    chatId: string;
};
export type ChatsResumeResponse = MessageDetail;
export interface DeploymentsFindResponse {
    object: 'list';
    data: DeploymentDetail[];
}
export interface DeploymentsCreateRequest {
    projectId: string;
    chatId: string;
    versionId: string;
}
export type DeploymentsCreateResponse = DeploymentDetail;
export type DeploymentsGetByIdResponse = DeploymentDetail;
export interface DeploymentsDeleteResponse {
    id: string;
    object: 'deployment';
    deleted: true;
}
export interface DeploymentsFindLogsResponse {
    error?: string;
    logs: string[];
    nextSince?: number;
}
export interface DeploymentsFindErrorsResponse {
    error?: string;
    fullErrorText?: string;
    errorType?: string;
    formattedError?: string;
}
export interface HooksFindResponse {
    object: 'list';
    data: HookSummary[];
}
export interface HooksCreateRequest {
    name: string;
    events: Array<'chat.created' | 'chat.updated' | 'chat.deleted' | 'message.created' | 'message.updated' | 'message.deleted' | 'project.created' | 'project.updated' | 'project.deleted'>;
    chatId?: string;
    projectId?: string;
    url: string;
}
export type HooksCreateResponse = HookDetail;
export type HooksGetByIdResponse = HookDetail;
export interface HooksUpdateRequest {
    name?: string;
    events?: Array<'chat.created' | 'chat.updated' | 'chat.deleted' | 'message.created' | 'message.updated' | 'message.deleted' | 'project.created' | 'project.updated' | 'project.deleted'>;
    url?: string;
}
export type HooksUpdateResponse = HookDetail;
export interface HooksDeleteResponse {
    id: string;
    object: 'hook';
    deleted: true;
}
export interface IntegrationsVercelProjectsFindResponse {
    object: 'list';
    data: VercelProjectDetail[];
}
export interface IntegrationsVercelProjectsCreateRequest {
    projectId: string;
    name: string;
}
export type IntegrationsVercelProjectsCreateResponse = VercelProjectDetail;
export interface ProjectsFindResponse {
    object: 'list';
    data: ProjectSummary[];
}
export interface ProjectsCreateRequest {
    name: string;
    description?: string;
    icon?: string;
    environmentVariables?: {
        key: string;
        value: string;
    }[];
    instructions?: string;
}
export type ProjectsCreateResponse = ProjectDetail;
export type ProjectsGetByIdResponse = ProjectDetail;
export interface ProjectsAssignRequest {
    chatId: string;
}
export interface ProjectsAssignResponse {
    object: 'project';
    id: string;
    assigned: true;
}
export interface RateLimitsFindResponse {
    remaining?: number;
    reset?: number;
    limit: number;
}
export type UserGetResponse = UserDetail;
export type UserGetBillingResponse = {
    billingType: 'token';
    data: {
        plan: string;
        billingMode?: 'test';
        role: string;
        billingCycle: {
            start: number;
            end: number;
        };
        balance: {
            remaining: number;
            total: number;
        };
        onDemand: {
            balance: number;
            blocks?: {
                expirationDate?: number;
                effectiveDate: number;
                originalBalance: number;
                currentBalance: number;
            }[];
        };
    };
} | {
    billingType: 'legacy';
    data: {
        remaining?: number;
        reset?: number;
        limit: number;
    };
};
export interface UserGetPlanResponse {
    object: 'plan';
    plan: string;
    billingCycle: {
        start: number;
        end: number;
    };
    balance: {
        remaining: number;
        total: number;
    };
}
export interface UserGetScopesResponse {
    object: 'list';
    data: ScopeSummary[];
}
export interface V0ClientConfig {
    apiKey?: string;
    baseUrl?: string;
}
declare function createClient(config?: V0ClientConfig): {
    chats: {
        create(params: ChatsCreateRequest): Promise<ChatsCreateResponse>;
        find(params?: {
            limit?: string;
            offset?: string;
            isFavorite?: string;
        }): Promise<ChatsFindResponse>;
        init(params: ChatsInitRequest): Promise<ChatsInitResponse>;
        delete(params: {
            chatId: string;
        }): Promise<ChatsDeleteResponse>;
        getById(params: {
            chatId: string;
        }): Promise<ChatsGetByIdResponse>;
        update(params: {
            chatId: string;
        } & ChatsUpdateRequest): Promise<ChatsUpdateResponse>;
        favorite(params: {
            chatId: string;
        } & ChatsFavoriteRequest): Promise<ChatsFavoriteResponse>;
        fork(params: {
            chatId: string;
        } & ChatsForkRequest): Promise<ChatsForkResponse>;
        sendMessage(params: {
            chatId: string;
        } & ChatsSendMessageRequest): Promise<ChatsSendMessageResponse>;
        resume(params: {
            chatId: string;
            messageId: string;
        }): Promise<ChatsResumeResponse>;
    };
    projects: {
        getByChatId(params: {
            chatId: string;
        }): Promise<ProjectsGetByChatIdResponse>;
        find(): Promise<ProjectsFindResponse>;
        create(params: ProjectsCreateRequest): Promise<ProjectsCreateResponse>;
        getById(params: {
            projectId: string;
        }): Promise<ProjectsGetByIdResponse>;
        assign(params: {
            projectId: string;
        } & ProjectsAssignRequest): Promise<ProjectsAssignResponse>;
    };
    deployments: {
        find(params: {
            projectId: string;
            chatId: string;
            versionId: string;
        }): Promise<DeploymentsFindResponse>;
        create(params: DeploymentsCreateRequest): Promise<DeploymentsCreateResponse>;
        getById(params: {
            deploymentId: string;
        }): Promise<DeploymentsGetByIdResponse>;
        delete(params: {
            deploymentId: string;
        }): Promise<DeploymentsDeleteResponse>;
        findLogs(params: {
            deploymentId: string;
            since?: string;
        }): Promise<DeploymentsFindLogsResponse>;
        findErrors(params: {
            deploymentId: string;
        }): Promise<DeploymentsFindErrorsResponse>;
    };
    hooks: {
        find(): Promise<HooksFindResponse>;
        create(params: HooksCreateRequest): Promise<HooksCreateResponse>;
        getById(params: {
            hookId: string;
        }): Promise<HooksGetByIdResponse>;
        update(params: {
            hookId: string;
        } & HooksUpdateRequest): Promise<HooksUpdateResponse>;
        delete(params: {
            hookId: string;
        }): Promise<HooksDeleteResponse>;
    };
    integrations: {
        vercel: {
            projects: {
                find(): Promise<IntegrationsVercelProjectsFindResponse>;
                create(params: IntegrationsVercelProjectsCreateRequest): Promise<IntegrationsVercelProjectsCreateResponse>;
            };
        };
    };
    rateLimits: {
        find(params?: {
            scope?: string;
        }): Promise<RateLimitsFindResponse>;
    };
    user: {
        get(): Promise<UserGetResponse>;
        getBilling(params?: {
            scope?: string;
        }): Promise<UserGetBillingResponse>;
        getPlan(): Promise<UserGetPlanResponse>;
        getScopes(): Promise<UserGetScopesResponse>;
    };
};