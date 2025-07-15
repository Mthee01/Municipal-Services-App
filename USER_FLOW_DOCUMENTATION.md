# ADA Smart Munic - User Flow Documentation

## Overview
This document outlines the complete user interaction flows for the ADA Smart Munic citizen engagement platform, detailing step-by-step processes, screens, backend operations, and data flows for each user role.

## 1. Citizen User Flow

### 1.1 Issue Reporting Flow
**Objective**: Citizen reports a municipal issue

**Steps**:
1. **Landing Page Access**
   - User visits application URL
   - System displays landing page with login option
   - User clicks "Login" button

2. **Authentication**
   - User enters credentials (username: "citizen", password: "password")
   - Frontend sends POST request to `/api/auth/login`
   - Backend validates credentials against hardcoded users
   - Session created and stored in PostgreSQL
   - User redirected to Citizen Dashboard

3. **Citizen Dashboard**
   - Frontend queries GET `/api/issues` to fetch user's issues
   - Dashboard displays user's existing issues
   - User clicks "Report New Issue" button
   - System opens Issue Form modal

4. **Issue Form Completion**
   - User fills out issue details:
     - **Title**: Brief description
     - **Category**: Water/Sanitation, Electricity, Roads, etc.
     - **Description**: Detailed explanation
     - **Location**: GPS or manual selection
     - **Photos**: Optional image uploads (max 5 files, 10MB each)
   
5. **Location Selection Process**
   - **Option A - GPS Location**:
     - User clicks GPS button (map icon)
     - Browser requests location permissions
     - If granted: GPS coordinates captured
     - System calls reverse geocoding API
     - Address displayed in location field
   - **Option B - Manual Location**:
     - User clicks location picker (list icon)
     - Modal shows 20 common South African locations
     - User selects from list (e.g., "Cape Town CBD")
     - Selected location populated in form

6. **Issue Submission**
   - User clicks "Submit Issue" button
   - Frontend validates form data using Zod schema
   - Files uploaded using multer middleware
   - POST request to `/api/issues` with form data and files
   - Backend creates issue record in database
   - Unique 6-character reference number generated
   - System shows success message with reference number

7. **Issue Tracking**
   - Issue appears in user's dashboard
   - Real-time updates via WebSocket connection
   - User can view issue status progression
   - System sends notifications for status changes

### 1.2 Service Rating Flow
**Objective**: Citizen rates completed municipal service

**Steps**:
1. **Resolved Issue Display**
   - User views resolved issue in dashboard
   - "Rate Service" button appears on issue card
   - User clicks "Rate Service" button

2. **Rating Modal**
   - Modal opens with 5-star rating interface
   - User clicks on stars (1-5) to select rating
   - Optional feedback textarea available
   - Submit button activates only after rating selection

3. **Rating Submission**
   - User clicks "Submit Rating" button
   - Frontend sends POST request to `/api/issues/:id/rate`
   - Backend validates rating (1-5 stars)
   - Rating and feedback stored in database
   - Success message displayed
   - Issue card updated to show rating

### 1.3 Communication Flow
**Objective**: Citizen communicates with municipality

**Steps**:
1. **Chatbot Interaction**
   - Floating chat icon available on all pages
   - User clicks chatbot icon
   - Chat interface opens
   - User types message
   - System processes via OpenAI API
   - Bot responds with relevant information

2. **WhatsApp Integration**
   - User sends message to municipal WhatsApp number
   - System receives webhook from WhatsApp Business API
   - Message stored in database
   - Call center agent notified
   - Agent responds through WhatsApp dashboard

## 2. Call Center Agent Flow

### 2.1 Issue Management Flow
**Objective**: Agent manages citizen issues

**Steps**:
1. **Agent Login**
   - Agent accesses system
   - Logs in with credentials (username: "agent", password: "password")
   - Redirected to Call Center Dashboard

2. **Issue Dashboard**
   - System displays all active issues (not resolved)
   - Issues auto-refresh every 5 seconds
   - New citizen issues highlighted in green
   - Agent can filter by category, ward, or search by reference number

3. **Issue Details Review**
   - Agent clicks "View Details" on issue
   - Modal shows complete issue information
   - Photos and location details displayed
   - Previous notes and escalation history shown

4. **Adding Notes**
   - Agent clicks "Notes" button
   - Note modal opens
   - Agent types note content
   - System stores note with timestamp and agent ID
   - Note appears in issue history

5. **Issue Escalation**
   - For urgent issues, agent clicks "Escalate"
   - Escalation modal opens
   - Agent selects escalation reason
   - System creates escalation record
   - Issue priority changed to "urgent"
   - Tech manager notified

### 2.2 WhatsApp Communication Flow
**Objective**: Agent manages WhatsApp conversations

**Steps**:
1. **WhatsApp Dashboard Access**
   - Agent navigates to WhatsApp section
   - System displays active conversations
   - New messages highlighted

2. **Message Response**
   - Agent clicks on conversation
   - Message history displayed
   - Agent types response
   - System sends via WhatsApp Business API
   - Message status tracked (sent, delivered, read)

## 3. Technical Manager Flow

### 3.1 Team Management Flow
**Objective**: Manager oversees technician teams

**Steps**:
1. **Manager Login**
   - Manager logs in with credentials
   - Redirected to Tech Manager Dashboard

2. **Dashboard Overview**
   - System displays:
     - Active issues requiring attention
     - Escalated issues (red flashing indicators)
     - Technician performance metrics
     - Team statistics

3. **Technician Assignment**
   - Manager views unassigned issues
   - Clicks "Assign Technician" button
   - System shows nearest available technicians
   - Manager selects technician
   - Assignment created in database
   - Technician notified

4. **Performance Monitoring**
   - Manager reviews technician performance charts
   - Data includes completion rates, ratings, resolution times
   - System generates analytics from database

## 4. Field Technician Flow

### 4.1 Work Order Management Flow
**Objective**: Technician manages assigned work

**Steps**:
1. **Technician Login**
   - Technician logs in with credentials
   - Redirected to Field Technician Dashboard

2. **Work Order Review**
   - System displays assigned issues
   - Technician views issue details
   - Location and citizen contact information shown

3. **Field Work Process**
   - Technician clicks "Start Work" button
   - System records work start time
   - Technician travels to location
   - Work performed on-site

4. **Work Completion**
   - Technician clicks "Complete Work" button
   - Completion modal opens
   - Technician adds completion notes
   - System updates issue status to "resolved"
   - Work end time recorded

### 4.2 Parts Management Flow
**Objective**: Technician manages parts and inventory

**Steps**:
1. **Parts Inventory Check**
   - Technician accesses parts section
   - System displays available parts
   - Stock levels and locations shown

2. **Parts Ordering**
   - Technician creates parts order
   - Specifies required parts and quantities
   - Justification provided
   - Order submitted to manager for approval

## 5. Data Flow Architecture

### 5.1 Frontend Data Flow
```
User Action → React Component → Form Validation → API Request → 
Backend Processing → Database Query → Response → State Update → UI Refresh
```

### 5.2 Real-time Data Flow
```
Database Change → WebSocket Server → Connected Clients → 
State Update → UI Refresh → User Notification
```

### 5.3 File Upload Flow
```
User Selects Files → Frontend Validation → Multer Middleware → 
File Storage → Database Reference → API Response → UI Update
```

### 5.4 Authentication Flow
```
User Login → Credential Validation → Session Creation → 
Database Storage → Cookie Set → Dashboard Access
```

## 6. Backend Process Flows

### 6.1 Issue Creation Process
1. **Request Validation**
   - Zod schema validation
   - File type and size checks
   - Required field validation

2. **File Processing**
   - Multer processes uploaded files
   - Files saved to uploads directory
   - File paths stored in database

3. **Database Operations**
   - Issue record created
   - Reference number generated
   - Timestamps set
   - Related records updated

4. **Notification System**
   - WebSocket broadcasts to relevant users
   - Real-time dashboard updates
   - Email/SMS notifications (if configured)

### 6.2 Technician Assignment Process
1. **Proximity Calculation**
   - GPS coordinates comparison
   - Distance calculation algorithm
   - Availability status check

2. **Assignment Creation**
   - Technician-issue relationship created
   - Issue status updated to "assigned"
   - Technician notified

3. **Workflow Updates**
   - Dashboard refreshes
   - Status tracking initiated
   - Performance metrics updated

## 7. Error Handling Flows

### 7.1 Frontend Error Handling
- Form validation errors displayed inline
- API errors shown as toast notifications
- Network errors with retry mechanisms
- File upload errors with specific messages

### 7.2 Backend Error Handling
- Database connection errors
- File upload failures
- Authentication failures
- API rate limiting

## 8. Performance Optimization

### 8.1 Frontend Optimization
- React Query for server state management
- Lazy loading for large components
- Image optimization for uploads
- Debounced search inputs

### 8.2 Backend Optimization
- Database query optimization
- Connection pooling
- Caching strategies
- File compression

## 9. Security Considerations

### 9.1 Authentication Security
- Session management
- Role-based access control
- Secure password handling
- Session timeout

### 9.2 Data Security
- Input validation
- SQL injection prevention
- File upload security
- API rate limiting

## 10. Mobile Responsiveness

### 10.1 Mobile User Experience
- Responsive design for all screen sizes
- Touch-friendly interface elements
- Optimized forms for mobile input
- GPS integration for location services

### 10.2 Progressive Web App Features
- Offline capability considerations
- Push notifications
- App-like experience
- Fast loading times

This comprehensive user flow documentation provides a complete understanding of how users interact with the ADA Smart Munic platform, including all technical processes, data flows, and system interactions.