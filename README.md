# MemoryVault

A private Valentine's Day web application for storing and sharing relationship memories.

## Tech Stack

- Next.js 14+ (App Router)
- TypeScript
- Tailwind CSS v4
- Framer Motion
- Neon (PostgreSQL)
- NextAuth (Email Magic Links)
- Drizzle ORM

## Quick Setup

### 1. Install Dependencies
```bash
pnpm install
```

### 2. Configure Environment
```bash
cp .env.local.example .env.local
# Edit .env.local with your credentials
```

### 3. Setup Database
Run `neon-complete-setup.sql` in Neon SQL Editor

### 4. Start Development
```bash
pnpm dev
```

Visit: http://localhost:3000

## Configuration

### Authorized Email
Edit `lib/config.ts`:
```typescript
export const ALLOWED_EMAIL = 'your@email.com'
```

### Environment Variables
- `DATABASE_URL` - Neon connection string
- `NEXTAUTH_URL` - App URL
- `NEXTAUTH_SECRET` - Generate with `openssl rand -base64 32`
- `EMAIL_SERVER_*` - SMTP credentials
- `UPLOADTHING_*` - File upload credentials

## Features

- Private authentication (single user)
- Memory timeline with images
- Interactive "reasons I love you" cards
- Real-time countdown to events
- Proposal section with confetti
- Full admin CMS dashboard

## Commands

```bash
pnpm dev          # Start development server
pnpm build        # Build for production
pnpm db:generate  # Generate migrations
pnpm db:push      # Push schema to database
pnpm db:studio    # Open Drizzle Studio
```

## Deployment

Deploy to Vercel:
```bash
vercel --prod
```

Add environment variables in Vercel dashboard.

## License

Private project - All rights reserved
