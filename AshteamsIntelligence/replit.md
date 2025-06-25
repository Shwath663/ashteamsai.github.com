# Ashteams AI - Chat Application with AI Integration

## Overview

This is a full-stack chat application built with React, Express, and PostgreSQL. The application features both authenticated and anonymous chat functionality, powered by advanced AI technology for intelligent responses. It uses modern web technologies including TypeScript, Tailwind CSS, shadcn/ui components, and Drizzle ORM for database management.

## System Architecture

The application follows a traditional client-server architecture with clear separation of concerns:

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack Query (React Query) for server state management
- **UI Framework**: shadcn/ui components built on Radix UI primitives
- **Styling**: Tailwind CSS with custom GitHub-inspired dark theme
- **Form Handling**: React Hook Form with Zod validation
- **Build Tool**: Vite for fast development and optimized builds

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **Authentication**: Passport.js with local strategy and session-based auth
- **Database**: PostgreSQL with Drizzle ORM
- **Session Store**: In-memory store (development) with PostgreSQL option
- **API Integration**: OpenRouter for AI chat completions

## Key Components

### Database Schema
The application uses three main entities:
- **Users**: Store user credentials and metadata
- **Chats**: Represent conversation threads with support for both authenticated and anonymous users
- **Messages**: Store individual chat messages with role-based content (user/assistant)

### Authentication System
- Dual-mode authentication supporting both registered users and anonymous sessions
- Session-based authentication with secure cookie handling
- Password hashing using Node.js crypto scrypt
- Protected routes with automatic redirects

### Chat System
- Real-time chat interface with message history
- Support for both authenticated and anonymous users
- AI-powered responses using advanced language models
- Chat management (create, delete, title updates)
- Responsive design with mobile-first approach

### UI Components
- Comprehensive component library based on shadcn/ui
- Custom GitHub-inspired dark theme
- Responsive sidebar navigation
- Form validation with real-time feedback
- Toast notifications for user feedback

## Data Flow

1. **User Authentication**: Users can register/login or continue anonymously
2. **Session Management**: Sessions are managed server-side with secure cookies
3. **Chat Creation**: Users create new chats which generate unique conversation threads
4. **Message Exchange**: Users send messages which are stored and forwarded to AI service
5. **AI Processing**: Advanced AI models process messages for intelligent responses
6. **Response Handling**: AI responses are stored and displayed in real-time
7. **State Synchronization**: React Query manages cache invalidation and updates

## External Dependencies

### Core Dependencies
- **@neondatabase/serverless**: PostgreSQL database driver
- **@tanstack/react-query**: Server state management
- **drizzle-orm**: Type-safe database ORM
- **passport**: Authentication middleware
- **express-session**: Session management
- **wouter**: Lightweight routing
- **react-hook-form**: Form state management
- **zod**: Schema validation

### UI Dependencies
- **@radix-ui/react-***: Accessible UI primitives
- **tailwindcss**: Utility-first CSS framework
- **class-variance-authority**: Component variant management
- **lucide-react**: Icon library
- **date-fns**: Date utility library

### Development Dependencies
- **vite**: Build tooling and development server
- **typescript**: Type checking and compilation
- **tsx**: TypeScript execution for Node.js
- **esbuild**: Fast JavaScript bundler for production builds

## Deployment Strategy

### Development Environment
- Replit-optimized with custom configuration
- Vite development server with HMR
- PostgreSQL 16 module for database
- Environment variables for API keys and secrets

### Production Build
- Vite builds optimized client bundle
- esbuild compiles server code for Node.js
- Static files served from Express
- Database migrations via Drizzle Kit
- Autoscale deployment target on Replit

### Configuration Management
- Environment-based configuration
- Secure handling of API keys (OpenRouter)
- Session secrets and database URLs
- CORS and security headers for production

## Changelog

- June 24, 2025: Initial setup with React + Express architecture
- June 24, 2025: Fixed WebSocket conflicts and authentication issues
- June 24, 2025: Updated branding to Ashteams AI with system prompts

## User Preferences

Preferred communication style: Simple, everyday language.