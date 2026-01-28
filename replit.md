# Pocket Game Store

## Overview

Pocket Game Store is a full-stack game publishing platform similar to itch.io or Play Store. It allows users to discover, upload, and download indie games. The platform features a dark-themed, gaming-focused UI with both user-facing features and a comprehensive admin panel for content moderation.

Key capabilities:
- User authentication with role-based access (admin/user)
- Game publishing workflow with approval system
- Rating, review, and like/dislike systems
- File uploads for game assets (thumbnails, screenshots)
- Admin dashboard with analytics and content moderation
- Report system for flagging inappropriate content

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter (lightweight alternative to React Router)
- **State Management**: TanStack React Query for server state, React Context for auth state
- **Styling**: Tailwind CSS with shadcn/ui component library
- **Animations**: Framer Motion for UI transitions
- **Build Tool**: Vite with custom plugins for Replit integration

The frontend follows a pages-based structure with shared components. Key directories:
- `client/src/pages/` - Route components (home, auth, game-details, admin, etc.)
- `client/src/components/` - Reusable UI components organized by domain (game, layout, ui)
- `client/src/hooks/` - Custom React hooks (auth, toast, mobile detection)
- `client/src/lib/` - Utilities, API clients, and type definitions

### Backend Architecture
- **Framework**: Express.js with TypeScript
- **Database ORM**: Drizzle ORM with PostgreSQL (Neon serverless)
- **Session Management**: express-session with in-memory storage
- **File Uploads**: Multer middleware storing files in `./uploads` directory
- **Authentication**: Custom session-based auth with bcrypt password hashing

API routes are consolidated in `server/routes.ts` with middleware for authentication (`requireAuth`) and admin access (`requireAdmin`).

### Data Storage
- **Database**: PostgreSQL via Neon serverless driver
- **Schema Location**: `shared/schema.ts` (shared between frontend and backend)
- **Tables**: users, games, reviews, likes, featuredVideo, reports
- **Migrations**: Drizzle Kit with migrations stored in `./migrations`

### Key Design Patterns
- **Shared Types**: Schema and types defined in `shared/` directory for full-stack type safety
- **Storage Abstraction**: `server/storage.ts` provides a clean interface for all database operations
- **API Client Pattern**: `client/src/lib/api.ts` centralizes all API calls with proper error handling
- **File-based Image Storage**: Uploaded images stored on filesystem at `/uploads` and served statically

## External Dependencies

### Database
- **Neon PostgreSQL**: Serverless PostgreSQL database accessed via `@neondatabase/serverless`
- **Connection**: Requires `DATABASE_URL` environment variable

### UI Component Libraries
- **shadcn/ui**: Pre-built accessible components based on Radix UI primitives
- **Radix UI**: Low-level UI primitives for dialogs, dropdowns, tabs, etc.
- **Lucide React**: Icon library

### Build & Development
- **Vite**: Frontend build tool with HMR
- **esbuild**: Server bundling for production
- **Drizzle Kit**: Database schema management and migrations

### File Storage
- Local filesystem storage in `./uploads` directory
- Files served via Express static middleware at `/uploads` route
- Supports JPEG, PNG, and WebP image formats (10MB limit)

### Session Configuration
- Uses `express-session` with configurable secret via `SESSION_SECRET` environment variable
- Sessions persist for 7 days with HTTP-only cookies