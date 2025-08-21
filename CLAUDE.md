# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- `npm run dev` - Start development server
- `npm run build` - Build the application for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint checks
- `npm run server` - Run custom server with development environment and HTTPS on mylocal.com:3012

## Architecture Overview

This is a Next.js 14 school management dashboard application with role-based access control, featuring three main role types: Admin, Manager, and authentication-based routing.

### Route Organization

The application uses Next.js App Router with route groups for role-based organization:

- `app/(auth)/` - Authentication pages (sign-in)
- `app/(defaults)/(admin)/` - Admin role pages with comprehensive school management features
- `app/(defaults)/(manager)/` - Manager role pages with limited administrative features
- `app/api/auth/[...nextauth]/` - NextAuth.js authentication API routes

### Key Architectural Patterns

**Role-Based Access Control**: The application implements sophisticated role and permission checking through:
- `hasRoleAndPermissions()` utility function for component-level access control
- `RolePageAndActionBasedComponent` wrapper components
- Fine-grained permission system with PAGE_CODE and PERMISSION types

**State Management**: 
- Redux Toolkit with RTK Query for API state management
- Custom `api.ts` with extensive tag-based cache invalidation system
- Over 100+ tag types for granular cache management across all entities

**Data Layer**:
- Services organized by role (`services/admin/`, `services/Manager/`)
- Centralized API configuration with custom Axios integration
- Authentication token management with Universal Cookies

**Component Architecture**:
- Page-level components follow `PageComponent.tsx` pattern
- Reusable form components in `components/Form/`
- Table components for data listing across all modules
- Consistent `createOrUpdate` and detail view (`[id]`) patterns

### Tech Stack Integration

- **UI**: Mantine components + TailwindCSS for styling
- **Forms**: Formik + Yup validation
- **Authentication**: NextAuth.js
- **File Handling**: Excel parsing (`excelParser.ts`) for bulk imports
- **Notifications**: Firebase Cloud Messaging + react-toastify
- **Charts**: Recharts for dashboard analytics
- **PWA**: Progressive Web App capabilities with next-pwa

### Development Patterns

**Consistent File Organization**:
- Each admin module follows: `page.tsx`, `_components/Table.tsx`, `createOrUpdate/_components/PageComponent.tsx`, `[id]/_components/PageComponent.tsx`
- Services mirror the route structure for easy navigation
- Shared utilities in `utils/` for common operations

**Internationalization**:
- Multi-language support (Arabic, English, Kurdish) in `public/locales/`
- Custom locale utilities in `utils/LocaleString.ts`

**Data Types**:
- Comprehensive type definitions in `services/types/`
- Base types for common API patterns
- School domain entities (Student, Teacher, Parent, Classes, etc.)

The codebase manages a complete school ecosystem including student enrollment, teacher assignments, scheduling, homework/lesson management, financial installments, transportation (bus routes), and communication systems.