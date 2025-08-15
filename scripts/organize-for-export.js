#!/usr/bin/env node

/**
 * Smart Munic - Code Organization Script for GitHub Export
 * 
 * This script organizes the codebase for clean GitHub export by:
 * - Creating proper directory structure
 * - Generating documentation index
 * - Cleaning up development files
 * - Preparing deployment configuration
 */

const fs = require('fs');
const path = require('path');

class CodeOrganizer {
  constructor() {
    this.rootDir = process.cwd();
    this.exportDir = path.join(this.rootDir, 'export-ready');
  }

  async organize() {
    console.log('🚀 Organizing Smart Munic codebase for GitHub export...\n');

    // Create export directory structure
    this.createDirectoryStructure();
    
    // Copy source files
    this.copySourceFiles();
    
    // Generate documentation index
    this.generateDocumentationIndex();
    
    // Create deployment configurations
    this.createDeploymentConfigs();
    
    // Generate file tree
    this.generateFileTree();
    
    console.log('✅ Code organization complete!');
    console.log(`📦 Export-ready code available in: ${this.exportDir}`);
    console.log('\n📋 Next steps:');
    console.log('1. Review the organized code structure');
    console.log('2. Update any environment-specific configurations');
    console.log('3. Test the application in the export directory');
    console.log('4. Create GitHub repository and push code');
  }

  createDirectoryStructure() {
    console.log('📁 Creating directory structure...');
    
    const dirs = [
      'export-ready',
      'export-ready/docs',
      'export-ready/scripts',
      'export-ready/config',
      'export-ready/.github',
      'export-ready/.github/workflows',
      'export-ready/.github/ISSUE_TEMPLATE'
    ];

    dirs.forEach(dir => {
      const fullPath = path.join(this.rootDir, dir);
      if (!fs.existsSync(fullPath)) {
        fs.mkdirSync(fullPath, { recursive: true });
      }
    });
  }

  copySourceFiles() {
    console.log('📋 Copying source files...');
    
    const filesToCopy = [
      'package.json',
      'package-lock.json',
      'tsconfig.json',
      'vite.config.ts',
      'vitest.config.ts',
      'tailwind.config.ts',
      'postcss.config.js',
      'components.json',
      'drizzle.config.ts',
      '.env.example',
      'README.md',
      'LICENSE',
      'CONTRIBUTING.md',
      'ARCHITECTURE.md',
      '.gitignore'
    ];

    const dirsToCopy = [
      'client',
      'server',
      'shared',
      'lib',
      'routes',
      'tests'
    ];

    // Copy files
    filesToCopy.forEach(file => {
      const src = path.join(this.rootDir, file);
      const dest = path.join(this.exportDir, file);
      if (fs.existsSync(src)) {
        fs.copyFileSync(src, dest);
      }
    });

    // Copy directories
    dirsToCopy.forEach(dir => {
      const src = path.join(this.rootDir, dir);
      const dest = path.join(this.exportDir, dir);
      if (fs.existsSync(src)) {
        this.copyDirectory(src, dest);
      }
    });
  }

  copyDirectory(src, dest) {
    if (!fs.existsSync(dest)) {
      fs.mkdirSync(dest, { recursive: true });
    }

    const items = fs.readdirSync(src);
    items.forEach(item => {
      const srcPath = path.join(src, item);
      const destPath = path.join(dest, item);
      
      if (fs.statSync(srcPath).isDirectory()) {
        this.copyDirectory(srcPath, destPath);
      } else {
        fs.copyFileSync(srcPath, destPath);
      }
    });
  }

  generateDocumentationIndex() {
    console.log('📚 Generating documentation index...');
    
    const docsIndex = `# Smart Munic Documentation

## 📖 Documentation Overview

This directory contains comprehensive documentation for the Smart Munic Municipal Services Management System.

## 📋 Available Documentation

### Core Documentation
- [README.md](../README.md) - Project overview and quick start guide
- [ARCHITECTURE.md](../ARCHITECTURE.md) - System architecture and technical design
- [CONTRIBUTING.md](../CONTRIBUTING.md) - Contribution guidelines and development setup

### Project Documentation
- [PROJECT_SUMMARY.md](../PROJECT_SUMMARY.md) - Detailed project overview
- [USER_FLOW_DOCUMENTATION.md](../USER_FLOW_DOCUMENTATION.md) - User experience flows
- [CLIENT_DOCUMENTATION_PACK.md](../CLIENT_DOCUMENTATION_PACK.md) - Client-specific documentation

### Technical Documentation
- [SMS_README.md](../SMS_README.md) - SMS integration documentation
- [TEST_SUITE_DOCUMENTATION.md](../TEST_SUITE_DOCUMENTATION.md) - Testing procedures
- [HOSTING_SECURITY_DOCUMENTATION.md](../HOSTING_SECURITY_DOCUMENTATION.md) - Security guidelines

### Development
- [CODEBASE_ANALYSIS.md](../CODEBASE_ANALYSIS.md) - Technical codebase analysis

## 🚀 Quick Navigation

### For Developers
1. Start with [README.md](../README.md) for project setup
2. Review [ARCHITECTURE.md](../ARCHITECTURE.md) for system understanding
3. Check [CONTRIBUTING.md](../CONTRIBUTING.md) for development guidelines

### For System Administrators
1. Review [HOSTING_SECURITY_DOCUMENTATION.md](../HOSTING_SECURITY_DOCUMENTATION.md)
2. Check deployment configuration in [README.md](../README.md)
3. Understand user flows in [USER_FLOW_DOCUMENTATION.md](../USER_FLOW_DOCUMENTATION.md)

### For End Users
1. Review [USER_FLOW_DOCUMENTATION.md](../USER_FLOW_DOCUMENTATION.md)
2. Check [CLIENT_DOCUMENTATION_PACK.md](../CLIENT_DOCUMENTATION_PACK.md)

## 📞 Support

For additional documentation or support:
- Create an issue in the GitHub repository
- Review the troubleshooting sections in individual documents
- Contact the development team

---
*Documentation Index - Generated automatically*`;

    fs.writeFileSync(path.join(this.exportDir, 'docs', 'README.md'), docsIndex);
  }

  createDeploymentConfigs() {
    console.log('⚙️ Creating deployment configurations...');
    
    // GitHub Actions workflow
    const githubWorkflow = `name: Smart Munic CI/CD

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest
    
    services:
      postgres:
        image: postgres:13
        env:
          POSTGRES_PASSWORD: postgres
          POSTGRES_DB: smart_munic_test
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: 'npm'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Run linting
      run: npm run lint
    
    - name: Run type checking
      run: npm run type-check
    
    - name: Run tests
      run: npm test
      env:
        DATABASE_URL: postgresql://postgres:postgres@localhost:5432/smart_munic_test
    
    - name: Build application
      run: npm run build

  security:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v3
    - name: Run security audit
      run: npm audit --audit-level moderate`;

    fs.writeFileSync(path.join(this.exportDir, '.github', 'workflows', 'ci.yml'), githubWorkflow);

    // Docker configuration
    const dockerfile = `FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY . .

# Build application
RUN npm run build

# Expose port
EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \\
  CMD curl -f http://localhost:5000/health || exit 1

# Start application
CMD ["npm", "start"]`;

    fs.writeFileSync(path.join(this.exportDir, 'Dockerfile'), dockerfile);

    // Docker Compose for development
    const dockerCompose = `version: '3.8'

services:
  app:
    build: .
    ports:
      - "5000:5000"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=postgresql://postgres:password@db:5432/smart_munic
    depends_on:
      - db
    volumes:
      - ./uploads:/app/uploads

  db:
    image: postgres:13
    environment:
      - POSTGRES_DB=smart_munic
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=password
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:`;

    fs.writeFileSync(path.join(this.exportDir, 'docker-compose.yml'), dockerCompose);

    // Issue templates
    const bugReport = `---
name: Bug report
about: Create a report to help us improve
title: '[BUG] '
labels: bug
assignees: ''
---

## Bug Description
A clear and concise description of what the bug is.

## Steps to Reproduce
1. Go to '...'
2. Click on '....'
3. Scroll down to '....'
4. See error

## Expected Behavior
A clear and concise description of what you expected to happen.

## Screenshots
If applicable, add screenshots to help explain your problem.

## Environment
- OS: [e.g. Windows, macOS, Linux]
- Browser: [e.g. Chrome, Firefox, Safari]
- Version: [e.g. 22]
- User Role: [e.g. Citizen, Admin, Technician]

## Additional Context
Add any other context about the problem here.`;

    fs.writeFileSync(path.join(this.exportDir, '.github', 'ISSUE_TEMPLATE', 'bug_report.md'), bugReport);
  }

  generateFileTree() {
    console.log('🌳 Generating project file tree...');
    
    const fileTree = `# Smart Munic - Project Structure

\`\`\`
smart-munic/
├── 📁 client/                     # Frontend React application
│   ├── 📁 src/
│   │   ├── 📁 components/         # Reusable UI components
│   │   │   ├── 📁 ui/            # Base UI components (shadcn/ui)
│   │   │   ├── 📄 issue-form.tsx # Issue reporting form
│   │   │   ├── 📄 issue-card.tsx # Issue display component
│   │   │   └── 📄 ...            # Other components
│   │   ├── 📁 pages/             # Page-level components
│   │   │   ├── 📄 citizen-dashboard.tsx
│   │   │   ├── 📄 admin-dashboard.tsx
│   │   │   ├── 📄 technician-dashboard.tsx
│   │   │   └── 📄 ...            # Other dashboards
│   │   ├── 📁 hooks/             # Custom React hooks
│   │   │   ├── 📄 useAuth.ts     # Authentication hook
│   │   │   └── 📄 use-toast.ts   # Toast notifications
│   │   ├── 📁 lib/               # Utility libraries
│   │   │   ├── 📄 queryClient.ts # TanStack Query config
│   │   │   └── 📄 utils.ts       # General utilities
│   │   ├── 📄 App.tsx            # Root component
│   │   └── 📄 main.tsx           # Application entry point
│   └── 📄 index.html             # HTML template
├── 📁 server/                     # Backend Express application
│   ├── 📄 index.ts               # Server entry point
│   ├── 📄 routes.ts              # Main API routes
│   └── 📄 storage.ts             # Database operations
├── 📁 shared/                     # Shared types and schemas
│   └── 📄 schema.ts              # Database schema (Drizzle)
├── 📁 lib/                       # Server-side utilities
│   └── 📄 smsClient.ts           # MTN SMS integration
├── 📁 routes/                    # API route modules
│   ├── 📄 sms.ts                 # SMS endpoints
│   ├── 📄 webhooks.ts            # Webhook handlers
│   └── 📄 dev.ts                 # Development utilities
├── 📁 tests/                     # Test files
│   ├── 📄 *.test.js              # Test suites
│   └── 📄 test-scenarios.md      # Testing documentation
├── 📁 uploads/                   # File upload storage
├── 📁 docs/                      # Documentation
│   └── 📄 README.md              # Documentation index
├── 📁 scripts/                   # Utility scripts
├── 📁 .github/                   # GitHub configuration
│   ├── 📁 workflows/             # GitHub Actions
│   └── 📁 ISSUE_TEMPLATE/        # Issue templates
├── 📄 package.json               # Dependencies and scripts
├── 📄 tsconfig.json              # TypeScript configuration
├── 📄 vite.config.ts             # Vite build configuration
├── 📄 tailwind.config.ts         # Tailwind CSS configuration
├── 📄 drizzle.config.ts          # Database configuration
├── 📄 README.md                  # Project overview
├── 📄 ARCHITECTURE.md            # System architecture
├── 📄 CONTRIBUTING.md            # Contribution guidelines
├── 📄 LICENSE                    # MIT License
├── 📄 .gitignore                 # Git ignore rules
├── 📄 .env.example               # Environment variables template
├── 📄 Dockerfile                 # Docker configuration
└── 📄 docker-compose.yml         # Docker Compose setup
\`\`\`

## 📊 File Statistics
- **Total Source Files**: ~150+ files
- **Frontend Components**: 25+ React components
- **Backend Routes**: 10+ API endpoints
- **Database Tables**: 8+ tables
- **Documentation Files**: 10+ comprehensive docs

## 🏗️ Key Architecture Components

### Frontend Structure
- **Modern React** with TypeScript and Vite
- **Component Library** using Radix UI and Tailwind CSS
- **State Management** with TanStack Query
- **Form Handling** with React Hook Form and Zod validation

### Backend Structure
- **Express.js** server with TypeScript
- **Database** operations with Drizzle ORM
- **Real-time** communication via WebSockets
- **File uploads** handled with Multer

### Integration Points
- **MTN OCEP SMS API** for messaging
- **WhatsApp Business API** for rich communication
- **Stripe** for payment processing
- **PostgreSQL** database via Neon

---
*Generated automatically by Smart Munic code organizer*`;

    fs.writeFileSync(path.join(this.exportDir, 'PROJECT_STRUCTURE.md'), fileTree);
  }
}

// Run the organizer
if (require.main === module) {
  const organizer = new CodeOrganizer();
  organizer.organize().catch(console.error);
}

module.exports = CodeOrganizer;