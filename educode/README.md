# 🎓 EduCode LMS — Full Stack Learning Management System

A complete LMS platform built with **React + Node.js + Express + MongoDB**.

---

## 🛠 Tech Stack

| Layer     | Technology                        |
|-----------|-----------------------------------|
| Frontend  | React 18, React Router v6         |
| Backend   | Node.js, Express.js               |
| Database  | MongoDB + Mongoose                |
| Auth      | JWT (JSON Web Tokens) + bcryptjs  |
| Styling   | Custom CSS (design system)        |
| Notifications | react-hot-toast              |

---

## 📁 Project Structure

```
educode/
├── server/              # Express API
│   ├── models/          # Mongoose schemas
│   │   ├── User.js
│   │   ├── Course.js
│   │   ├── Question.js
│   │   ├── Assessment.js
│   │   └── CollegeTest.js
│   ├── routes/          # API routes
│   │   ├── auth.js
│   │   ├── courses.js
│   │   ├── questions.js
│   │   ├── assessments.js
│   │   ├── tests.js
│   │   ├── users.js
│   │   ├── compiler.js
│   │   └── leaderboard.js
│   ├── middleware/
│   │   └── auth.js      # JWT protect + authorize
│   ├── seed.js          # Database seeder
│   └── index.js         # Server entry
│
└── client/              # React app
    └── src/
        ├── context/     # AuthContext
        ├── utils/       # Axios instance
        ├── components/  # Shared UI + Layout
        └── pages/
            ├── student/ # Dashboard, Courses, Compiler, Problems, Assessments, Test, Leaderboard
            ├── admin/   # Dashboard, Courses, Questions, Assessments, Tests, Students
            └── college/ # College test portal
```

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- MongoDB running locally (`mongod`) OR MongoDB Atlas URI

### 1. Clone & Install
```bash
git clone <repo>
cd educode
npm run install-all
```

### 2. Configure Environment
```bash
cd server
cp .env.example .env
# Edit .env with your MongoDB URI and JWT secret
```

### 3. Seed Database
```bash
cd server
npm run seed
```
Creates demo accounts + sample courses, questions, assessments.

### 4. Run Development
```bash
# From root
npm run dev
# OR separately:
cd server && npm run dev    # http://localhost:5000
cd client && npm start      # http://localhost:3000
```

---

## 👤 Demo Accounts

| Role    | Email                      | Password    |
|---------|---------------------------|-------------|
| Admin   | admin@educode.com          | admin123    |
| Student | student@educode.com        | student123  |
| College | college@abc.edu            | college123  |

---

## ✨ Features

### Student
- 📊 **Dashboard** — Progress stats, enrolled courses, upcoming assessments
- 📚 **Courses** — Browse and enroll in DSA, Java, C, SQL courses
- 📖 **Course Detail** — Lesson-by-lesson learning with progress tracking
- 💻 **Code Practice IDE** — Multi-language compiler (C, C++, Java, Python, SQL)
- 🧩 **Problem Set** — Coding challenges with difficulty filter & inline submission
- 📝 **Assessments** — Timed MCQ tests with live countdown timer
- 🎯 **College Test** — Join tests by code, MCQ + Coding sections, auto-submit
- 🏆 **Leaderboard** — Score-based rankings

### Admin
- 📊 **Overview** — Stats dashboard
- 📚 **Course Manager** — Create/edit courses, add lessons with content
- ❓ **Question Bank** — Add MCQ & coding questions for DSA, Java, C, SQL
- 📋 **Assessment Builder** — Select questions, set duration, open/close control
- 🏫 **College Test Manager** — Create tests, assign questions, view test codes
- 👥 **Student Manager** — View all students, progress, scores

### College
- 🏫 **Test Portal** — Create & manage tests, share test codes
- ▶️ **Go Live / End Test** — Real-time test control
- 📈 **Results** — Student scores and rankings

---

## 🔌 API Endpoints

| Method | Endpoint                        | Description                  |
|--------|---------------------------------|------------------------------|
| POST   | /api/auth/register              | Register user                |
| POST   | /api/auth/login                 | Login                        |
| GET    | /api/auth/me                    | Get current user             |
| GET    | /api/courses                    | List courses                 |
| POST   | /api/courses/:id/enroll         | Enroll in course             |
| GET    | /api/questions                  | List questions               |
| POST   | /api/questions/:id/submit       | Submit coding solution       |
| GET    | /api/assessments                | List assessments             |
| POST   | /api/assessments/:id/submit     | Submit assessment            |
| POST   | /api/tests/join                 | Join test by code            |
| POST   | /api/tests/:id/submit           | Submit test                  |
| POST   | /api/compiler/run               | Run code (simulated)         |
| GET    | /api/leaderboard                | Get leaderboard              |

---

## 🔧 Production Notes

### Real Code Execution
The `/api/compiler/run` route simulates code execution. For real execution, integrate **Judge0**:
```
POST https://judge0-ce.p.rapidapi.com/submissions?wait=true
```
See `server/routes/compiler.js` for the integration comment.

### Environment Variables (server/.env)
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/educode_lms
JWT_SECRET=your_very_long_secret_key_here
JWT_EXPIRE=7d
CLIENT_URL=http://localhost:3000
```

### Build for Production
```bash
cd client && npm run build
# Serve client/build with nginx or express static
```
