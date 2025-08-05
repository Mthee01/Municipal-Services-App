# Municipal Services Management System

## Overview
This project is a comprehensive municipal services management system designed to streamline interactions between citizens, municipal officials, and service providers. It aims to enhance efficiency in managing urban services like issue reporting, real-time communication, and payment processing. The system provides a multi-role platform with capabilities for analytics, technician dispatch, and a vision for AI-powered insights. The business vision is to improve urban living through efficient service delivery and foster community engagement.

## User Preferences
Preferred communication style: Simple, everyday language.

## Recent Changes
- Removed default field technician from sample data initialization to allow clean technician management
- Fixed GPS distance calculation accuracy with real coordinates 
- Resolved technician name display issues in admin dashboard
- Updated Active Assignments display logic to use correct field mapping
- Implemented secure user management: citizens self-register, admins create other roles with mandatory password change

## System Architecture

### Frontend
- **Framework**: React with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS with custom South African municipal theming
- **UI Components**: Radix UI primitives and shadcn/ui
- **State Management**: TanStack Query
- **Routing**: Wouter
- **Form Handling**: React Hook Form with Zod validation
- **Location Integration**: Google Maps/OpenStreetMap for GPS/GIS
- **UI/UX**: Clean white cards with colored borders, professional icons, responsive grid layout, MTN brand color scheme (yellow and blue).

### Backend
- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js (REST API)
- **Database**: PostgreSQL (via Neon Database)
- **ORM**: Drizzle ORM
- **Session Management**: Express sessions with PostgreSQL store
- **File Upload**: Multer
- **Real-time Communication**: Custom WebSocket server

### Core System Features
- **User Management**: Multi-role authentication (citizen, admin, mayor, ward councillor, tech manager, field technician, call centre agent) with role-based access control.
- **Issue Management**: Citizens can report categorized municipal issues (water, electricity, roads, waste, safety, housing) with photo uploads, priority handling, and real-time status updates. Includes unique 6-character reference numbers for tracking.
- **Communication Layer**: WhatsApp Business API integration, built-in chatbot, real-time notifications via WebSockets, multi-language support (English, Afrikaans, Zulu, Xhosa).
- **Payment & Voucher System**: Municipal payment processing, prepaid utility voucher sales, payment tracking, integrated with South African payment methods.
- **Technician Dispatch**: Mobile interface for field technicians, real-time GPS tracking (Leaflet maps with OpenStreetMap), work order management, parts inventory, and mandatory completion reports with photo documentation.
- **Analytics & Reporting**: AI-powered insights, municipal performance dashboards, ward-specific and executive-level reporting.
- **Data Flow**: Optimized data synchronization via WebSockets, optimistic UI updates, background data fetching, and caching.
- **Security**: Robust access control, job card authorization for technicians, and secure password management.

## External Dependencies
- **Database**: Neon Database (for PostgreSQL)
- **Payment Processing**: Stripe
- **Communication**: WhatsApp Business API
- **Mapping**: Google Maps / OpenStreetMap
- **Deployment**: Replit platform