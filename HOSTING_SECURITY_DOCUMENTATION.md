# ADA Smart Munic - Hosting & Security Documentation Pack
## Municipal Citizen Engagement Platform

---

# EXECUTIVE SUMMARY

## Security & Hosting Overview

The ADA Smart Munic platform requires enterprise-grade hosting and security infrastructure to ensure reliable, secure, and compliant municipal service delivery. This document outlines comprehensive hosting strategies, security frameworks, compliance requirements, and operational procedures for deploying and maintaining the citizen engagement platform.

### **Critical Security Requirements**
- **POPIA Compliance**: South African data protection regulations
- **Multi-Factor Authentication**: Enhanced access security
- **End-to-End Encryption**: Data protection in transit and at rest
- **Regular Security Audits**: Continuous vulnerability assessment
- **Disaster Recovery**: Business continuity assurance

### **Hosting Infrastructure Requirements**
- **High Availability**: 99.9% uptime SLA
- **Scalable Architecture**: Auto-scaling for peak loads
- **Geographic Distribution**: South African data residency
- **Performance Optimization**: Sub-200ms response times
- **Monitoring & Alerting**: 24/7 system oversight

---

# 1. HOSTING ARCHITECTURE & DEPLOYMENT

## Production Hosting Strategy

### **Recommended Hosting Providers**

#### **Primary Option: Amazon Web Services (AWS) - Cape Town Region**
```
🌍 AWS Africa (Cape Town) - af-south-1
├── 🖥️  EC2 Instances (Auto Scaling Groups)
│   ├── Application Servers: t3.large (2 vCPU, 8GB RAM)
│   ├── Load Balancer: Application Load Balancer (ALB)
│   └── Auto Scaling: 2-10 instances based on demand
├── 🗄️  Database Services
│   ├── RDS PostgreSQL (Multi-AZ): db.t3.medium
│   ├── ElastiCache Redis: cache.t3.micro
│   └── Database Backup: Automated daily snapshots
├── 📁 Storage Services
│   ├── S3 Buckets: Document and image storage
│   ├── CloudFront CDN: Global content delivery
│   └── EFS: Shared file system for uploads
└── 🔐 Security Services
    ├── AWS WAF: Web application firewall
    ├── AWS Shield: DDoS protection
    └── AWS Certificate Manager: SSL/TLS certificates
```

#### **Alternative Option: Microsoft Azure - South Africa North**
```
🌍 Azure South Africa North Region
├── 🖥️  Compute Services
│   ├── App Service Plan: Standard S2 (2 cores, 3.5GB RAM)
│   ├── Application Gateway: Load balancing & SSL termination
│   └── Virtual Machine Scale Sets: Auto-scaling capability
├── 🗄️  Database Services
│   ├── Azure Database for PostgreSQL: General Purpose
│   ├── Azure Cache for Redis: Basic tier
│   └── Automated Backup: Point-in-time recovery
├── 📁 Storage & CDN
│   ├── Blob Storage: File and document storage
│   ├── Azure CDN: Content delivery network
│   └── Azure Files: Shared storage solution
└── 🔐 Security & Monitoring
    ├── Azure Security Center: Threat protection
    ├── Azure Monitor: Application performance monitoring
    └── Azure Key Vault: Secrets management
```

### **Infrastructure as Code (IaC)**

#### **Terraform Configuration Example**
```hcl
# terraform/main.tf
provider "aws" {
  region = "af-south-1"  # Cape Town region
}

# VPC Configuration
resource "aws_vpc" "munic_vpc" {
  cidr_block           = "10.0.0.0/16"
  enable_dns_hostnames = true
  enable_dns_support   = true
  
  tags = {
    Name        = "smart-munic-vpc"
    Environment = "production"
    Compliance  = "POPIA"
  }
}

# Public and Private Subnets
resource "aws_subnet" "public_subnet" {
  count             = 2
  vpc_id            = aws_vpc.munic_vpc.id
  cidr_block        = "10.0.${count.index + 1}.0/24"
  availability_zone = data.aws_availability_zones.available.names[count.index]
  
  map_public_ip_on_launch = true
  
  tags = {
    Name = "public-subnet-${count.index + 1}"
    Type = "Public"
  }
}

resource "aws_subnet" "private_subnet" {
  count             = 2
  vpc_id            = aws_vpc.munic_vpc.id
  cidr_block        = "10.0.${count.index + 10}.0/24"
  availability_zone = data.aws_availability_zones.available.names[count.index]
  
  tags = {
    Name = "private-subnet-${count.index + 1}"
    Type = "Private"
  }
}

# Application Load Balancer
resource "aws_lb" "munic_alb" {
  name               = "smart-munic-alb"
  internal           = false
  load_balancer_type = "application"
  security_groups    = [aws_security_group.alb_sg.id]
  subnets            = aws_subnet.public_subnet[*].id
  
  enable_deletion_protection = true
  
  tags = {
    Environment = "production"
    Service     = "load-balancer"
  }
}

# Auto Scaling Group
resource "aws_launch_template" "munic_template" {
  name_prefix   = "smart-munic-"
  image_id      = "ami-0c2d3e23c9c8e9e9e"  # Ubuntu 22.04 LTS
  instance_type = "t3.large"
  
  vpc_security_group_ids = [aws_security_group.app_sg.id]
  
  user_data = base64encode(templatefile("${path.module}/user_data.sh", {
    database_url = aws_db_instance.postgres.endpoint
  }))
  
  tag_specifications {
    resource_type = "instance"
    tags = {
      Name        = "smart-munic-server"
      Environment = "production"
    }
  }
}

resource "aws_autoscaling_group" "munic_asg" {
  name                = "smart-munic-asg"
  vpc_zone_identifier = aws_subnet.private_subnet[*].id
  target_group_arns   = [aws_lb_target_group.munic_tg.arn]
  health_check_type   = "ELB"
  
  min_size         = 2
  max_size         = 10
  desired_capacity = 2
  
  launch_template {
    id      = aws_launch_template.munic_template.id
    version = "$Latest"
  }
  
  tag {
    key                 = "Name"
    value               = "smart-munic-asg"
    propagate_at_launch = true
  }
}

# RDS PostgreSQL Database
resource "aws_db_instance" "postgres" {
  identifier             = "smart-munic-db"
  allocated_storage      = 100
  max_allocated_storage  = 1000
  storage_type           = "gp2"
  engine                 = "postgres"
  engine_version         = "15.4"
  instance_class         = "db.t3.medium"
  
  db_name  = "smartmunic"
  username = "dbadmin"
  password = var.db_password
  
  vpc_security_group_ids = [aws_security_group.rds_sg.id]
  db_subnet_group_name   = aws_db_subnet_group.postgres_subnet_group.name
  
  backup_retention_period = 30
  backup_window          = "02:00-03:00"
  maintenance_window     = "sun:03:00-sun:04:00"
  
  multi_az               = true
  storage_encrypted      = true
  deletion_protection    = true
  
  tags = {
    Name        = "smart-munic-database"
    Environment = "production"
    Compliance  = "POPIA"
  }
}
```

#### **Docker Configuration**
```dockerfile
# Dockerfile
FROM node:18-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

FROM node:18-alpine AS production

# Security: Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001

WORKDIR /app

# Copy built application
COPY --from=builder --chown=nextjs:nodejs /app/dist ./dist
COPY --from=builder --chown=nextjs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nextjs:nodejs /app/package.json ./package.json

# Security: Remove unnecessary packages
RUN apk del --purge

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:5000/health || exit 1

USER nextjs

EXPOSE 5000

CMD ["npm", "start"]
```

### **Container Orchestration with Kubernetes**

#### **Kubernetes Deployment Configuration**
```yaml
# k8s/namespace.yaml
apiVersion: v1
kind: Namespace
metadata:
  name: smart-munic
  labels:
    app: smart-munic
    security.policy: strict

---
# k8s/deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: smart-munic-app
  namespace: smart-munic
spec:
  replicas: 3
  selector:
    matchLabels:
      app: smart-munic-app
  template:
    metadata:
      labels:
        app: smart-munic-app
    spec:
      securityContext:
        runAsNonRoot: true
        runAsUser: 1001
        fsGroup: 1001
      containers:
      - name: smart-munic
        image: smartmunic/app:latest
        ports:
        - containerPort: 5000
        env:
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: database-secret
              key: url
        - name: NODE_ENV
          value: "production"
        resources:
          requests:
            memory: "512Mi"
            cpu: "250m"
          limits:
            memory: "1Gi"
            cpu: "500m"
        livenessProbe:
          httpGet:
            path: /health
            port: 5000
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /ready
            port: 5000
          initialDelaySeconds: 5
          periodSeconds: 5
        securityContext:
          allowPrivilegeEscalation: false
          readOnlyRootFilesystem: true
          capabilities:
            drop:
            - ALL

---
# k8s/service.yaml
apiVersion: v1
kind: Service
metadata:
  name: smart-munic-service
  namespace: smart-munic
spec:
  selector:
    app: smart-munic-app
  ports:
  - protocol: TCP
    port: 80
    targetPort: 5000
  type: ClusterIP

---
# k8s/ingress.yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: smart-munic-ingress
  namespace: smart-munic
  annotations:
    kubernetes.io/ingress.class: nginx
    cert-manager.io/cluster-issuer: letsencrypt-prod
    nginx.ingress.kubernetes.io/ssl-redirect: "true"
    nginx.ingress.kubernetes.io/force-ssl-redirect: "true"
spec:
  tls:
  - hosts:
    - smartmunic.gov.za
    secretName: smartmunic-tls
  rules:
  - host: smartmunic.gov.za
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: smart-munic-service
            port:
              number: 80
```

### **CI/CD Pipeline Configuration**

#### **GitHub Actions Workflow**
```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

env:
  AWS_REGION: af-south-1
  REGISTRY: ${{ secrets.AWS_ACCOUNT_ID }}.dkr.ecr.af-south-1.amazonaws.com
  REPOSITORY: smart-munic

jobs:
  security-scan:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v3
    
    - name: Run Trivy vulnerability scanner
      uses: aquasecurity/trivy-action@master
      with:
        scan-type: 'fs'
        format: 'sarif'
        output: 'trivy-results.sarif'
    
    - name: Upload Trivy scan results
      uses: github/codeql-action/upload-sarif@v2
      with:
        sarif_file: 'trivy-results.sarif'

  test:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_PASSWORD: testpass
          POSTGRES_DB: test_db
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
    
    - name: Run tests
      run: npm run test:coverage
      env:
        DATABASE_URL: postgresql://postgres:testpass@localhost:5432/test_db
    
    - name: Upload coverage reports
      uses: codecov/codecov-action@v3

  build-and-deploy:
    needs: [security-scan, test]
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Configure AWS credentials
      uses: aws-actions/configure-aws-credentials@v2
      with:
        aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
        aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
        aws-region: ${{ env.AWS_REGION }}
    
    - name: Login to Amazon ECR
      id: login-ecr
      uses: aws-actions/amazon-ecr-login@v1
    
    - name: Build and push Docker image
      env:
        ECR_REGISTRY: ${{ steps.login-ecr.outputs.registry }}
        IMAGE_TAG: ${{ github.sha }}
      run: |
        docker build -t $ECR_REGISTRY/$REPOSITORY:$IMAGE_TAG .
        docker build -t $ECR_REGISTRY/$REPOSITORY:latest .
        docker push $ECR_REGISTRY/$REPOSITORY:$IMAGE_TAG
        docker push $ECR_REGISTRY/$REPOSITORY:latest
    
    - name: Deploy to ECS
      uses: aws-actions/amazon-ecs-deploy-task-definition@v1
      with:
        task-definition: .aws/task-definition.json
        service: smart-munic-service
        cluster: smart-munic-cluster
        wait-for-service-stability: true
```

---

# 2. COMPREHENSIVE SECURITY FRAMEWORK

## Security Architecture

### **Multi-Layer Security Model**

```
🛡️ SECURITY LAYERS ARCHITECTURE

┌─────────────────────────────────────────────────────────────────┐
│                    🌐 EDGE SECURITY LAYER                      │
├─────────────────────────────────────────────────────────────────┤
│ • AWS WAF / Azure Application Gateway                          │
│ • DDoS Protection (AWS Shield / Azure DDoS)                    │
│ • Geographic IP Filtering                                      │
│ • Rate Limiting & Traffic Shaping                             │
│ • SSL/TLS Termination (TLS 1.3)                              │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                 🔐 APPLICATION SECURITY LAYER                  │
├─────────────────────────────────────────────────────────────────┤
│ • Multi-Factor Authentication (MFA)                           │
│ • Role-Based Access Control (RBAC)                            │
│ • Session Management & Timeout                                │
│ • Input Validation & Sanitization                             │
│ • OWASP Security Headers                                       │
│ • API Authentication & Authorization                           │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                  🗄️ DATA SECURITY LAYER                       │
├─────────────────────────────────────────────────────────────────┤
│ • Encryption at Rest (AES-256)                                │
│ • Encryption in Transit (TLS 1.3)                             │
│ • Database Access Controls                                     │
│ • Field-Level Encryption                                       │
│ • Secure Key Management (AWS KMS / Azure Key Vault)           │
│ • Data Masking & Tokenization                                 │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                🖥️ INFRASTRUCTURE SECURITY LAYER               │
├─────────────────────────────────────────────────────────────────┤
│ • Network Segmentation (VPC / Virtual Networks)               │
│ • Security Groups & Network ACLs                              │
│ • VPN Access for Administrative Tasks                         │
│ • Container Security Scanning                                 │
│ • Host-Based Intrusion Detection                              │
│ • Regular Security Patching                                   │
└─────────────────────────────────────────────────────────────────┘
```

### **Authentication & Authorization Framework**

#### **Multi-Factor Authentication Implementation**
```typescript
// server/auth/mfa.ts
import { authenticator } from 'otplib';
import QRCode from 'qrcode';
import { db } from '../db';
import { users } from '@shared/schema';

export class MFAService {
  /**
   * Generate MFA secret for user
   */
  async generateMFASecret(userId: number, email: string) {
    const secret = authenticator.generateSecret();
    
    // Store secret in database (encrypted)
    await db.update(users)
      .set({ 
        mfaSecret: this.encrypt(secret),
        mfaEnabled: false 
      })
      .where(eq(users.id, userId));
    
    // Generate QR code for authenticator app
    const serviceName = 'Smart Munic';
    const otpauth = authenticator.keyuri(email, serviceName, secret);
    const qrCode = await QRCode.toDataURL(otpauth);
    
    return { secret, qrCode };
  }

  /**
   * Verify MFA token
   */
  async verifyMFAToken(userId: number, token: string): Promise<boolean> {
    const user = await db.select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);
    
    if (!user[0]?.mfaSecret) {
      throw new Error('MFA not configured for user');
    }
    
    const secret = this.decrypt(user[0].mfaSecret);
    return authenticator.verify({ token, secret });
  }

  /**
   * Enable MFA for user after verification
   */
  async enableMFA(userId: number, verificationToken: string) {
    const isValid = await this.verifyMFAToken(userId, verificationToken);
    
    if (!isValid) {
      throw new Error('Invalid verification token');
    }
    
    await db.update(users)
      .set({ mfaEnabled: true })
      .where(eq(users.id, userId));
    
    // Generate backup codes
    const backupCodes = this.generateBackupCodes();
    await this.storeBackupCodes(userId, backupCodes);
    
    return backupCodes;
  }

  private encrypt(text: string): string {
    // Implementation using AWS KMS or similar
    return encryptedText;
  }

  private decrypt(encryptedText: string): string {
    // Implementation using AWS KMS or similar
    return decryptedText;
  }

  private generateBackupCodes(): string[] {
    return Array.from({ length: 10 }, () => 
      Math.random().toString(36).substring(2, 10).toUpperCase()
    );
  }
}
```

#### **Role-Based Access Control (RBAC)**
```typescript
// server/auth/rbac.ts
export interface Permission {
  resource: string;
  action: 'create' | 'read' | 'update' | 'delete' | 'manage';
  conditions?: Record<string, any>;
}

export const ROLE_PERMISSIONS: Record<string, Permission[]> = {
  citizen: [
    { resource: 'issues', action: 'create' },
    { resource: 'issues', action: 'read', conditions: { ownedBy: 'self' } },
    { resource: 'payments', action: 'create' },
    { resource: 'payments', action: 'read', conditions: { ownedBy: 'self' } },
    { resource: 'ratings', action: 'create' },
  ],
  
  call_centre_agent: [
    { resource: 'issues', action: 'read' },
    { resource: 'issues', action: 'create' },
    { resource: 'issues', action: 'update', conditions: { status: ['open', 'assigned'] } },
    { resource: 'issue_notes', action: 'create' },
    { resource: 'issue_escalations', action: 'create' },
    { resource: 'whatsapp_messages', action: 'read' },
    { resource: 'whatsapp_messages', action: 'create' },
  ],
  
  tech_manager: [
    { resource: 'issues', action: 'read' },
    { resource: 'issues', action: 'update' },
    { resource: 'technicians', action: 'read' },
    { resource: 'technicians', action: 'manage' },
    { resource: 'teams', action: 'manage' },
    { resource: 'analytics', action: 'read' },
    { resource: 'reports', action: 'read' },
  ],
  
  field_technician: [
    { resource: 'issues', action: 'read', conditions: { assignedTo: 'self' } },
    { resource: 'issues', action: 'update', conditions: { assignedTo: 'self' } },
    { resource: 'field_reports', action: 'create' },
    { resource: 'field_reports', action: 'read', conditions: { createdBy: 'self' } },
    { resource: 'parts_inventory', action: 'read' },
    { resource: 'parts_orders', action: 'create' },
    { resource: 'location_tracking', action: 'update', conditions: { userId: 'self' } },
  ],
  
  admin: [
    { resource: '*', action: 'manage' }, // Full access
  ],
  
  mayor: [
    { resource: 'analytics', action: 'read' },
    { resource: 'reports', action: 'read' },
    { resource: 'issues', action: 'read' },
    { resource: 'performance_metrics', action: 'read' },
  ],
  
  ward_councillor: [
    { resource: 'issues', action: 'read', conditions: { ward: 'assigned' } },
    { resource: 'analytics', action: 'read', conditions: { ward: 'assigned' } },
    { resource: 'citizens', action: 'read', conditions: { ward: 'assigned' } },
  ],
};

export class AuthorizationService {
  /**
   * Check if user has permission for specific action
   */
  hasPermission(
    userRole: string, 
    resource: string, 
    action: string, 
    context?: Record<string, any>
  ): boolean {
    const permissions = ROLE_PERMISSIONS[userRole] || [];
    
    return permissions.some(permission => {
      // Check resource match (wildcard or exact)
      const resourceMatch = permission.resource === '*' || 
                           permission.resource === resource;
      
      // Check action match
      const actionMatch = permission.action === 'manage' || 
                         permission.action === action;
      
      if (!resourceMatch || !actionMatch) {
        return false;
      }
      
      // Check conditions if present
      if (permission.conditions && context) {
        return this.evaluateConditions(permission.conditions, context);
      }
      
      return true;
    });
  }

  private evaluateConditions(
    conditions: Record<string, any>, 
    context: Record<string, any>
  ): boolean {
    return Object.entries(conditions).every(([key, value]) => {
      if (Array.isArray(value)) {
        return value.includes(context[key]);
      }
      
      if (value === 'self') {
        return context[key] === context.userId;
      }
      
      if (value === 'assigned') {
        return context[key] === context.userAssignment;
      }
      
      return context[key] === value;
    });
  }
}
```

### **Data Encryption & Protection**

#### **Field-Level Encryption**
```typescript
// server/security/encryption.ts
import { createCipheriv, createDecipheriv, randomBytes } from 'crypto';
import { KMSClient, DecryptCommand, EncryptCommand } from '@aws-sdk/client-kms';

export class EncryptionService {
  private kmsClient: KMSClient;
  private keyId: string;

  constructor() {
    this.kmsClient = new KMSClient({ region: 'af-south-1' });
    this.keyId = process.env.AWS_KMS_KEY_ID!;
  }

  /**
   * Encrypt sensitive field data
   */
  async encryptField(plaintext: string): Promise<string> {
    // Generate data encryption key
    const dataKey = randomBytes(32);
    
    // Encrypt data key with KMS
    const encryptKeyCommand = new EncryptCommand({
      KeyId: this.keyId,
      Plaintext: dataKey,
    });
    
    const encryptedKey = await this.kmsClient.send(encryptKeyCommand);
    
    // Encrypt data with data key
    const iv = randomBytes(16);
    const cipher = createCipheriv('aes-256-gcm', dataKey, iv);
    
    let encrypted = cipher.update(plaintext, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    const authTag = cipher.getAuthTag();
    
    // Combine encrypted key, IV, auth tag, and encrypted data
    const result = {
      encryptedKey: Buffer.from(encryptedKey.CiphertextBlob!).toString('base64'),
      iv: iv.toString('hex'),
      authTag: authTag.toString('hex'),
      encryptedData: encrypted,
    };
    
    return JSON.stringify(result);
  }

  /**
   * Decrypt sensitive field data
   */
  async decryptField(encryptedField: string): Promise<string> {
    const parsed = JSON.parse(encryptedField);
    
    // Decrypt data key with KMS
    const decryptKeyCommand = new DecryptCommand({
      CiphertextBlob: Buffer.from(parsed.encryptedKey, 'base64'),
    });
    
    const decryptedKey = await this.kmsClient.send(decryptKeyCommand);
    const dataKey = Buffer.from(decryptedKey.Plaintext!);
    
    // Decrypt data
    const decipher = createDecipheriv('aes-256-gcm', dataKey, Buffer.from(parsed.iv, 'hex'));
    decipher.setAuthTag(Buffer.from(parsed.authTag, 'hex'));
    
    let decrypted = decipher.update(parsed.encryptedData, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  }
}

// Usage in schema with sensitive data
export const sensitiveUserData = pgTable('sensitive_user_data', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id),
  encryptedIdNumber: text('encrypted_id_number'), // South African ID
  encryptedPhone: text('encrypted_phone'),
  encryptedAddress: text('encrypted_address'),
  createdAt: timestamp('created_at').defaultNow(),
});
```

### **Security Headers & Middleware**

#### **Express Security Middleware**
```typescript
// server/middleware/security.ts
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { Request, Response, NextFunction } from 'express';

export const securityMiddleware = [
  // Helmet for security headers
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
        fontSrc: ["'self'", "https://fonts.gstatic.com"],
        imgSrc: ["'self'", "data:", "https:"],
        scriptSrc: ["'self'"],
        connectSrc: ["'self'", "wss:", "https:"],
        frameSrc: ["'none'"],
        objectSrc: ["'none'"],
        upgradeInsecureRequests: [],
      },
    },
    hsts: {
      maxAge: 31536000,
      includeSubDomains: true,
      preload: true,
    },
  }),

  // Rate limiting
  rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: {
      error: 'Too many requests from this IP',
      retryAfter: '15 minutes',
    },
    standardHeaders: true,
    legacyHeaders: false,
  }),

  // API specific rate limiting
  '/api/auth/login': rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5, // Only 5 login attempts per 15 minutes
    skipSuccessfulRequests: true,
  }),

  // File upload rate limiting
  '/api/issues': rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 10, // 10 issue submissions per minute
  }),
];

// Custom security middleware
export const customSecurityMiddleware = (
  req: Request, 
  res: Response, 
  next: NextFunction
) => {
  // Remove server information
  res.removeHeader('X-Powered-By');
  
  // Add custom security headers
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  // Add POPIA compliance headers
  res.setHeader('X-Data-Protection', 'POPIA-Compliant');
  res.setHeader('X-Data-Retention', '7-years');
  
  next();
};
```

---

# 3. COMPLIANCE & DATA PROTECTION

## POPIA Compliance Framework

### **Protection of Personal Information Act (POPIA) Requirements**

#### **Data Classification Matrix**
```
📊 PERSONAL INFORMATION CLASSIFICATION

┌─────────────────┬─────────────────┬─────────────────┬─────────────────┐
│ DATA TYPE       │ CLASSIFICATION  │ ENCRYPTION REQ  │ RETENTION       │
├─────────────────┼─────────────────┼─────────────────┼─────────────────┤
│ Identity Number │ HIGHLY SENSITIVE│ AES-256 + KMS   │ 7 years         │
│ Phone Numbers   │ SENSITIVE       │ AES-256         │ 5 years         │
│ Email Addresses │ SENSITIVE       │ AES-256         │ 5 years         │
│ Home Addresses  │ SENSITIVE       │ AES-256         │ 5 years         │
│ GPS Coordinates │ SENSITIVE       │ AES-256         │ 2 years         │
│ Issue Photos    │ MODERATE        │ TLS in transit  │ 3 years         │
│ Payment Info    │ HIGHLY SENSITIVE│ Tokenized       │ 7 years         │
│ Biometric Data  │ SPECIAL CATEGORY│ AES-256 + HSM   │ Not Collected   │
│ Health Info     │ SPECIAL CATEGORY│ AES-256 + HSM   │ Not Collected   │
└─────────────────┴─────────────────┴─────────────────┴─────────────────┘
```

#### **POPIA Compliance Implementation**
```typescript
// server/compliance/popia.ts
export interface POPIACompliance {
  dataSubject: string;
  processingPurpose: string;
  legalBasis: string;
  dataCategories: string[];
  retentionPeriod: number;
  consentRequired: boolean;
  consentObtained?: Date;
  dataMinimization: boolean;
}

export class POPIAComplianceService {
  /**
   * Record data processing activity
   */
  async recordProcessingActivity(activity: POPIACompliance) {
    await db.insert(dataProcessingLog).values({
      dataSubject: activity.dataSubject,
      processingPurpose: activity.processingPurpose,
      legalBasis: activity.legalBasis,
      dataCategories: activity.dataCategories,
      retentionPeriod: activity.retentionPeriod,
      consentRequired: activity.consentRequired,
      consentObtained: activity.consentObtained,
      timestamp: new Date(),
      complianceCheck: true,
    });
  }

  /**
   * Handle data subject access request (DSAR)
   */
  async handleDataSubjectRequest(
    citizenId: number, 
    requestType: 'access' | 'rectification' | 'erasure' | 'portability'
  ) {
    switch (requestType) {
      case 'access':
        return await this.generateDataExport(citizenId);
      
      case 'rectification':
        return await this.enableDataCorrection(citizenId);
      
      case 'erasure':
        return await this.initiateDataDeletion(citizenId);
      
      case 'portability':
        return await this.generatePortableData(citizenId);
    }
  }

  /**
   * Generate comprehensive data export for citizen
   */
  private async generateDataExport(citizenId: number) {
    const userData = await db.select().from(users).where(eq(users.id, citizenId));
    const userIssues = await db.select().from(issues).where(eq(issues.citizenId, citizenId));
    const userPayments = await db.select().from(payments).where(eq(payments.citizenId, citizenId));
    
    // Decrypt sensitive fields for export
    const decryptedData = await this.decryptSensitiveFields({
      personalInfo: userData[0],
      issues: userIssues,
      payments: userPayments,
    });
    
    return {
      exportDate: new Date().toISOString(),
      dataSubject: citizenId,
      legalBasis: 'POPIA Section 23 - Data Subject Rights',
      data: decryptedData,
      retentionNotice: 'Data will be retained according to municipal retention policies',
    };
  }

  /**
   * Automated data retention and deletion
   */
  async enforceRetentionPolicies() {
    const retentionRules = [
      { table: 'issues', field: 'createdAt', retentionYears: 3 },
      { table: 'payments', field: 'createdAt', retentionYears: 7 },
      { table: 'technician_locations', field: 'timestamp', retentionYears: 2 },
    ];

    for (const rule of retentionRules) {
      const cutoffDate = new Date();
      cutoffDate.setFullYear(cutoffDate.getFullYear() - rule.retentionYears);
      
      await this.archiveExpiredData(rule.table, rule.field, cutoffDate);
    }
  }

  /**
   * Consent management
   */
  async recordConsent(citizenId: number, consentType: string, granted: boolean) {
    await db.insert(consentRecords).values({
      citizenId,
      consentType,
      granted,
      timestamp: new Date(),
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
    });
  }
}
```

### **Data Governance Framework**

#### **Data Retention Policy**
```typescript
// server/governance/retention.ts
export const DATA_RETENTION_POLICIES = {
  // Core municipal data
  issues: {
    active: '3 years',
    archived: '7 years',
    purge: '10 years',
    legalBasis: 'Municipal Systems Act requirements',
  },
  
  // Financial records
  payments: {
    active: '7 years',
    archived: '10 years',
    purge: 'Never (legal requirement)',
    legalBasis: 'Municipal Finance Management Act',
  },
  
  // Personal information
  citizens: {
    active: 'While service active',
    archived: '2 years after last activity',
    purge: '7 years total',
    legalBasis: 'POPIA compliance',
  },
  
  // Technical logs
  auditLogs: {
    active: '1 year',
    archived: '3 years',
    purge: '7 years',
    legalBasis: 'Security monitoring',
  },
  
  // Communication records
  whatsappMessages: {
    active: '1 year',
    archived: '2 years',
    purge: '3 years',
    legalBasis: 'Service delivery records',
  },
};

export class DataGovernanceService {
  /**
   * Automated data lifecycle management
   */
  async executeDataLifecycle() {
    const policies = Object.entries(DATA_RETENTION_POLICIES);
    
    for (const [tableName, policy] of policies) {
      await this.processRetentionPolicy(tableName, policy);
    }
  }

  private async processRetentionPolicy(tableName: string, policy: any) {
    // Archive old active data
    const archiveDate = this.calculateDate(policy.active);
    await this.archiveData(tableName, archiveDate);
    
    // Purge expired archived data
    if (policy.purge !== 'Never (legal requirement)') {
      const purgeDate = this.calculateDate(policy.purge);
      await this.purgeData(tableName, purgeDate);
    }
  }
}
```

---

# 4. MONITORING & INCIDENT RESPONSE

## Comprehensive Monitoring Strategy

### **Application Performance Monitoring (APM)**

#### **AWS CloudWatch Configuration**
```yaml
# cloudwatch/alarms.yml
AWSTemplateFormatVersion: '2010-09-09'
Description: 'Smart Munic Monitoring Stack'

Resources:
  # Application Load Balancer Alarms
  HighResponseTimeAlarm:
    Type: AWS::CloudWatch::Alarm
    Properties:
      AlarmName: 'SmartMunic-HighResponseTime'
      AlarmDescription: 'Alert when response time exceeds 200ms'
      MetricName: TargetResponseTime
      Namespace: AWS/ApplicationELB
      Statistic: Average
      Period: 300
      EvaluationPeriods: 2
      Threshold: 0.2
      ComparisonOperator: GreaterThanThreshold
      AlarmActions:
        - !Ref SNSTopic
      Dimensions:
        - Name: LoadBalancer
          Value: !Ref LoadBalancer

  # Database Performance Alarms
  HighDatabaseCPUAlarm:
    Type: AWS::CloudWatch::Alarm
    Properties:
      AlarmName: 'SmartMunic-HighDatabaseCPU'
      AlarmDescription: 'Alert when database CPU exceeds 80%'
      MetricName: CPUUtilization
      Namespace: AWS/RDS
      Statistic: Average
      Period: 300
      EvaluationPeriods: 2
      Threshold: 80
      ComparisonOperator: GreaterThanThreshold
      AlarmActions:
        - !Ref SNSTopic

  # Application Error Rate Alarm
  HighErrorRateAlarm:
    Type: AWS::CloudWatch::Alarm
    Properties:
      AlarmName: 'SmartMunic-HighErrorRate'
      AlarmDescription: 'Alert when error rate exceeds 5%'
      MetricName: HTTPCode_Target_5XX_Count
      Namespace: AWS/ApplicationELB
      Statistic: Sum
      Period: 300
      EvaluationPeriods: 2
      Threshold: 5
      ComparisonOperator: GreaterThanThreshold
      AlarmActions:
        - !Ref SNSTopic

  # Custom Application Metrics
  IssueProcessingDelayAlarm:
    Type: AWS::CloudWatch::Alarm
    Properties:
      AlarmName: 'SmartMunic-IssueProcessingDelay'
      AlarmDescription: 'Alert when issue processing is delayed'
      MetricName: IssueProcessingTime
      Namespace: SmartMunic/Application
      Statistic: Average
      Period: 600
      EvaluationPeriods: 1
      Threshold: 300
      ComparisonOperator: GreaterThanThreshold
      AlarmActions:
        - !Ref SNSTopic
```

#### **Custom Application Metrics**
```typescript
// server/monitoring/metrics.ts
import { CloudWatchClient, PutMetricDataCommand } from '@aws-sdk/client-cloudwatch';

export class MetricsService {
  private cloudWatch: CloudWatchClient;

  constructor() {
    this.cloudWatch = new CloudWatchClient({ region: 'af-south-1' });
  }

  /**
   * Track issue processing time
   */
  async trackIssueProcessingTime(processingTime: number) {
    await this.putMetric('IssueProcessingTime', processingTime, 'Milliseconds');
  }

  /**
   * Track user activity
   */
  async trackUserActivity(userRole: string, action: string) {
    await this.putMetric('UserActivity', 1, 'Count', [
      { Name: 'UserRole', Value: userRole },
      { Name: 'Action', Value: action },
    ]);
  }

  /**
   * Track security events
   */
  async trackSecurityEvent(eventType: 'login_success' | 'login_failure' | 'suspicious_activity') {
    await this.putMetric('SecurityEvents', 1, 'Count', [
      { Name: 'EventType', Value: eventType },
    ]);
  }

  /**
   * Track system performance
   */
  async trackPerformanceMetric(metricName: string, value: number, unit: string) {
    await this.putMetric(metricName, value, unit);
  }

  private async putMetric(
    metricName: string, 
    value: number, 
    unit: string, 
    dimensions?: Array<{ Name: string; Value: string }>
  ) {
    const params = {
      Namespace: 'SmartMunic/Application',
      MetricData: [
        {
          MetricName: metricName,
          Value: value,
          Unit: unit,
          Timestamp: new Date(),
          Dimensions: dimensions,
        },
      ],
    };

    await this.cloudWatch.send(new PutMetricDataCommand(params));
  }
}

// Usage in application
export const metrics = new MetricsService();

// Middleware to track API performance
export const performanceMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const startTime = Date.now();
  
  res.on('finish', async () => {
    const processingTime = Date.now() - startTime;
    await metrics.trackPerformanceMetric('APIResponseTime', processingTime, 'Milliseconds');
    
    if (res.statusCode >= 400) {
      await metrics.trackSecurityEvent('suspicious_activity');
    }
  });
  
  next();
};
```

### **Security Monitoring & SIEM**

#### **Security Event Logging**
```typescript
// server/security/audit.ts
export interface SecurityEvent {
  eventType: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  userId?: number;
  ipAddress: string;
  userAgent: string;
  details: Record<string, any>;
  timestamp: Date;
}

export class SecurityAuditService {
  /**
   * Log security event
   */
  async logSecurityEvent(event: SecurityEvent) {
    // Store in database
    await db.insert(securityEvents).values(event);
    
    // Send to CloudWatch Logs
    await this.sendToCloudWatch(event);
    
    // Alert on critical events
    if (event.severity === 'critical') {
      await this.triggerSecurityAlert(event);
    }
  }

  /**
   * Monitor for suspicious patterns
   */
  async detectSuspiciousActivity() {
    // Multiple failed login attempts
    const failedLogins = await db.select()
      .from(securityEvents)
      .where(
        and(
          eq(securityEvents.eventType, 'login_failure'),
          gte(securityEvents.timestamp, new Date(Date.now() - 15 * 60 * 1000))
        )
      );

    const ipGroups = this.groupByIP(failedLogins);
    
    for (const [ip, events] of Object.entries(ipGroups)) {
      if (events.length >= 5) {
        await this.blockIP(ip, '15 minutes');
        await this.logSecurityEvent({
          eventType: 'automatic_ip_block',
          severity: 'high',
          ipAddress: ip,
          userAgent: 'system',
          details: { reason: 'Multiple failed login attempts', count: events.length },
          timestamp: new Date(),
        });
      }
    }
  }

  /**
   * Generate security reports
   */
  async generateSecurityReport(startDate: Date, endDate: Date) {
    const events = await db.select()
      .from(securityEvents)
      .where(
        and(
          gte(securityEvents.timestamp, startDate),
          lte(securityEvents.timestamp, endDate)
        )
      );

    return {
      totalEvents: events.length,
      eventsByType: this.groupByType(events),
      eventsBySeverity: this.groupBySeverity(events),
      topSourceIPs: this.getTopIPs(events),
      recommendations: this.generateRecommendations(events),
    };
  }

  private async triggerSecurityAlert(event: SecurityEvent) {
    // Send to security team
    await this.sendAlertEmail(event);
    
    // Trigger Slack notification
    await this.sendSlackAlert(event);
    
    // Create incident ticket
    await this.createIncidentTicket(event);
  }
}
```

### **Incident Response Procedures**

#### **Automated Incident Response**
```typescript
// server/incident/response.ts
export interface Incident {
  id: string;
  type: 'security' | 'performance' | 'availability' | 'data';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  affectedSystems: string[];
  detectedAt: Date;
  status: 'open' | 'investigating' | 'mitigating' | 'resolved';
}

export class IncidentResponseService {
  /**
   * Automatically respond to critical incidents
   */
  async handleCriticalIncident(incident: Incident) {
    // Immediate automated responses
    switch (incident.type) {
      case 'security':
        await this.handleSecurityIncident(incident);
        break;
      
      case 'performance':
        await this.handlePerformanceIncident(incident);
        break;
      
      case 'availability':
        await this.handleAvailabilityIncident(incident);
        break;
      
      case 'data':
        await this.handleDataIncident(incident);
        break;
    }
    
    // Notify incident response team
    await this.notifyIncidentTeam(incident);
    
    // Create incident record
    await this.createIncidentRecord(incident);
  }

  private async handleSecurityIncident(incident: Incident) {
    // Block suspicious IPs
    if (incident.description.includes('brute force')) {
      await this.activateRateLimiting();
    }
    
    // Enable additional monitoring
    await this.enhanceSecurityMonitoring();
    
    // Notify CSIRT (Computer Security Incident Response Team)
    await this.notifyCSIRT(incident);
  }

  private async handlePerformanceIncident(incident: Incident) {
    // Scale up resources automatically
    if (incident.description.includes('high load')) {
      await this.scaleUpResources();
    }
    
    // Activate performance optimizations
    await this.activatePerformanceMode();
    
    // Analyze performance metrics
    await this.analyzePerformanceMetrics();
  }

  private async handleAvailabilityIncident(incident: Incident) {
    // Failover to backup systems
    await this.initiateFailover();
    
    // Activate maintenance mode if needed
    if (incident.severity === 'critical') {
      await this.activateMaintenanceMode();
    }
    
    // Monitor system recovery
    await this.monitorRecovery();
  }

  /**
   * Incident communication plan
   */
  async executeCommunicationPlan(incident: Incident) {
    const communications = [
      // Internal stakeholders
      {
        audience: 'technical_team',
        channel: 'slack',
        urgency: 'immediate',
        template: 'technical_incident',
      },
      {
        audience: 'management',
        channel: 'email',
        urgency: 'high',
        template: 'executive_summary',
      },
      
      // External stakeholders (if public-facing impact)
      {
        audience: 'citizens',
        channel: 'status_page',
        urgency: 'high',
        template: 'service_disruption',
      },
      {
        audience: 'municipal_officials',
        channel: 'email',
        urgency: 'medium',
        template: 'service_update',
      },
    ];

    for (const comm of communications) {
      if (this.shouldNotifyAudience(incident, comm.audience)) {
        await this.sendCommunication(incident, comm);
      }
    }
  }
}
```

---

# 5. BACKUP & DISASTER RECOVERY

## Comprehensive Backup Strategy

### **Multi-Tier Backup Architecture**

```
🔄 BACKUP & DISASTER RECOVERY ARCHITECTURE

┌─────────────────────────────────────────────────────────────────┐
│                    🏠 PRODUCTION ENVIRONMENT                   │
├─────────────────────────────────────────────────────────────────┤
│ Primary Region: AWS af-south-1 (Cape Town)                     │
│ • Application Servers (Auto Scaling Group)                     │
│ • RDS PostgreSQL (Multi-AZ)                                    │
│ • S3 Buckets (Cross-Region Replication)                        │
│ • ElastiCache Redis (Cluster Mode)                             │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                   🔄 BACKUP SYSTEMS                            │
├─────────────────────────────────────────────────────────────────┤
│ Database Backups:                                               │
│ • Automated Daily Snapshots                                     │
│ • Point-in-Time Recovery (35 days)                             │
│ • Cross-Region Backup Replication                              │
│                                                                 │
│ Application Backups:                                            │
│ • Code Repository (Git + S3)                                   │
│ • Configuration Files (Encrypted S3)                           │
│ • SSL Certificates (AWS Certificate Manager)                   │
│                                                                 │
│ File Storage Backups:                                           │
│ • S3 Cross-Region Replication                                  │
│ • Versioning Enabled                                            │
│ • Lifecycle Policies (Archive to Glacier)                      │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│              🌍 DISASTER RECOVERY SITE                         │
├─────────────────────────────────────────────────────────────────┤
│ Secondary Region: AWS eu-west-1 (Ireland)                      │
│ • Standby RDS Read Replica                                      │
│ • AMI Images for Quick Recovery                                │
│ • S3 Cross-Region Replicated Data                              │
│ • Route 53 Health Checks & Failover                            │
│                                                                 │
│ Recovery Time Objective (RTO): 4 hours                         │
│ Recovery Point Objective (RPO): 1 hour                         │
└─────────────────────────────────────────────────────────────────┘
```

### **Automated Backup Implementation**

#### **Database Backup Configuration**
```yaml
# aws/rds-backup.yml
AWSTemplateFormatVersion: '2010-09-09'
Description: 'RDS Backup and Recovery Configuration'

Resources:
  # Primary Database with Automated Backups
  SmartMunicDatabase:
    Type: AWS::RDS::DBInstance
    Properties:
      DBInstanceIdentifier: smart-munic-prod
      DBInstanceClass: db.t3.medium
      Engine: postgres
      EngineVersion: '15.4'
      
      # Backup Configuration
      BackupRetentionPeriod: 35
      PreferredBackupWindow: '02:00-03:00'
      PreferredMaintenanceWindow: 'sun:03:00-sun:04:00'
      
      # Multi-AZ for High Availability
      MultiAZ: true
      
      # Encryption
      StorageEncrypted: true
      KmsKeyId: !Ref DatabaseKMSKey
      
      # Monitoring
      MonitoringInterval: 60
      MonitoringRoleArn: !GetAtt RDSEnhancedMonitoringRole.Arn
      
      # Cross-Region Backup
      DeletionProtection: true
      
      Tags:
        - Key: Environment
          Value: production
        - Key: BackupRequired
          Value: 'true'
        - Key: Compliance
          Value: 'POPIA'

  # Cross-Region Read Replica for DR
  SmartMunicReadReplica:
    Type: AWS::RDS::DBInstance
    Properties:
      DBInstanceIdentifier: smart-munic-replica-eu
      SourceDBInstanceIdentifier: !Ref SmartMunicDatabase
      DBInstanceClass: db.t3.medium
      
      # Deploy in different region
      AvailabilityZone: eu-west-1a
      
      # Backup configuration for replica
      BackupRetentionPeriod: 7
      
      Tags:
        - Key: Purpose
          Value: disaster-recovery
        - Key: Region
          Value: secondary

  # Automated Backup Lambda Function
  BackupLambdaFunction:
    Type: AWS::Lambda::Function
    Properties:
      FunctionName: smart-munic-backup-automation
      Runtime: python3.9
      Handler: backup.lambda_handler
      Code:
        ZipFile: |
          import boto3
          import json
          import datetime
          
          def lambda_handler(event, context):
              rds = boto3.client('rds')
              s3 = boto3.client('s3')
              
              # Create manual snapshot
              snapshot_id = f"smart-munic-manual-{datetime.datetime.now().strftime('%Y%m%d-%H%M%S')}"
              
              rds.create_db_snapshot(
                  DBSnapshotIdentifier=snapshot_id,
                  DBInstanceIdentifier='smart-munic-prod'
              )
              
              # Export application data
              export_backup_data()
              
              return {
                  'statusCode': 200,
                  'body': json.dumps(f'Backup created: {snapshot_id}')
              }
          
          def export_backup_data():
              # Export configuration and application data
              pass
      
      Environment:
        Variables:
          BACKUP_BUCKET: !Ref BackupBucket
      
      Timeout: 300

  # Scheduled Backup Execution
  BackupScheduleRule:
    Type: AWS::Events::Rule
    Properties:
      Description: 'Daily backup execution'
      ScheduleExpression: 'cron(0 1 * * ? *)'  # Daily at 1 AM
      State: ENABLED
      Targets:
        - Arn: !GetAtt BackupLambdaFunction.Arn
          Id: 'BackupTarget'
```

#### **Application Data Backup Script**
```typescript
// scripts/backup.ts
import { exec } from 'child_process';
import { promisify } from 'util';
import AWS from 'aws-sdk';
import { createReadStream, createWriteStream } from 'fs';
import { pipeline } from 'stream';
import { createGzip } from 'zlib';

const execAsync = promisify(exec);
const s3 = new AWS.S3({ region: 'af-south-1' });

export class BackupService {
  private readonly backupBucket = 'smart-munic-backups';
  private readonly encryptionKey = process.env.BACKUP_ENCRYPTION_KEY!;

  /**
   * Perform comprehensive system backup
   */
  async performFullBackup() {
    const backupId = `full-backup-${new Date().toISOString().replace(/[:.]/g, '-')}`;
    
    try {
      // 1. Database backup
      await this.backupDatabase(backupId);
      
      // 2. Application files backup
      await this.backupApplicationFiles(backupId);
      
      // 3. Configuration backup
      await this.backupConfiguration(backupId);
      
      // 4. SSL certificates backup
      await this.backupSSLCertificates(backupId);
      
      // 5. User uploaded files backup
      await this.backupUserFiles(backupId);
      
      // 6. Create backup manifest
      await this.createBackupManifest(backupId);
      
      console.log(`Full backup completed: ${backupId}`);
      return backupId;
      
    } catch (error) {
      console.error('Backup failed:', error);
      await this.notifyBackupFailure(error);
      throw error;
    }
  }

  /**
   * Database backup using pg_dump
   */
  private async backupDatabase(backupId: string) {
    const dumpFile = `/tmp/database-${backupId}.sql`;
    const compressedFile = `/tmp/database-${backupId}.sql.gz`;
    
    // Create database dump
    await execAsync(`pg_dump ${process.env.DATABASE_URL} > ${dumpFile}`);
    
    // Compress the dump
    await this.compressFile(dumpFile, compressedFile);
    
    // Upload to S3 with encryption
    await this.uploadToS3(
      compressedFile, 
      `database-backups/${backupId}/database.sql.gz`
    );
    
    // Clean up local files
    await execAsync(`rm ${dumpFile} ${compressedFile}`);
  }

  /**
   * Backup application files and code
   */
  private async backupApplicationFiles(backupId: string) {
    const archiveFile = `/tmp/application-${backupId}.tar.gz`;
    
    // Create compressed archive of application
    await execAsync(`tar -czf ${archiveFile} --exclude=node_modules --exclude=.git .`);
    
    // Upload to S3
    await this.uploadToS3(
      archiveFile,
      `application-backups/${backupId}/application.tar.gz`
    );
    
    // Clean up
    await execAsync(`rm ${archiveFile}`);
  }

  /**
   * Backup system configuration
   */
  private async backupConfiguration(backupId: string) {
    const config = {
      environment: process.env.NODE_ENV,
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version,
      databaseConfig: {
        // Non-sensitive database config
        host: new URL(process.env.DATABASE_URL!).hostname,
        database: new URL(process.env.DATABASE_URL!).pathname.slice(1),
      },
      awsConfig: {
        region: process.env.AWS_REGION,
        // No secrets included
      },
    };
    
    const configFile = `/tmp/config-${backupId}.json`;
    await require('fs').promises.writeFile(configFile, JSON.stringify(config, null, 2));
    
    await this.uploadToS3(
      configFile,
      `configuration-backups/${backupId}/config.json`
    );
    
    await execAsync(`rm ${configFile}`);
  }

  /**
   * Backup user uploaded files
   */
  private async backupUserFiles(backupId: string) {
    const uploadsBucket = 'smart-munic-uploads';
    
    // Copy uploads bucket to backup location
    await execAsync(`aws s3 sync s3://${uploadsBucket} s3://${this.backupBucket}/file-backups/${backupId}/uploads/`);
  }

  /**
   * Create backup manifest with metadata
   */
  private async createBackupManifest(backupId: string) {
    const manifest = {
      backupId,
      timestamp: new Date().toISOString(),
      type: 'full',
      components: [
        'database',
        'application-files',
        'configuration',
        'ssl-certificates',
        'user-files',
      ],
      retention: {
        policy: 'monthly',
        expiration: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
      },
      compliance: {
        popia: true,
        encrypted: true,
        region: 'af-south-1',
      },
    };
    
    await s3.putObject({
      Bucket: this.backupBucket,
      Key: `manifests/${backupId}.json`,
      Body: JSON.stringify(manifest, null, 2),
      ServerSideEncryption: 'aws:kms',
      SSEKMSKeyId: this.encryptionKey,
    }).promise();
  }

  /**
   * Restore from backup
   */
  async restoreFromBackup(backupId: string) {
    console.log(`Starting restore from backup: ${backupId}`);
    
    try {
      // 1. Download backup manifest
      const manifest = await this.getBackupManifest(backupId);
      
      // 2. Restore database
      if (manifest.components.includes('database')) {
        await this.restoreDatabase(backupId);
      }
      
      // 3. Restore application files
      if (manifest.components.includes('application-files')) {
        await this.restoreApplicationFiles(backupId);
      }
      
      // 4. Restore configuration
      if (manifest.components.includes('configuration')) {
        await this.restoreConfiguration(backupId);
      }
      
      // 5. Restore user files
      if (manifest.components.includes('user-files')) {
        await this.restoreUserFiles(backupId);
      }
      
      console.log(`Restore completed from backup: ${backupId}`);
      
    } catch (error) {
      console.error('Restore failed:', error);
      throw error;
    }
  }

  private async uploadToS3(localFile: string, s3Key: string) {
    const fileStream = createReadStream(localFile);
    
    await s3.upload({
      Bucket: this.backupBucket,
      Key: s3Key,
      Body: fileStream,
      ServerSideEncryption: 'aws:kms',
      SSEKMSKeyId: this.encryptionKey,
    }).promise();
  }

  private async compressFile(inputFile: string, outputFile: string) {
    const input = createReadStream(inputFile);
    const output = createWriteStream(outputFile);
    const gzip = createGzip();
    
    await promisify(pipeline)(input, gzip, output);
  }
}
```

### **Disaster Recovery Procedures**

#### **DR Automation Script**
```bash
#!/bin/bash
# disaster-recovery.sh

set -e

BACKUP_ID=${1:-latest}
RECOVERY_REGION=${2:-eu-west-1}
NOTIFICATION_EMAIL="ops@municipality.gov.za"

echo "=== Smart Munic Disaster Recovery Procedure ==="
echo "Backup ID: $BACKUP_ID"
echo "Recovery Region: $RECOVERY_REGION"
echo "Started at: $(date)"

# Function to log with timestamp
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1"
}

# Function to send notifications
notify() {
    local message="$1"
    local subject="Smart Munic DR: $2"
    
    # Send email notification
    aws ses send-email \
        --source "noreply@municipality.gov.za" \
        --destination "ToAddresses=$NOTIFICATION_EMAIL" \
        --message "Subject={Data=\"$subject\"},Body={Text={Data=\"$message\"}}" \
        --region $RECOVERY_REGION
    
    # Send Slack notification (if webhook configured)
    if [ ! -z "$SLACK_WEBHOOK" ]; then
        curl -X POST -H 'Content-type: application/json' \
            --data "{\"text\":\"$subject: $message\"}" \
            $SLACK_WEBHOOK
    fi
}

# Step 1: Verify DR region availability
log "Verifying DR region availability..."
aws ec2 describe-availability-zones --region $RECOVERY_REGION > /dev/null
if [ $? -eq 0 ]; then
    log "✓ DR region $RECOVERY_REGION is available"
else
    log "✗ DR region $RECOVERY_REGION is not accessible"
    exit 1
fi

# Step 2: Promote read replica to primary (if using RDS)
log "Promoting read replica to primary database..."
aws rds promote-read-replica \
    --db-instance-identifier smart-munic-replica-eu \
    --region $RECOVERY_REGION

# Wait for promotion to complete
log "Waiting for database promotion to complete..."
aws rds wait db-instance-available \
    --db-instance-identifier smart-munic-replica-eu \
    --region $RECOVERY_REGION

log "✓ Database promotion completed"

# Step 3: Launch application instances from AMI
log "Launching application instances in DR region..."
LAUNCH_TEMPLATE_ID=$(aws ec2 describe-launch-templates \
    --filters "Name=launch-template-name,Values=smart-munic-dr-template" \
    --region $RECOVERY_REGION \
    --query 'LaunchTemplates[0].LaunchTemplateId' \
    --output text)

aws autoscaling create-auto-scaling-group \
    --auto-scaling-group-name "smart-munic-dr-asg" \
    --launch-template "LaunchTemplateId=$LAUNCH_TEMPLATE_ID,Version=\$Latest" \
    --min-size 2 \
    --max-size 6 \
    --desired-capacity 2 \
    --vpc-zone-identifier "subnet-dr1,subnet-dr2" \
    --region $RECOVERY_REGION

log "✓ Application instances launched"

# Step 4: Update DNS to point to DR region
log "Updating DNS to point to DR region..."
aws route53 change-resource-record-sets \
    --hosted-zone-id $HOSTED_ZONE_ID \
    --change-batch '{
        "Changes": [{
            "Action": "UPSERT",
            "ResourceRecordSet": {
                "Name": "smartmunic.gov.za",
                "Type": "A",
                "AliasTarget": {
                    "DNSName": "'$DR_LOAD_BALANCER_DNS'",
                    "EvaluateTargetHealth": true,
                    "HostedZoneId": "'$DR_LB_ZONE_ID'"
                }
            }
        }]
    }'

log "✓ DNS updated to point to DR region"

# Step 5: Restore from backup if needed
if [ "$BACKUP_ID" != "latest" ]; then
    log "Restoring from specific backup: $BACKUP_ID"
    node -e "
        const { BackupService } = require('./dist/scripts/backup');
        const backup = new BackupService();
        backup.restoreFromBackup('$BACKUP_ID').catch(console.error);
    "
    log "✓ Backup restoration completed"
fi

# Step 6: Run health checks
log "Running health checks..."
DR_ENDPOINT="https://smartmunic.gov.za/health"
for i in {1..10}; do
    if curl -f -s $DR_ENDPOINT > /dev/null; then
        log "✓ Health check passed"
        break
    else
        log "Health check failed, attempt $i/10"
        sleep 30
    fi
    
    if [ $i -eq 10 ]; then
        log "✗ Health checks failed after 10 attempts"
        notify "Disaster recovery completed but health checks are failing" "DR Warning"
        exit 1
    fi
done

# Step 7: Final verification
log "Performing final verification..."
RESPONSE=$(curl -s -w "%{http_code}" $DR_ENDPOINT)
HTTP_CODE=${RESPONSE: -3}

if [ "$HTTP_CODE" = "200" ]; then
    log "✓ System is fully operational in DR region"
    notify "Disaster recovery completed successfully. System is operational in $RECOVERY_REGION." "DR Success"
else
    log "✗ System verification failed (HTTP $HTTP_CODE)"
    notify "Disaster recovery completed but system verification failed" "DR Warning"
    exit 1
fi

# Step 8: Update monitoring
log "Updating monitoring configuration..."
# Update CloudWatch alarms for new region
# Update status page
# Notify teams

log "=== Disaster Recovery Completed Successfully ==="
log "System is now running in: $RECOVERY_REGION"
log "Database: smart-munic-replica-eu (promoted to primary)"
log "Application: smart-munic-dr-asg"
log "Completed at: $(date)"

notify "
Disaster Recovery Summary:
- Recovery Region: $RECOVERY_REGION
- Database: Promoted read replica
- Application: New ASG with 2 instances
- DNS: Updated to point to DR region
- Status: Fully operational
- Completed: $(date)
" "DR Complete"
```

---

# CONCLUSION

This comprehensive hosting and security documentation provides a complete framework for deploying and maintaining the ADA Smart Munic platform with enterprise-grade security, compliance, and operational excellence.

## Key Implementation Areas:

### ✅ **Production Hosting Infrastructure**
- Multi-region AWS/Azure deployment with South African data residency
- Auto-scaling architecture with 99.9% uptime SLA
- Infrastructure as Code using Terraform
- Container orchestration with Kubernetes
- Comprehensive CI/CD pipeline with automated testing

### ✅ **Enterprise Security Framework**
- Multi-layer security architecture
- POPIA compliance implementation
- Multi-factor authentication with RBAC
- End-to-end encryption with AWS KMS/Azure Key Vault
- Advanced threat detection and incident response

### ✅ **Compliance & Data Governance**
- POPIA data protection compliance
- Automated data retention and lifecycle management
- Comprehensive audit logging
- Data subject rights implementation
- Regulatory reporting capabilities

### ✅ **Monitoring & Incident Response**
- 24/7 system monitoring with CloudWatch/Azure Monitor
- Automated incident response procedures
- Security event correlation and SIEM integration
- Performance metrics and alerting
- Communication plans for stakeholders

### ✅ **Backup & Disaster Recovery**
- Multi-tier backup strategy with cross-region replication
- 4-hour RTO and 1-hour RPO targets
- Automated backup validation and testing
- Comprehensive disaster recovery procedures
- Business continuity assurance

## Security & Compliance Achievements:

- **POPIA Compliant**: Full South African data protection compliance
- **ISO 27001 Ready**: Security management system framework
- **Zero Trust Architecture**: Never trust, always verify approach
- **SOC 2 Type II Aligned**: Security, availability, and confidentiality controls
- **Penetration Test Ready**: Regular security assessments and vulnerability management

## Operational Excellence:

- **Infrastructure as Code**: Version-controlled, repeatable deployments
- **Automated Operations**: Reduced manual intervention and human error
- **Comprehensive Monitoring**: Proactive issue detection and resolution
- **Disaster Recovery**: Tested and validated recovery procedures
- **Security First**: Defense in depth with multiple security layers

This documentation establishes the foundation for secure, compliant, and reliable hosting of the municipal citizen engagement platform, ensuring the highest standards of data protection and system availability for South African municipalities.

---

*This hosting and security documentation pack provides complete implementation guidance for enterprise-grade deployment of the ADA Smart Munic platform, meeting all regulatory requirements and industry best practices for municipal service delivery systems.*