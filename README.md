# v0 Platform API Demo

A Next.js application showcasing the v0 Platform API. Build AI-powered apps with real-time generation, project management, and seamless deployment to Vercel.

![Screenshot](screenshot.png)

## Setup

1. **Install dependencies:**
   ```bash
   pnpm install
   ```

2. **Configure environment:**
   Create a `.env.local` file in the root directory:
   ```env
   V0_API_KEY=your_api_key_here
   ```
   
   Get your API key from [v0.dev/settings](https://v0.dev/settings)

3. **Run development server:**
   ```bash
   pnpm dev
   ```

   Open [http://localhost:3000](http://localhost:3000) to view the application.

## Features

- **AI App Generation**: Create applications from natural language prompts using v0's AI
- **Project Management**: Organize your work into projects with multiple chat conversations
- **Live Preview**: Instantly preview generated applications in an embedded iframe
- **Chat Management**: Continue conversations, fork chats, rename, and delete as needed
- **One-Click Deployment**: Deploy generated apps directly to Vercel
- **File Attachments**: Upload images and files to enhance your prompts
- **Voice Input**: Use speech-to-text for hands-free prompt creation
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **Session Caching**: Improved performance with intelligent caching of projects and chats

## API Routes

- `GET /api/validate` - Validate API key
- `GET /api/projects` - List all projects
- `GET /api/projects/[id]` - Get project details with associated chats
- `POST /api/generate` - Generate or continue app conversation
- `GET /api/chats/[id]` - Retrieve chat details and history
- `DELETE /api/chats/[id]` - Delete a chat conversation
- `PATCH /api/chats/[id]` - Update chat (rename)
- `POST /api/chats/fork` - Create a new chat from an existing one
- `POST /api/deployments` - Deploy generated apps to Vercel

## Tech Stack

- **Framework:** Next.js 15 with App Router
- **Runtime:** React 19 with TypeScript
- **Styling:** Tailwind CSS 4
- **UI Components:** Radix UI primitives with custom styling
- **API Integration:** v0-sdk for Platform API communication
- **Fonts:** Geist Sans and Geist Mono via next/font
- **Build Tool:** Turbopack for fast development

## Project Structure

```
├── app/
│   ├── api/                    # API route handlers
│   │   ├── chats/[chatId]/     # Chat CRUD operations
│   │   ├── deployments/        # Vercel deployment handling
│   │   ├── generate/           # AI app generation
│   │   ├── projects/           # Project management
│   │   └── validate/           # API key validation
│   ├── components/             # App-specific components
│   ├── projects/[projectId]/   # Dynamic project pages
│   │   └── chats/[chatId]/     # Individual chat pages
│   ├── globals.css             # Global styles and Tailwind config
│   ├── layout.tsx              # Root layout with metadata
│   └── page.tsx                # Homepage with main interface
├── components/
│   └── ui/                     # Reusable UI components (buttons, dialogs, etc.)
├── lib/
│   ├── hooks/                  # Custom React hooks
│   └── utils.ts                # Utility functions
└── public/                     # Static assets
```

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `V0_API_KEY` | Yes | Your v0 Platform API key from [v0.dev/settings](https://v0.dev/settings) |

## Development Commands

```bash
# Install dependencies
pnpm install

# Start development server with Turbopack
pnpm dev

# Build for production
pnpm build

# Start production server
pnpm start

# Run linting
pnpm lint

# Format code
pnpm format

# Check formatting
pnpm format:check
```

## Usage

1. **Start Creating**: Enter a prompt describing the app you want to build
2. **Organize Work**: Create projects to group related conversations
3. **Iterate**: Continue conversations to refine and improve your apps
4. **Deploy**: One-click deployment to Vercel for sharing and testing
5. **Manage**: Rename, delete, or fork chats as your projects evolve

## Learn More

- [v0 Platform API Documentation](https://v0.dev/docs/api/platform)
- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS](https://tailwindcss.com)
- [Radix UI](https://www.radix-ui.com)
