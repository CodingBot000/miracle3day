# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Next.js 14 application for a Korean beauty/medical services platform that connects users with hospitals and medical professionals. The application supports both Korean and English languages and includes features for hospital discovery, appointment booking, reviews, and administrative management.

## Development Commands

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm run start

# Run linting
npm run lint
```

## Architecture Overview

### Tech Stack
- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Database**: AWS lighsail (PostgreSQL)
- **State Management**: Zustand + React Query (TanStack Query)
- **Styling**: Tailwind CSS + SCSS modules + Material UI
- **Authentication**: Auth with  Google (iron-session )

### Directory Structure
- `/src/app/` - Next.js app router pages and API routes
- `/src/components/` - Reusable components following atomic design (atoms, molecules, organisms, templates)
- `/src/services/` - API service layers for Supabase and external APIs
- `/src/stores/` - Zustand state management stores
- `/src/hooks/` - Custom React hooks, primarily for data fetching with React Query
- `/src/utils/` - Utility functions including Supabase client configuration
- `/src/constants/` - Application constants including database table names

### Key API Routes Pattern
API routes follow RESTful conventions:
- `/api/hospital/[id]/info` - Hospital information
- `/api/hospital/[id]/reservation` - Reservation management
- `/api/auth/*` - Authentication endpoints
- `/api/admin/*` - Admin functionality

### Database Schema
Main entities include:
- `hospital`, `hospital_details`, `hospital_treatment`, `hospital_business_hour`
- `doctor` - Medical professionals
- `treatment`, `surgery_info` - Available procedures
- `reservations` - Appointment bookings
- `reviews` - User feedback
- `members`, `favorite` - User data and preferences

### Authentication Flow
1. Multi-provider authentication via Supabase Auth
2. Middleware (`/src/middleware.ts`) handles route protection
3. User sessions stored in Supabase with JWT tokens
4. Email verification required for new signups

### Data Fetching Pattern
Uses React Query with custom hooks:
```typescript
// Example pattern used throughout:
export const useHospitalInfo = (hospitalId: string) => {
  return useQuery({
    queryKey: ['hospital', hospitalId],
    queryFn: () => fetchHospitalInfo(hospitalId),
  });
};
```

### Component Development Guidelines
1. Components follow atomic design principles
2. Use TypeScript interfaces for all props
3. Styling preference order: Tailwind CSS > SCSS modules > Emotion CSS-in-JS
4. Common UI components are in `/src/components/atoms/`

### Environment Configuration
- `.env.local` - Local development environment variables
- `.env.prod` - Production environment variables
- Required variables include Supabase URL, Anon Key, and various API keys

### Current Feature Development
The repository is currently on `feature/hospital_detail_design` branch, implementing:
- Hospital reservation system
- Enhanced hospital detail pages
- Reservation API endpoints
- State management for reservations

### Testing Approach
Currently no test suite is configured. When implementing tests:
1. Consider adding Jest and React Testing Library
2. Test API routes separately from UI components
3. Mock Supabase client for unit tests

### Common Development Tasks

#### Adding a New API Route
1. Create route file in `/src/app/api/`
2. Use the established DTO pattern (see existing routes)
3. Implement proper error handling with try-catch
4. Return appropriate HTTP status codes

#### Creating New Components
1. Check existing components for similar functionality
2. Place in appropriate atomic design folder
3. Use TypeScript for props definition
4. Follow existing naming conventions (PascalCase for components)

#### Working with Supabase
1. Use the client from `/src/utils/supabase/client.ts`
2. Handle authentication state with `getUser()` helper
3. Use Row Level Security (RLS) policies configured in Supabase
4. Check table definitions in `/src/constants/tables.ts`

#### Adding Translations
1. Translations are managed in component-level constants
2. Use the language selector component pattern
3. Support both 'ko' and 'en' language codes

### Deployment Considerations
- Application designed for Vercel deployment
- Uses Next.js Image optimization
- Static assets served from `/public/`
- Supabase handles authentication and database