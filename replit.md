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

## Data Storage Notes

✅ **PERSISTENT DATABASE STORAGE IMPLEMENTED**: This application now uses PostgreSQL database storage. This means:
- Notes, escalations, and all data persist permanently across server restarts
- Data is stored in the PostgreSQL database and never disappears
- All user data, issues, notes, and escalations are preserved
- Production-ready persistent storage is now active

## Recent Changes

✓ June 24, 2025: IMPLEMENTED PERSISTENT DATABASE STORAGE - NOTES NEVER DISAPPEAR
- CRITICAL FIX: Migrated from in-memory storage to PostgreSQL database storage
- Created DatabaseStorage class with full PostgreSQL integration using Drizzle ORM
- All notes, escalations, and data now persist permanently across server restarts
- Created missing database tables: issue_notes, issue_escalations, field_reports, parts_inventory
- Verified persistence: notes survive server restarts and remain permanently stored
- Fixed technician assignment functionality by removing duplicate endpoint definitions
- Tech managers can now view all notes and communication history from call center agents
- Both notes and escalation systems now fully operational with persistent storage
- Production-ready database storage ensures no data loss

✓ June 24, 2025: Fixed technician performance analytics chart
- Resolved blank gray box issue in tech manager dashboard performance overview
- Implemented proper database queries for technician performance analytics
- Added 13 technicians with realistic performance metrics to database
- Fixed analytics endpoints to return actual data instead of empty arrays
- Performance chart now displays completed issues, ratings, and resolution times
- Department statistics working with 13 total technicians, 4.6 average performance rating

✓ June 24, 2025: Added red flashing indicator for escalated issues in tech manager dashboard
- Implemented visual red flashing indicator for urgent/escalated issues
- Added red background highlight and pulsing red dot for immediate attention
- Added "ESCALATED" badge with animation for clear identification
- Issues marked as urgent priority now display with red warning indicators
- Tech managers can instantly identify escalated issues requiring immediate action

✓ June 24, 2025: Fixed tech manager dashboard stability issues
- Resolved 500 errors in /api/issues endpoint that were causing dashboard failures
- Simplified database queries to prevent crashes during issue fetching
- Dashboard now loads reliably without intermittent failures
- Red flashing indicators for urgent issues remain functional
- All dashboard features working consistently

✓ June 24, 2025: Fixed escalation functionality completely
- Resolved database schema mismatch causing "column does not exist" errors
- Aligned issue_escalations table structure with application code
- Fixed API endpoint to properly handle escalation requests
- Fixed frontend-backend parameter mismatch (reason vs escalationReason)
- Escalations now successfully create database records and update issue priority to urgent
- Call center agents can now escalate issues to technical managers
- Escalated issues display with red flashing indicators in tech manager dashboard
- Complete end-to-end escalation workflow operational from call center to tech manager

✓ June 24, 2025: Filtered resolved issues from call center dashboard
- Resolved issues are now hidden from call center agent dashboard
- Only active issues (open, assigned, in_progress) are visible to call center agents
- Updated statistics to show active issue count instead of all open issues
- Call center agents focus on unresolved matters requiring attention

✓ June 24, 2025: Added unique reference numbers to all issues
- Every issue now has a unique 6-character reference number (format: XXXXXX)
- Reference numbers visible in dashboard tables and issue cards
- Existing issues automatically assigned reference numbers
- Reference numbers help citizens track their service requests
- Database schema updated with reference_number field (6 characters)

✓ June 24, 2025: Added reference number search functionality
- Call center agents can now search issues by reference number
- Search functionality extended to include reference numbers alongside title, location, and category
- Updated search placeholder text to indicate reference number search capability
- Enhanced filtering logic to support reference number matching

✓ June 24, 2025: Added RefNo column to issues table
- Added RefNo column as first column in call center dashboard issues table
- All issues now display their unique 6-character reference numbers prominently
- RefNo displayed in blue monospace font for easy identification
- Updated search placeholder to mention RefNo search capability
- All 21 issues in database now have unique reference numbers assigned

✓ June 24, 2025: Enhanced RefNo search functionality for exact matching
- RefNo search now returns only the specific issue when exact 6-character reference is entered
- 6-character searches are treated as RefNo-only searches for precision
- Other searches continue to work across title, location, description, and category
- Updated search placeholder to clarify RefNo exact match behavior
- Call center agents can now quickly find specific issues by RefNo

✓ June 24, 2025: Fixed RefNo display to show actual alphanumeric reference numbers
- RefNo column now displays actual alphanumeric reference numbers (e.g., AFB3F1, D31523)
- Removed fallback to padded numeric IDs that were showing as "000018" format
- All issues now have proper 6-character alphanumeric reference numbers assigned
- RefNo display matches the actual database values for accurate tracking

✓ June 24, 2025: Enhanced call center agent capabilities
- Added comprehensive note-taking system for tracking issue communication and progress
- Implemented escalation system allowing agents to escalate issues to technical managers
- Added Notes and Escalate action buttons to issue table for easy access
- Created detailed modals for viewing/adding notes and managing escalations
- Escalations automatically mark issues as URGENT priority for immediate attention
- Maintained audit trails for both notes and escalations with timestamps and user tracking
- Call center agents can now fully monitor, document, and escalate issues as needed

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

✓ June 24, 2025: Fixed notes functionality completely
- Resolved "Cannot read properties of undefined" error in notes creation
- Added missing createIssueNote method to MemStorage class
- Fixed API endpoint data validation and error handling
- Notes system now fully operational with proper storage and retrieval
- Call center agents can successfully add notes visible to technical managers
- Fixed agent name display to show actual user names instead of "Unknown User"
- Created useAuth hook for proper user authentication state management
- Notes now display correct agent names (e.g., "Sarah Agent") with proper timestamps

## Changelog

- June 23, 2025: Initial setup
- June 24, 2025: Enhanced technician workflow and filtering