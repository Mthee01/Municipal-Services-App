# Smart Munic - Municipal Services Management System

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-18+-blue.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5+-blue.svg)](https://www.typescriptlang.org/)

A comprehensive municipal services management system designed to streamline interactions between citizens, municipal officials, and service providers. Built with modern web technologies and enhanced with MTN integration for communication services.

## 🌟 Features

### Core Functionality
- **Multi-Role Authentication** - Citizens, admins, mayors, ward councillors, tech managers, field technicians, call centre agents
- **Issue Management** - Citizens report municipal issues with photo uploads and real-time tracking
- **Technician Dispatch** - GPS tracking, work order management, completion reports
- **Communication Layer** - WhatsApp Business API, MTN OCEP SMS integration, real-time notifications
- **Payment System** - Municipal payments, prepaid utility vouchers, Stripe integration
- **Analytics Dashboard** - Performance insights, ward-specific reporting, AI-powered analytics

### Advanced Features
- **Real-time WebSocket Communication** - Live updates and notifications
- **GPS/GIS Integration** - Location tracking with Leaflet maps
- **Multi-language Support** - English, Afrikaans, Zulu, Xhosa
- **Photo Documentation** - Issue reporting and completion verification
- **Parts Inventory Management** - Technician workflow integration
- **Responsive Design** - Mobile-first approach with Tailwind CSS

## 🏗️ Tech Stack

### Frontend
- **React 18** with TypeScript
- **Vite** - Build tool and development server
- **Tailwind CSS** - Utility-first styling framework
- **Radix UI** - Accessible component primitives
- **TanStack Query** - Data fetching and state management
- **Wouter** - Lightweight routing
- **React Hook Form** - Form handling with Zod validation

### Backend
- **Node.js** with Express.js
- **TypeScript** - Type-safe development
- **PostgreSQL** - Primary database (via Neon Database)
- **Drizzle ORM** - Type-safe database operations
- **WebSocket** - Real-time communication
- **Express Sessions** - Authentication management

### External Integrations
- **MTN OCEP SMS API** - SMS communication with delivery receipts
- **WhatsApp Business API** - Rich messaging capabilities
- **Stripe** - Payment processing
- **Google Maps/OpenStreetMap** - Mapping and location services

## 🚀 Getting Started

### Prerequisites
- Node.js 18 or higher
- PostgreSQL database
- MTN OCEP API credentials (optional)
- Stripe account (optional)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/smart-munic.git
   cd smart-munic
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   ```bash
   cp .env.example .env
   ```
   
   Configure the following environment variables:
   ```env
   DATABASE_URL=your_postgresql_connection_string
   SESSION_SECRET=your_session_secret
   MTN_API_KEY=your_mtn_api_key
   MTN_API_SECRET=your_mtn_api_secret
   STRIPE_SECRET_KEY=your_stripe_secret_key
   ```

4. **Database Setup**
   ```bash
   npm run db:push
   ```

5. **Start Development Server**
   ```bash
   npm run dev
   ```

The application will be available at `http://localhost:5000`

## 📁 Project Structure

```
smart-munic/
├── client/                     # Frontend React application
│   ├── src/
│   │   ├── components/         # Reusable UI components
│   │   ├── pages/             # Page components
│   │   ├── hooks/             # Custom React hooks
│   │   ├── lib/               # Utility libraries
│   │   └── main.tsx           # Application entry point
├── server/                     # Backend Express application
│   ├── routes.ts              # API route definitions
│   ├── storage.ts             # Database operations
│   └── index.ts               # Server entry point
├── shared/                     # Shared types and schemas
│   └── schema.ts              # Database schema and types
├── lib/                       # Server-side utilities
│   └── smsClient.ts           # MTN SMS integration
├── routes/                    # Additional route modules
│   ├── sms.ts                 # SMS API endpoints
│   ├── webhooks.ts            # Webhook handlers
│   └── dev.ts                 # Development utilities
├── uploads/                   # File upload storage
├── tests/                     # Test files
└── attached_assets/           # Static assets
```

## 🔧 Development

### Available Scripts
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run db:push` - Push database schema changes
- `npm run test` - Run test suite

### Database Management
The project uses Drizzle ORM for database operations. Schema changes should be made in `shared/schema.ts` and applied using:
```bash
npm run db:push
```

### SMS Integration
MTN OCEP SMS integration includes:
- Send SMS endpoint: `/api/sms/send`
- Delivery receipt webhook: `/webhooks/mtn/dlr`
- Incoming message webhook: `/webhooks/mtn/mo`
- Development utilities: `/api/dev/*`

## 🔐 Authentication & Roles

### User Roles
1. **Citizen** - Report issues, track progress, make payments
2. **Admin** - User management, system configuration
3. **Mayor** - Executive dashboard, city-wide analytics
4. **Ward Councillor** - Ward-specific issue management
5. **Tech Manager** - Technician oversight, approval workflows
6. **Field Technician** - Issue resolution, GPS tracking
7. **Call Centre Agent** - Citizen assistance, issue creation

### Default Credentials
- **Admin**: `admin` / `adminpass`

## 🌐 Deployment

### Replit Deployment
The application is configured for Replit deployment:
1. Import the project to Replit
2. Configure environment variables in Secrets
3. Run the application using the "Start application" workflow

### Production Considerations
- Configure PostgreSQL database
- Set up SSL certificates
- Configure webhook URLs for MTN integration
- Set up monitoring and logging
- Configure backup strategies

## 📡 API Documentation

### Core Endpoints
- `GET /api/issues` - Retrieve issues
- `POST /api/issues` - Create new issue
- `PUT /api/issues/:id` - Update issue status
- `POST /api/auth/login` - User authentication
- `POST /api/sms/send` - Send SMS messages

### Webhook Endpoints
- `POST /webhooks/mtn/dlr` - SMS delivery receipts
- `POST /webhooks/mtn/mo` - Incoming SMS messages

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📋 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:
- Create an issue in the GitHub repository
- Contact the development team
- Check the documentation in `/docs` folder

## 🔄 Recent Updates

- Enhanced MTN logo integration with professional styling
- Completed SMS module with webhook support
- Fixed admin dashboard user management functionality
- Implemented secure user registration system
- Added real-time location tracking for technicians

## 🚧 Roadmap

- [ ] Mobile application development
- [ ] Advanced AI analytics integration
- [ ] Multi-tenant architecture
- [ ] Enhanced reporting features
- [ ] API rate limiting and security enhancements

---

**Built with ❤️ for South African municipalities**

*Developed by MTN - Empowering Local Government*