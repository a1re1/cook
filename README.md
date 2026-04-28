# Cook - Your Personal Cookbook

A Next.js cookbook application where users can create, publish, and search through recipes with a flexible Notion-like editing experience.

## Tech Stack

- **Framework**: Next.js 14+ (App Router) with TypeScript
- **Database**: Convex (serverless, real-time)
- **Authentication**: WorkOS AuthKit
- **Image Storage**: UploadThing
- **Content Editor**: BlockNote (Notion-style block editor)
- **UI**: shadcn/ui + Tailwind CSS

## Features

- Flexible Notion-like recipe editor with custom blocks
- Full-text search across recipes
- Multiple images per recipe
- Categories and tags for organization
- Public/private recipes with draft mode
- User collections/cookbooks
- Favorites system

## Getting Started

### Prerequisites

- [Bun](https://bun.com) 1.0+ installed
- A Convex account (sign up at https://convex.dev)
- A WorkOS account (sign up at https://workos.com)
- An UploadThing account (sign up at https://uploadthing.com)

### Installation

1. Clone the repository
2. Install dependencies:

```bash
bun install
```

3. Set up your environment variables by copying `.env.local.example` to `.env.local`:

```bash
cp .env.local.example .env.local
```

4. Configure your environment variables in `.env.local`:

```env
# Convex
NEXT_PUBLIC_CONVEX_URL=https://your-project.convex.cloud
CONVEX_DEPLOYMENT=your-deployment-id

# WorkOS
NEXT_PUBLIC_WORKOS_CLIENT_ID=client_xxx
WORKOS_CLIENT_SECRET=sk_xxx
WORKOS_API_KEY=sk_xxx
WORKOS_REDIRECT_URI=http://localhost:3000/callback

# UploadThing
UPLOADTHING_SECRET=sk_live_xxx
UPLOADTHING_APP_ID=your-app-id

# Next.js
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

5. Initialize Convex (follow the prompts to set up your project):

```bash
bunx convex dev
```

6. In a separate terminal, run the development server:

```bash
bun run dev
```

7. Open [http://localhost:3000](http://localhost:3000) in your browser

## Project Structure

```
/workspaces/cook/
├── convex/                 # Convex backend
│   ├── schema.ts          # Database schema
│   ├── auth.config.ts     # WorkOS auth configuration
│   ├── users.ts           # User management
│   └── recipes.ts         # Recipe queries/mutations
├── src/
│   ├── app/               # Next.js App Router
│   │   ├── (auth)/        # Auth routes
│   │   ├── (dashboard)/   # Authenticated routes
│   │   └── recipes/       # Public recipe routes
│   ├── components/        # React components
│   │   ├── ui/            # shadcn/ui components
│   │   ├── recipe/        # Recipe-specific components
│   │   └── providers/     # Context providers
│   └── lib/               # Utilities
└── package.json
```

## Development

- `bun run dev` - Start development server
- `bun run build` - Build for production
- `bun run start` - Start production server
- `bun run lint` - Run ESLint

## License

MIT
