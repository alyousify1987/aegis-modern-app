# 🛡️ Aegis Audit Platform - API Documentation

## 🚀 Quick Start

The Aegis Audit Platform provides a comprehensive RESTful API for managing ISO 22000, HACCP, and SFDA compliance audits.

**Base URL**: `http://localhost:3001`

## 🔐 Authentication

All API endpoints require authentication via JWT tokens (except login).

### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "admin@aegisaudit.com",
  "password": "admin123"
}
```

**Response:**
```json
{
  "message": "Login successful",
  "user": {
    "id": "admin-user-id",
    "email": "admin@aegisaudit.com",
    "firstName": "Admin",
    "lastName": "User",
    "role": "ADMIN"
  },
  "token": "jwt-token-here"
}
```

## 📊 Audits API

### Get All Audits
```http
GET /api/audits
Authorization: Bearer {token}
```

### Get Audit by ID
```http
GET /api/audits/{id}
Authorization: Bearer {token}
```

### Create One-Click Audit
```http
POST /api/audits/one-click
Authorization: Bearer {token}
Content-Type: application/json

{
  "type": "ISO_22000",
  "department": "Production"
}
```

**Response:**
```json
{
  "auditId": "audit-xxx",
  "message": "One-click audit initiated successfully",
  "estimatedCompletion": "2024-01-20T10:00:00Z",
  "status": "INITIATED"
}
```

## 📝 Findings API

### Get All Findings
```http
GET /api/findings
Authorization: Bearer {token}
```

### Create Finding
```http
POST /api/findings
Authorization: Bearer {token}
Content-Type: application/json

{
  "auditId": "audit-1",
  "clause": "4.1",
  "description": "Finding description",
  "severity": "HIGH",
  "status": "OPEN"
}
```

## 📈 Analytics API

### Get Dashboard Metrics
```http
GET /api/analytics/dashboard
Authorization: Bearer {token}
```

**Response:**
```json
{
  "totalAudits": 24,
  "completedAudits": 18,
  "pendingFindings": 12,
  "riskScore": 75,
  "recentActivity": [...],
  "complianceMetrics": {...}
}
```

## 🔔 Notifications API

### Get Notifications
```http
GET /api/notifications
Authorization: Bearer {token}
```

## 📊 Data Models

### Audit
```typescript
interface Audit {
  id: string
  title: string
  type: 'INTERNAL' | 'EXTERNAL' | 'COMPLIANCE'
  status: 'PLANNED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED'
  standard: 'ISO 22000:2018' | 'HACCP' | 'SFDA'
  startDate: string
  endDate: string
  score?: number
  department: string
  auditor: string
}
```

### Finding
```typescript
interface Finding {
  id: string
  auditId: string
  clause: string
  description: string
  severity: 'HIGH' | 'MEDIUM' | 'LOW'
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED'
  dueDate: string
  assignee: string
}
```

### User
```typescript
interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  role: 'ADMIN' | 'AUDITOR' | 'MANAGER' | 'USER'
}
```

## 🔍 Standards Supported

- **ISO 22000:2018** - Food Safety Management Systems
- **HACCP** - Hazard Analysis Critical Control Points
- **SFDA** - Saudi Food and Drug Authority Guidelines

## 🚀 One-Click Audit Features

The platform supports automated audit initiation with:
- **Automatic checklist generation**
- **Risk assessment calculations**
- **Compliance tracking**
- **Real-time progress monitoring**
- **Automated report generation**

## 📈 Analytics Features

- **Real-time dashboards**
- **Compliance trend analysis**
- **Risk score calculations**
- **Performance metrics**
- **Activity tracking**
- **Custom reporting**

## 🔧 Error Handling

All API endpoints return standard HTTP status codes:

- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Internal Server Error

Error responses include detailed messages:
```json
{
  "error": "Invalid credentials",
  "message": "Email or password is incorrect",
  "timestamp": "2024-01-15T10:30:00Z"
}
```

## 🛡️ Security Features

- **JWT Authentication**
- **Role-based access control**
- **CORS protection**
- **Rate limiting**
- **Input validation**
- **SQL injection prevention**
- **XSS protection**

## 📱 Response Formats

All responses are in JSON format with consistent structure:

**Success Response:**
```json
{
  "data": {...},
  "message": "Operation successful",
  "timestamp": "2024-01-15T10:30:00Z"
}
```

**Error Response:**
```json
{
  "error": "Error type",
  "message": "Detailed error message",
  "timestamp": "2024-01-15T10:30:00Z"
}
```

---

## 🛠️ Development

### Prerequisites
- Node.js 18+
- npm or yarn
- PostgreSQL (optional for production)

### Setup
```bash
# Backend
cd server
npm install
npm run dev

# Frontend  
cd client
npm install
npm run dev
```

### Environment Variables
```env
PORT=3001
JWT_SECRET=your-secret-key
DATABASE_URL=postgresql://...
CORS_ORIGIN=http://localhost:1420
```
