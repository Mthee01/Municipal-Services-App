# Municipal Services Management System - Architecture Guide

## Overview

This is a comprehensive municipal services management system built with modern web technologies. The application provides a multi-role platform for citizens, municipal officials, technicians, and administrators to manage municipal services efficiently. It features issue reporting, real-time communication, payment processing, technician dispatch, and analytics capabilities.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript
- **Build Tool**: Vite for fast development and optimized builds
- **Styling**: Tailwind CSS with custom South African municipal theming
- **UI Components**: Radix UI primitives with shadcn/ui component library
- **State Management**: TanStack Query for server state management
- **Routing**: Wouter for lightweight client-side routing
- **Form Handling**: React Hook Form with Zod validation

### Backend Architecture
- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js for REST API
- **Database**: PostgreSQL with Drizzle ORM
- **Database Provider**: Neon Database (serverless PostgreSQL)
- **Session Management**: Express sessions with PostgreSQL store
- **File Upload**: Multer for handling image uploads
- **WebSocket**: Built-in WebSocket server for real-time features

### Database Design
- **ORM**: Drizzle with TypeScript-first approach
- **Schema**: Comprehensive municipal services schema including:
  - Users with role-based access control
  - Issues tracking with status management
  - Payment processing and voucher systems
  - Technician management and field reporting
  - WhatsApp integration for citizen communication
  - Chat messaging system

## Key Components

### User Management
- Multi-role authentication system (citizen, admin, mayor, ward councillor, tech manager, field technician, call centre agent)
- Session-based authentication with persistent login options
- Role-based access control throughout the application

### Issue Management System
- Citizens can report municipal issues with photo uploads
- Categorized issue types (water, electricity, roads, waste, safety, housing)
- Priority-based issue handling
- Real-time status updates and notifications
- GPS/GIS integration for location tracking

### Communication Layer
- WhatsApp Business API integration for citizen communication
- Built-in chatbot for automated responses
- Real-time notifications via WebSocket
- Multi-language support (English, Afrikaans, Zulu, Xhosa)

### Payment & Voucher System
- Municipal payment processing
- Prepaid utility voucher sales
- Payment status tracking
- Integration with South African payment methods

### Technician Dispatch
- Field technician mobile interface
- Real-time location tracking
- Work order management
- Parts inventory tracking
- Performance analytics

### Analytics & Reporting
- AI-powered insights and predictions
- Municipal performance dashboards
- Ward-specific reporting for councillors
- Executive-level analytics for mayors

## Data Flow

### Issue Reporting Flow
1. Citizen creates issue via web interface or WhatsApp
2. System auto-assigns based on category and location
3. Notifications sent to relevant municipal staff
4. Technician receives work order via mobile interface
5. Real-time updates shared with citizen
6. Completion tracking and citizen feedback collection

### Communication Flow
1. Multi-channel communication (web, WhatsApp, chat)
2. Automated routing based on issue type
3. Escalation procedures for urgent matters
4. Real-time status synchronization across channels

### Data Synchronization
1. WebSocket connections for real-time updates
2. Optimistic UI updates with TanStack Query
3. Background data fetching and caching
4. Offline support considerations

## External Dependencies

### Core Technologies
- **Database**: PostgreSQL via Neon serverless
- **File Storage**: Local file system (configurable for cloud storage)
- **Maps Integration**: Ready for Google Maps/OpenStreetMap integration
- **Payment Processing**: Stripe integration prepared
- **Communication**: WhatsApp Business API integration

### Third-Party Services
- Neon Database for serverless PostgreSQL
- Stripe for payment processing
- WhatsApp Business API for messaging
- Replit deployment platform
- WebSocket for real-time features

## Deployment Strategy

### Development Environment
- Replit-based development with hot reload
- Environment variables for database and API keys
- Local file uploads with multer
- Development-specific middleware and logging

### Production Deployment
- Node.js production server with clustering
- Static file serving for React build
- Database migrations with Drizzle Kit
- Environment-based configuration
- Health checks and monitoring endpoints

### Build Process
1. Frontend build via Vite (optimized React bundle)
2. Backend build via esbuild (Node.js bundle)
3. Database schema push via Drizzle Kit
4. Static asset optimization
5. Production server startup

### Scaling Considerations
- Database connection pooling
- WebSocket horizontal scaling preparation
- File upload optimization for large files
- CDN integration for static assets
- Load balancer configuration

## User Preferences

Preferred communication style: Simple, everyday language.

## Recent Changes

✓ June 24, 2025: Enhanced real-time citizen issue visibility
- Implemented 5-second auto-refresh for call center and tech manager dashboards
- Added visual highlighting for new citizen issues (within 1 hour)
- Prioritized unassigned citizen reports at top of both dashboards
- Added "NEW CITIZEN ISSUE" badges for immediate identification
- Enhanced issue sorting to show newest citizen reports first

✓ June 24, 2025: Fixed user login credentials
- Added Siphokazi to hardcoded authentication system with field_technician role (ID 5)
- Added Lusanda to hardcoded authentication system with citizen role (ID 15)  
- Added Themba to hardcoded authentication system with field_technician role (ID 13)
- Users can now login with username: "Siphokazi"/"Lusanda"/"Themba", password: "password"
- Fixed technician assignment system to show available technicians for reassignment
- Enhanced nearest technicians endpoint to include "on_job" technicians

✓ June 24, 2025: Enhanced technician dashboard filtering
- Resolved issues are now properly filtered out from technician view
- Technicians only see active work assignments (open, assigned, in_progress)
- Improved issue completion workflow with mandatory completion notes
- Fixed work session tracking to handle mixed data types
- Implemented proper issue closure with "Close Issue & Complete Work" functionality

## Changelog

- June 23, 2025: Initial setup
- June 24, 2025: Enhanced technician workflow and filtering