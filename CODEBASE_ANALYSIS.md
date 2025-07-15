# ADA Smart Munic - Comprehensive Codebase Analysis

## 1. Architecture Overview

### Technology Stack
- **Frontend**: React 18 with TypeScript, Vite build tool
- **Backend**: Node.js with Express.js
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: Session-based with hardcoded users
- **Real-time**: WebSocket for live updates
- **File Storage**: Local multer-based file uploads
- **Styling**: Tailwind CSS with shadcn/ui components

### Project Structure
```
├── client/                    # React frontend
│   ├── src/
│   │   ├── components/        # Reusable UI components
│   │   ├── pages/            # Route-based page components
│   │   ├── hooks/            # Custom React hooks
│   │   ├── lib/              # Utility functions
│   │   └── contexts/         # React contexts
├── server/                   # Express backend
│   ├── database-storage.ts   # Database operations
│   ├── routes.ts            # API endpoints
│   ├── db.ts                # Database connection
│   └── index.ts             # Server entry point
├── shared/                   # Shared types and schemas
│   └── schema.ts            # Drizzle schema definitions
└── uploads/                 # File upload storage
```

## 2. Core Functionalities

### 2.1 User Management & Authentication
- **Role-based access control**: 7 user roles (citizen, call_centre_agent, admin, ward_councillor, mayor, tech_manager, field_technician)
- **Session management**: Express sessions with PostgreSQL store
- **Hardcoded authentication**: Demo users with username/password "password"

### 2.2 Issue Management System
- **Issue creation**: Citizens can report municipal issues with photos
- **Issue categories**: Water/Sanitation, Electricity, Roads/Transport, Waste, Safety, Housing
- **Status tracking**: Open → Assigned → In Progress → Resolved/Closed
- **Priority levels**: Low, Medium, High, Urgent
- **Reference numbers**: Unique 6-character alphanumeric codes
- **File uploads**: Photo attachments up to 10MB
- **Location services**: GPS coordinates with reverse geocoding + manual location picker

### 2.3 Technician Management
- **Technician profiles**: Name, phone, email, department, skills, status
- **Location tracking**: GPS coordinates and current location
- **Performance metrics**: Rating, completed issues, resolution time
- **Team management**: Department-based team assignments
- **Work assignment**: Nearest technician algorithms

### 2.4 Communication System
- **Issue notes**: Call center agents can add notes to issues
- **Escalation system**: Issues can be escalated to tech managers
- **WebSocket notifications**: Real-time updates across dashboards
- **Chatbot integration**: AI-powered citizen assistance
- **WhatsApp integration**: Business API for citizen communication

### 2.5 Dashboard Systems
- **Citizen Dashboard**: Issue reporting, tracking, service rating
- **Call Center Dashboard**: Issue management, notes, escalations
- **Tech Manager Dashboard**: Team oversight, performance analytics
- **Field Technician Dashboard**: Work orders, field reports, parts management
- **Admin Dashboard**: System administration and user management
- **Mayor Dashboard**: Executive analytics and performance metrics
- **Ward Councillor Dashboard**: Ward-specific issue tracking

### 2.6 Service Rating System
- **5-star rating system**: Citizens rate completed services
- **Feedback comments**: Optional detailed feedback
- **Rating persistence**: Stored in database and displayed on issue cards

### 2.7 Payment & Voucher System
- **Municipal payments**: Water, electricity, rates, fines
- **Voucher sales**: Prepaid utility vouchers
- **Payment tracking**: Status and due date management
- **Stripe integration**: Payment processing capabilities

### 2.8 Field Operations
- **Field reports**: Detailed work completion reports
- **Parts inventory**: Stock management for repairs
- **Parts ordering**: Technician requests for components
- **Location tracking**: Real-time technician GPS positioning
- **Work time tracking**: Arrival/departure timestamps

## 3. Database Schema

### Core Tables
1. **users** - User accounts and roles
2. **issues** - Municipal issue reports
3. **technicians** - Field technician profiles
4. **teams** - Departmental teams
5. **payments** - Municipal payments
6. **vouchers** - Prepaid utility vouchers
7. **wards** - Municipal ward information

### Operational Tables
8. **issueNotes** - Call center notes on issues
9. **issueEscalations** - Issue escalation records
10. **issueUpdates** - Status change history
11. **fieldReports** - Technician field work reports
12. **partsInventory** - Parts stock management
13. **partsOrders** - Parts ordering system
14. **technicianMessages** - Internal messaging
15. **technicianLocations** - GPS tracking history

### Communication Tables
16. **chatMessages** - Chatbot conversations
17. **whatsappMessages** - WhatsApp communications
18. **whatsappConversations** - WhatsApp conversation threads
19. **sessions** - Authentication sessions

## 4. API Endpoints

### Issues Management
- `GET /api/issues` - Fetch issues with filters (status, category, ward, technician)
- `GET /api/issues/:id` - Get specific issue details
- `POST /api/issues` - Create new issue with photo upload
- `PATCH /api/issues/:id` - Update issue status/details
- `POST /api/issues/:id/rate` - Submit service rating
- `GET /api/issues/:id/notes` - Get issue notes
- `POST /api/issues/:id/notes` - Add issue note
- `GET /api/issues/:id/escalations` - Get escalation history
- `POST /api/issues/:id/escalate` - Escalate issue

### Technician Management
- `GET /api/technicians` - List all technicians
- `POST /api/technicians` - Create new technician
- `POST /api/technicians/nearest` - Find nearest technicians
- `POST /api/technicians/:technicianId/assign/:issueId` - Assign work
- `PATCH /api/technicians/:id` - Update technician info

### Teams & Operations
- `GET /api/teams` - List teams by department
- `PATCH /api/teams/:id` - Update team status
- `GET /api/stats` - Municipal statistics
- `GET /api/payments` - Payment records
- `POST /api/payments` - Process payments

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/user` - Current user info

### Communication
- `POST /api/chat` - Chatbot interactions
- `POST /api/whatsapp/webhook` - WhatsApp webhooks
- `GET /api/whatsapp/conversations` - WhatsApp conversations
- `POST /api/whatsapp/send` - Send WhatsApp message

## 5. Frontend Components

### Page Components
- **Landing Page**: Public homepage with login
- **Citizen Dashboard**: Issue reporting and tracking
- **Call Center Dashboard**: Agent issue management
- **Tech Manager Dashboard**: Team oversight
- **Field Technician Dashboard**: Work order management
- **Admin Dashboard**: System administration
- **Mayor Dashboard**: Executive analytics
- **Ward Councillor Dashboard**: Ward-specific view

### Reusable Components
- **IssueCard**: Issue display with actions
- **IssueForm**: Issue creation form with location picker
- **Chatbot**: AI-powered chat interface
- **WhatsApp Integration**: Business API integration
- **GIS Map Integration**: Location mapping
- **Payment Section**: Payment processing UI
- **Voucher Section**: Voucher purchase interface
- **Real-time Notifications**: WebSocket notifications

### UI Components (shadcn/ui)
- Complete set of accessible UI components
- Form components with validation
- Dialog/modal components
- Data tables and charts
- Navigation components

## 6. Key Features

### Location Services
- **GPS Coordinates**: Automatic location detection
- **Reverse Geocoding**: Convert coordinates to addresses
- **Manual Location Picker**: 20 common South African locations
- **Address Resolution**: Street address display

### Real-time Features
- **WebSocket Updates**: Live dashboard updates
- **Auto-refresh**: 5-second polling for new data
- **Notification System**: Real-time alerts
- **Status Synchronization**: Cross-dashboard updates

### Multi-language Support
- **South African Languages**: English, Afrikaans, Zulu, Xhosa
- **Language Selector**: User language preference
- **Localized Content**: Translated interface elements

### Performance Analytics
- **Technician Metrics**: Performance ratings and completion rates
- **Resolution Times**: Average issue resolution tracking
- **Department Statistics**: Team performance analytics
- **Municipal KPIs**: City-wide performance indicators

## 7. Security & Data Management

### Authentication
- Session-based authentication
- Role-based access control
- Secure password handling
- Session timeout management

### Data Validation
- Zod schema validation
- Input sanitization
- File upload restrictions
- API request validation

### File Management
- Multer file upload handling
- Image file type restrictions
- File size limits (10MB)
- Secure file storage

## 8. Development & Deployment

### Development Setup
- TypeScript for type safety
- Vite for fast development builds
- Hot reload for development
- Environment-based configuration

### Database Management
- Drizzle ORM for type-safe queries
- PostgreSQL with Neon serverless
- Database migrations via Drizzle Kit
- Connection pooling

### Build & Deployment
- Production build optimization
- Static file serving
- Environment variable management
- Health check endpoints

## 9. Integration Points

### External Services
- **Stripe**: Payment processing
- **OpenAI**: AI chatbot functionality
- **WhatsApp Business API**: Citizen communication
- **OpenStreetMap**: Geocoding services
- **Neon Database**: Serverless PostgreSQL

### Third-party Libraries
- **React Query**: Server state management
- **Framer Motion**: Animations
- **Recharts**: Data visualization
- **Lucide React**: Icons
- **React Hook Form**: Form management

## 10. Configuration

### Environment Variables
- `DATABASE_URL`: PostgreSQL connection string
- `NODE_ENV`: Development/production mode
- `VITE_*`: Frontend environment variables
- `OPENAI_API_KEY`: AI chatbot integration
- `STRIPE_*`: Payment processing keys

### Package Management
- npm with package-lock.json
- Dependency management
- DevDependencies separation
- Optional dependencies for performance

This comprehensive analysis covers all major aspects of the ADA Smart Munic citizen engagement platform, providing a complete overview of its architecture, functionality, and technical implementation.