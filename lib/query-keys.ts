// lib/query-keys.ts
export const queryKeys = {
  projects: {
    all: ['projects'] as const,
    list: () => [...queryKeys.projects.all, 'list'] as const,
    detail: (id: string) => [...queryKeys.projects.all, 'detail', id] as const,
    chats: (projectId: string) => [...queryKeys.projects.all, 'chats', projectId] as const,
  },
  chats: {
    all: ['chats'] as const,
    detail: (id: string) => [...queryKeys.chats.all, 'detail', id] as const,
    messages: (chatId: string) => [...queryKeys.chats.all, 'messages', chatId] as const,
  },
} as const