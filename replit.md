# Vibe - Social Media Mobile App

## Overview

Vibe is a social media mobile application built with Expo (React Native) and an Express.js backend server. It features an Instagram-like experience with a feed of posts, reels (short-form video), direct messaging/chat, and user profiles. The app uses a tab-based navigation structure and supports dark mode UI with gradient accents. Currently, much of the social data (posts, reels, conversations) is generated client-side as sample data, with the backend providing a foundation for user authentication and future API expansion.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend (Expo / React Native)

- **Framework**: Expo SDK 54 with React Native 0.81, using the new architecture (`newArchEnabled: true`) and React 19.
- **Routing**: File-based routing via `expo-router` v6 with typed routes. The app directory structure defines screens:
  - `app/(tabs)/` — Tab-based main screens: Home feed (`index.tsx`), Chat list (`chat.tsx`), Reels (`reels.tsx`), Profile (`profile.tsx`)
  - `app/chat/[id].tsx` — Individual chat detail screen (dynamic route)
  - `app/login.tsx` — Login/signup screen
  - `app/_layout.tsx` — Root layout with providers (QueryClient, Auth, GestureHandler, KeyboardProvider)
- **State Management**: 
  - `@tanstack/react-query` for server state and data fetching (query client configured in `lib/query-client.ts`)
  - React Context for authentication state (`lib/auth-context.tsx`)
  - Local component state for UI interactions
- **Data Layer**: Currently uses `AsyncStorage` for local persistence of user sessions and chat messages. Sample/mock data is generated client-side in `lib/social-data.ts`. The `apiRequest` helper in `lib/query-client.ts` is set up to communicate with the Express backend.
- **UI/Styling**: Dark theme throughout (defined in `constants/colors.ts`). Uses `react-native-reanimated` for animations, `expo-haptics` for tactile feedback, `expo-linear-gradient` for gradient effects, `expo-blur` and `expo-glass-effect` for glass morphism UI, and `expo-image` for optimized image rendering.
- **Fonts**: Inter font family (400, 500, 600, 700 weights) via `@expo-google-fonts/inter`.
- **Platform Support**: iOS, Android, and Web. Platform-specific adjustments exist (e.g., web top insets, keyboard handling via `KeyboardAwareScrollViewCompat`). iOS supports native tab layout via `expo-router/unstable-native-tabs` with liquid glass when available.

### Backend (Express.js)

- **Runtime**: Node.js with TypeScript, compiled via `tsx` for development and `esbuild` for production builds.
- **Server**: Express 5 with a simple CORS setup that allows Replit domains and localhost origins. Routes are registered in `server/routes.ts` — currently minimal with just the HTTP server creation.
- **Storage**: An in-memory storage implementation (`MemStorage` in `server/storage.ts`) with an `IStorage` interface for users. This is designed to be swapped for a database-backed implementation.
- **Static Serving**: In production, the server serves the Expo web build from a `dist/` directory. A landing page template exists for when no build is available.
- **API Pattern**: All API routes should be prefixed with `/api`. The frontend's `apiRequest` function targets the Express server using `EXPO_PUBLIC_DOMAIN`.

### Database Schema (Drizzle ORM)

- **ORM**: Drizzle ORM with PostgreSQL dialect, configured in `drizzle.config.ts`.
- **Schema** (`shared/schema.ts`): Currently defines a single `users` table with:
  - `id` (varchar, primary key, auto-generated UUID via `gen_random_uuid()`)
  - `username` (text, unique, not null)
  - `password` (text, not null)
- **Validation**: Uses `drizzle-zod` to generate Zod schemas from the Drizzle table definitions.
- **Migrations**: Output to `./migrations` directory. Push schema with `npm run db:push`.
- **Note**: The schema is defined and Drizzle is configured, but the server currently uses in-memory storage rather than the database. The `DATABASE_URL` environment variable is required for Drizzle operations.

### Authentication

- **Current Implementation**: Client-side authentication using `AsyncStorage`. The `AuthProvider` manages login/signup/logout with local storage persistence. Users and credentials are stored locally on the device.
- **Future Direction**: The backend has user CRUD operations in the storage interface, and the schema supports server-side auth. The infrastructure is in place to move authentication to the server.

### Build & Development

- **Development**: Two processes run concurrently — Expo dev server (`expo:dev`) and Express server (`server:dev`). The Express server proxies requests to Metro bundler in development mode using `http-proxy-middleware`.
- **Production Build**: `expo:static:build` creates a static web export, `server:build` bundles the Express server with esbuild, and `server:prod` runs the production server.
- **Database**: `db:push` pushes the Drizzle schema to PostgreSQL.
- **Post-install**: Uses `patch-package` for any dependency patches.

## External Dependencies

### Core Services
- **PostgreSQL**: Database (configured via `DATABASE_URL` environment variable). Required for Drizzle ORM schema operations. Currently not actively used at runtime (in-memory storage is used instead), but the infrastructure is ready.
- **Replit**: Hosting environment. Uses Replit-specific environment variables (`REPLIT_DEV_DOMAIN`, `REPLIT_DOMAINS`, `REPLIT_INTERNAL_APP_DOMAIN`) for CORS configuration, Expo dev server setup, and deployment domain detection.

### Key NPM Packages
- **expo** (~54.0.27) — Core framework for cross-platform mobile development
- **expo-router** (~6.0.17) — File-based routing
- **express** (^5.0.1) — Backend HTTP server
- **drizzle-orm** (^0.39.3) / **drizzle-kit** — Database ORM and migration tooling
- **@tanstack/react-query** (^5.83.0) — Async state management
- **pg** (^8.16.3) — PostgreSQL client driver
- **react-native-reanimated** (~4.1.1) — Animations
- **react-native-gesture-handler** (~2.28.0) — Touch gesture handling
- **zod** / **drizzle-zod** — Schema validation

### External Content
- **picsum.photos** — Used for placeholder/sample images in the UI (posts, avatars, profile grids)