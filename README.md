# Student Information System (SIS)

This repository contains the backend and frontend components for a high school academic management platform. It handles student enrolment, faculty assignments, and course scheduling.

## Prerequisites
To run this project locally, you need the following installed:
- Node.js (v18 or higher)
- XAMPP (for local MySQL database hosting)

## Setup Instructions

### 1. Database Configuration
Open the XAMPP Control Panel and start the MySQL service. Start Apache if you need to access phpMyAdmin.
You must have a local MySQL database named `student_info_system_db` created before running the backend.

### 2. Install Dependencies
Open a terminal and install the required packages for both backend and frontend:
```bash
cd backend
npm install

cd ../frontend
npm install
```

### 3. Environment Variables
Create a file named `.env` inside the `backend/` directory. Use the following template, but adjust the user and password variables to match your local MySQL credentials:
```text
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=root
DB_NAME=student_info_system_db
PORT=5000
```

### 4. Running the Application
From the project root directory, run both the backend and frontend concurrently:
```bash
npm run dev
```
This starts the Express backend on port 5000 and the React frontend on port 5173. The frontend proxies API requests to the backend automatically.

### 5. Logging In
The login page authenticates users against the database using bcrypt-hashed passwords. The system determines your role based on your email:
- Faculty emails log in as **Admin**
- Student emails log in as **Student**
- Michael Thompson logs in as **Super Admin** (access to both portals)

Default password format: `(FirstInitial)(LastName)(2digits)` — for example, `MThompson01`.

## Project Architecture
```
StudentInformationSystem/
├── backend/
│   ├── server.js                  <- Express server entry point
│   ├── db.js                      <- MySQL connection pool
│   ├── .env                       <- Database credentials
│   ├── routes/
│   │   ├── auth.js                <- Login & JWT authentication
│   │   ├── students.js
│   │   ├── faculty.js
│   │   ├── course.js
│   │   ├── academicTerms.js
│   │   ├── schedules.js
│   │   ├── courseOfferings.js
│   │   ├── enrollments.js
│   │   ├── prerequisites.js
│   │   └── supervises.js
│   └── middleware/
│       └── authMiddleware.js      <- JWT verification & role checking
├── frontend/
│   ├── src/
│   │   ├── App.jsx                <- Main app with routing & auth
│   │   ├── pages/                 <- All page components
│   │   └── components/            <- Shared UI components
│   └── vite.config.js             <- Vite config with API proxy
├── Frontend_Requirements.md       <- UI/UX specifications
└── README.md
```

## API Reference
The backend exposes the following RESTful endpoints under the `/api` prefix:

- Auth: `/auth/login` (POST)
- Students: `/students` (GET, POST), `/students/:id` (GET, PUT, DELETE)
- Faculty: `/faculty` (GET, POST), `/faculty/:id` (GET, PUT, DELETE)
- Courses: `/course` (GET, POST), `/course/:id` (GET, PUT, DELETE)
- Academic Terms: `/academic-term` (GET, POST), `/academic-term/:id` (GET, PUT, DELETE)
- Schedules: `/schedules` (GET, POST), `/schedules/:id` (GET, PUT, DELETE)
- Course Offerings: `/course-offerings` (GET, POST), `/course-offerings/:id` (GET, PUT, DELETE)
- Enrollments: `/enrollments` (GET, POST), `/enrollments/:id` (GET, PUT, DELETE)
- Prerequisites: `/prerequisites` (GET, POST, DELETE)
- Supervises: `/supervises` (GET, POST, DELETE)

Note: The `POST /api/students` endpoint uses a custom MySQL stored procedure (`EnrolStudent`) to handle student type routing (FullTime/PartTime).

## Authentication
- Login is handled via `POST /api/auth/login` which returns a JWT token
- Passwords are hashed using bcrypt and stored in `password_hash` columns in both Student and Faculty tables
- The frontend stores the token and user info in localStorage to persist sessions across page refreshes

## Role-Based Access

| Role | Admin Portal | Student Portal |
|---|---|---|
| Admin (Faculty) | Full access | No access |
| Super Admin (Michael Thompson) | Full access | Full access |
| Student | No access | Full access |

Students can only browse course offerings that match their grade level.

## Tech Stack
- Frontend: React, CSS3, Vite
- Backend: Node.js, Express, JWT, bcrypt
- Database: MySQL 8.x (via XAMPP)