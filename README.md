# Backend API - Employee Attendance & Monitoring System

This is the **Express-based backend** for a microservices employee attendance and monitoring web application, supporting JWT authentication, refresh tokens, RBAC, and separation of concerns through services:

- **Auth Service**
- **Employee Service**
- **Attendance Service**

---

## 🧩 Microservices Overview

### 1. **Auth Service**
Handles authentication, user registration, password management, and login logs.

- **Port**: `4002`
- **Environment**: `NODE_ENV=development`

#### Features:
- JWT-based login & refresh token system
- Role-based access control (RBAC)
- Change and reset password
- User activation/deactivation
- Login log retrieval

#### Routes:
```
POST   /login                   # Login with rate limiting
POST   /register                # HR-only: Register a new user
POST   /refresh-token           # Get new access token from refresh token
POST   /logout                  # Logout current session
POST   /logout-all              # Logout from all devices
POST   /change-password         # Authenticated user changes password
POST   /reset-password          # HR resets another user's password
GET    /login-logs              # HR views login logs
GET    /users/email/:email      # Fetch user by email
GET    /get-all-users           # HR fetches all users
GET    /user/:id                # HR fetches user by ID
PATCH  /users/:id/active        # HR activates/deactivates a user
```

---

### 2. **Attendance Service**
Manages employee WFH attendance including photo uploads, timestamps, and stats.

- **Port**: `4004`
- **Environment**: `NODE_ENV=development`

#### Features:
- Clock-in/out system with image proof
- Individual attendance history and stats
- HR/admin can view all records and stats

#### Routes:
```
POST   /clock-in                # Upload photo + timestamp
PATCH  /clock-out               # Complete the attendance entry
GET    /me                      # Personal attendance history
GET    /me/today                # Check if already checked in today
GET    /me/stats                # Personal stats
GET    /all                     # Admin: view all records
GET    /stats/all               # Admin: view all stats
GET    /:id                     # Admin: view one record
```

---

### 3. **Employee Service**
Handles master data for employees and links with user accounts.

- **Port**: `4003`
- **Environment**: `NODE_ENV=development`

#### Features:
- Create employee + user together (photo upload supported)
- Self profile view/edit (secured)
- HR can update or delete employees
- Support bulk lookup (used by attendance service)

#### Routes:
```
POST   /                       # HR: create new employee
GET    /profile                # Self: view profile
PUT    /profile                # Self: update profile
GET    /bulk                   # HR: get multiple employees by user_id[]
GET    /:id                    # HR: get single employee by ID
PUT    /:id                    # HR: update employee by ID
DELETE /:id                    # HR: terminate employee
GET    /                       # HR: search employees
```

---

## 🔐 Security

- JWT Access and Refresh Tokens
- Role-based permissions middleware
- Fine-grained permission control (e.g., `authorizePermission('employees', 'read')`)
- Rate limiting middleware for sensitive routes (login, profile)

### JWT Environment Settings
```
JWT_SECRET=your_super_secret_jwt_key
JWT_ACCESS_SECRET=access_secret_key
JWT_REFRESH_SECRET=refresh_secret_key
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
JWT_ISSUER=auth-service
JWT_AUDIENCE=employee-management-api
```

---

## 🗃️ Database

### PostgreSQL via Supabase
```
DB_USER=postgres.luqfemndwezixbygklle
DB_PASSWORD=HAW4ADASDyxrt1NZ
DB_HOST=aws-0-ap-southeast-1.pooler.supabase.com
DB_PORT=6543
DB_NAME=postgres
```

---

## 🧱 Tech Stack

- Node.js + Express
- Sequelize ORM + PostgreSQL
- Multer (photo upload)
- UUID for IDs
- RBAC with roles/permissions stored in DB
- Modular architecture with shared middlewares & utilities

## 📄 License

This backend project is part of a fullstack skill test. Adapt as needed.


---

## 🚀 Getting Started

Each microservice (`auth-service`, `employee-service`, `attendance-service`) is located in its own directory and must be installed and run independently.

### 🛠 Installation Steps

Repeat the following for each service (`auth-service`, `employee-service`, `attendance-service`):

```bash
cd [service-folder-name]
npm install
```

Example:
```bash
cd auth-service
npm install

cd ../employee-service
npm install

cd ../attendance-service
npm install
```

### ▶️ Run Each Service

```bash
npm run dev
```

Each service listens on its own port:
- `auth-service`: http://localhost:4002
- `employee-service`: http://localhost:4003
- `attendance-service`: http://localhost:4004

### 🔄 Environment Variables

Create a `.env` file in each service based on the values provided in the `README`. Be sure to use the correct JWT and database credentials in each one.
