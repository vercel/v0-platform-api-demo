# v0 SDK App Generator

A Next.js application that uses the v0 SDK to generate apps with a floating prompt interface. When you submit a prompt, it calls `v0.chats.create()` and shows a preview of the generated app filling the screen behind the prompt.

## Features

- 🎨 **Floating Prompt Interface** - Clean, modern prompt UI positioned at the bottom of the screen
- ⚡ **Real-time Generation** - Uses v0 SDK to generate apps on-the-fly
- 👀 **Live Preview** - Shows generated app preview filling the screen behind the prompt
- 🔗 **v0.dev Integration** - Direct links to view and edit on v0.dev
- 📱 **Responsive Design** - Works on desktop and mobile devices

## Prerequisites

- Node.js 18+ and pnpm
- v0 API key from [v0.dev/settings](https://v0.dev/settings)

## Setup

1. **Clone and install dependencies:**
   ```bash
   git clone <repository-url>
   cd v1
   pnpm install
   ```

2. **Configure environment variables:**
   ```bash
   cp .env.example .env.local
   ```
   
   Edit `.env.local` and add your v0 API key:
   ```env
   V0_API_KEY=your_v0_api_key_here
   ```

3. **Run the development server:**
   ```bash
   pnpm dev
   ```

4. **Open your browser:**
   Navigate to [http://localhost:3000](http://localhost:3000)

## Usage

1. **Enter a prompt** in the floating text area at the bottom of the screen
2. **Click "Generate App"** or press Enter to submit
3. **Watch the magic happen** as v0 generates your app
4. **View the preview** that fills the screen behind the prompt
5. **Click "View on v0.dev"** to open the generated app on v0.dev for further editing

## Example Prompts

Try these prompts to get started:

- "Create a todo app with drag and drop functionality"
- "Build a weather dashboard with charts"
- "Make a simple calculator with a modern design"
- "Create a photo gallery with lightbox"
- "Build a chat interface with message bubbles"

## How It Works

1. **Prompt Submission** - The frontend sends your prompt to `/api/generate`
2. **Backend Processing** - The API route calls `v0.chats.create()` with your prompt
3. **Code Generation** - v0 generates React components based on your prompt
4. **Preview Rendering** - The generated code is rendered in an iframe with React and Tailwind CSS
5. **Live Display** - The preview fills the entire screen behind the floating prompt

## API Reference

### Frontend to Backend
The frontend calls the backend API route:

```typescript
const response = await fetch('/api/generate', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ message: prompt })
});
```

### Backend v0 SDK Usage
The backend API route uses the v0 SDK:

```typescript
const response = await v0Client.chats.create({
  message: prompt,
  // Optional parameters:
  // attachments?: { url: string }[]
  // system?: string
  // chatPrivacy?: 'public' | 'private' | 'team-edit' | 'team' | 'unlisted'
  // projectId?: string
  // modelConfiguration?: { ... }
});
```

## Project Structure

```
v1/
├── app/
│   ├── api/
│   │   └── generate/
│   │       └── route.ts  # Backend API route with v0 SDK integration
│   ├── page.tsx          # Main app component with floating prompt
│   ├── layout.tsx        # Root layout
│   └── globals.css       # Global styles
├── package.json          # Dependencies including v0-sdk
├── .env.example          # Environment variables template
└── README.md            # This file
```

## Dependencies

- **Next.js 15** - React framework
- **React 19** - UI library
- **Tailwind CSS 4** - Styling
- **v0-sdk** - v0.dev API integration
- **TypeScript** - Type safety

## Troubleshooting

### "Failed to generate app" Error
- Check that your `V0_API_KEY` is set correctly in `.env.local`
- Verify your API key is valid at [v0.dev/settings](https://v0.dev/settings)
- Check the browser console and server logs for detailed error messages

### Preview Not Loading
- The preview iframe uses external CDNs for React and Babel
- Ensure you have an internet connection
- Check browser console for any security errors

### TypeScript Errors
- Run `pnpm build` to check for type errors
- The v0 SDK includes TypeScript definitions

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - see LICENSE file for details.

## Links

- [v0.dev](https://v0.dev) - AI-powered UI generation
- [v0 SDK Documentation](https://www.npmjs.com/package/v0-sdk)
- [Next.js Documentation](https://nextjs.org/docs)
