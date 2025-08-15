# Smart Munic - System Architecture

## 🏛️ Overview

Smart Munic is a full-stack municipal services management system built with modern web technologies. The architecture follows a client-server pattern with real-time communication capabilities and external service integrations.

## 📐 System Architecture Diagram

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Client        │    │   Server        │    │   External      │
│   (React)       │◄──►│   (Express)     │◄──►│   Services      │
│                 │    │                 │    │                 │
│ • React 18      │    │ • Node.js       │    │ • PostgreSQL    │
│ • TypeScript    │    │ • Express.js    │    │ • MTN SMS API   │
│ • Tailwind CSS  │    │ • WebSocket     │    │ • WhatsApp API  │
│ • TanStack Query│    │ • TypeScript    │    │ • Stripe        │
│ • Wouter        │    │ • Drizzle ORM   │    │ • Maps API      │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 🔧 Technology Stack

### Frontend Layer
- **React 18** - Modern React with concurrent features
- **TypeScript** - Type safety and development experience
- **Vite** - Fast build tool and development server
- **Tailwind CSS** - Utility-first CSS framework
- **Radix UI + shadcn/ui** - Accessible component primitives
- **TanStack Query** - Server state management
- **Wouter** - Lightweight client-side routing
- **React Hook Form + Zod** - Form handling and validation

### Backend Layer
- **Node.js** - JavaScript runtime
- **Express.js** - Web application framework
- **TypeScript** - Type-safe server development
- **Drizzle ORM** - Type-safe database operations
- **Express Sessions** - Session management
- **Multer** - File upload handling
- **WebSocket** - Real-time communication

### Database Layer
- **PostgreSQL** - Primary relational database
- **Neon Database** - Serverless PostgreSQL hosting
- **Connection pooling** - Efficient database connections
- **Session store** - PostgreSQL-backed sessions

### External Integrations
- **MTN OCEP SMS API** - SMS communication services
- **WhatsApp Business API** - Rich messaging
- **Stripe** - Payment processing
- **Google Maps/OpenStreetMap** - Location services
- **File storage** - Local file system (configurable)

## 🏗️ Application Architecture

### Client-Side Architecture

```
client/src/
├── main.tsx              # Application entry point
├── App.tsx               # Root component with routing
├── components/           # Reusable UI components
│   ├── ui/              # Base UI components (shadcn/ui)
│   ├── forms/           # Form components
│   ├── layouts/         # Layout components
│   └── features/        # Feature-specific components
├── pages/               # Page-level components
│   ├── auth/           # Authentication pages
│   ├── dashboard/      # Dashboard variants
│   └── reports/        # Reporting interfaces
├── hooks/              # Custom React hooks
├── lib/                # Utility libraries
│   ├── api.ts         # API client configuration
│   ├── auth.ts        # Authentication utilities
│   └── utils.ts       # General utilities
└── types/              # TypeScript type definitions
```

### Server-Side Architecture

```
server/
├── index.ts            # Server entry point
├── routes.ts           # Main API route definitions
├── storage.ts          # Database operations interface
├── middleware/         # Express middleware
└── utils/              # Server utilities

lib/
├── smsClient.ts        # MTN SMS integration
└── webhooks.ts         # Webhook handlers

routes/
├── auth.ts             # Authentication routes
├── issues.ts           # Issue management routes
├── users.ts            # User management routes
├── sms.ts              # SMS API routes
├── webhooks.ts         # Webhook endpoints
└── dev.ts              # Development utilities
```

### Database Schema Architecture

```
shared/
└── schema.ts           # Centralized database schema
    ├── users           # User accounts and roles
    ├── issues          # Municipal issues
    ├── assignments     # Technician assignments
    ├── messages        # SMS/communication logs
    ├── payments        # Payment transactions
    └── locations       # GPS tracking data
```

## 🔄 Data Flow

### Request-Response Flow
1. **Client Request** - User interaction triggers API call
2. **Authentication** - Session validation middleware
3. **Route Handler** - Express route processes request
4. **Data Layer** - Drizzle ORM queries PostgreSQL
5. **Response** - JSON data returned to client
6. **State Update** - TanStack Query updates client state

### Real-time Communication Flow
1. **WebSocket Connection** - Client establishes WS connection
2. **Event Subscription** - Client subscribes to relevant events
3. **Server Events** - Server broadcasts updates
4. **Client Updates** - Real-time UI updates

### File Upload Flow
1. **Client Upload** - Multer middleware handles files
2. **File Storage** - Files saved to uploads directory
3. **Database Reference** - File paths stored in database
4. **Client Access** - Files served via static routes

## 🔐 Security Architecture

### Authentication & Authorization
- **Session-based Auth** - Express sessions with PostgreSQL store
- **Role-based Access** - Multiple user roles with permissions
- **Route Protection** - Middleware validates user access
- **Password Security** - Bcrypt hashing

### Data Security
- **Input Validation** - Zod schemas validate all inputs
- **SQL Injection Prevention** - Drizzle ORM parameterized queries
- **XSS Protection** - React's built-in XSS prevention
- **CSRF Protection** - Session-based CSRF tokens

### API Security
- **Rate Limiting** - Configurable rate limits
- **Webhook Validation** - Token-based webhook security
- **Environment Variables** - Sensitive data in environment vars
- **HTTPS Enforcement** - SSL/TLS in production

## 📱 Real-time Features

### WebSocket Implementation
- **Connection Management** - Persistent WebSocket connections
- **Event Broadcasting** - Server-side event emission
- **Client Subscriptions** - Topic-based event subscriptions
- **Automatic Reconnection** - Client-side connection recovery

### Real-time Use Cases
- **Issue Status Updates** - Live status changes
- **Technician Location** - GPS tracking updates
- **Notifications** - Instant notifications
- **Chat/Messaging** - Real-time communication

## 🌐 External Service Integration

### MTN SMS API Integration
```
MTN OCEP API
├── Send SMS          # Outbound messaging
├── Delivery Receipts # Message status tracking
├── Incoming Messages # Inbound message handling
└── Webhook Security  # Token validation
```

### Payment Integration
```
Stripe Integration
├── Payment Processing # Credit card transactions
├── Subscription Management # Recurring payments
├── Webhook Handling  # Payment status updates
└── Refund Processing # Payment reversals
```

## 🔧 Development Architecture

### Build System
- **Vite** - Frontend build and development
- **TypeScript Compiler** - Type checking and compilation
- **Hot Module Replacement** - Fast development feedback
- **Static Asset Handling** - Optimized asset processing

### Development Tools
- **ESLint** - Code linting and quality
- **Prettier** - Code formatting
- **TypeScript** - Static type checking
- **Drizzle Kit** - Database schema management

## 📊 Performance Considerations

### Client-Side Optimization
- **Code Splitting** - Lazy-loaded routes and components
- **Query Caching** - TanStack Query intelligent caching
- **Optimistic Updates** - Immediate UI feedback
- **Image Optimization** - Responsive images and lazy loading

### Server-Side Optimization
- **Connection Pooling** - Efficient database connections
- **Query Optimization** - Indexed database queries
- **Caching Strategy** - Redis-ready caching layer
- **Background Jobs** - Async processing capabilities

### Database Optimization
- **Indexed Queries** - Strategic database indexing
- **Query Optimization** - Efficient SQL generation
- **Connection Management** - Pool-based connections
- **Schema Design** - Normalized data structure

## 🚀 Deployment Architecture

### Production Environment
```
Replit Platform
├── Application Server  # Express.js application
├── Database           # Neon PostgreSQL
├── File Storage       # Local file system
├── SSL/TLS           # Automatic HTTPS
└── Monitoring        # Built-in monitoring
```

### Scaling Considerations
- **Horizontal Scaling** - Multiple server instances
- **Database Scaling** - Read replicas and connection pooling
- **CDN Integration** - Static asset distribution
- **Load Balancing** - Traffic distribution

## 🔄 Future Architecture Enhancements

### Planned Improvements
- **Microservices** - Service decomposition
- **API Gateway** - Centralized API management
- **Event Sourcing** - Audit trail and replay capabilities
- **CQRS Pattern** - Separate read/write models
- **Container Deployment** - Docker containerization
- **CI/CD Pipeline** - Automated deployment

### Technology Roadmap
- **Mobile Apps** - React Native implementation
- **PWA Features** - Offline capabilities
- **AI Integration** - Machine learning features
- **Advanced Analytics** - Business intelligence
- **Multi-tenant** - SaaS architecture

---

This architecture provides a solid foundation for a scalable, maintainable municipal services management system while allowing for future enhancements and integrations.