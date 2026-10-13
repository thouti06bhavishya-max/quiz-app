# Online Quiz Management System

A full-stack, secure, multi-tenant capable, and responsive **Online Quiz Management System** built with **Spring Boot 3 (Java 21)**, **MySQL 8.0**, and **React 18 (Vite + Tailwind CSS + Recharts)**.

---

## 🌟 Key Highlights & Principles

* **Unified User Model**: Every registered user has the same core capabilities—they can both author/manage their own quizzes and participate in quizzes created by others.
* **Strict Ownership & Privacy**:
  * Only a quiz creator can update, delete, publish, unpublish, or edit questions for their quiz.
  * Quiz takers cannot view correct answers or explanations before submission.
  * Attempt history and private answer reviews are strictly isolated per user.
* **Server-Side Controlled Examination**:
  * Start time and deadlines are computed and validated exclusively on the server.
  * Automatic submission upon expiration with zero frontend score manipulation.
  * Supports negative marking, configurable passing marks, and question reordering.
* **Analytics & Performance Tracking**:
  * Real-time dashboard with score trend charts (Recharts).
  * Global and quiz-specific leaderboards.
  * Post-submission question-by-question review with explanations.

---

## 🛠️ Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Backend** | Java 21, Spring Boot 3.2.5, Spring Security 6, Spring Data JPA, Hibernate, JJWT 0.12.5, Maven |
| **Frontend** | React 18, Vite, JavaScript, Tailwind CSS, Lucide React, Recharts, Axios, React Router DOM v6 |
| **Database** | MySQL 8.0 (InnoDB, Foreign Keys, Unique constraints, Indexes) |
| **Auth** | Stateless JWT (Bearer token), BCrypt password hashing |

---

## 📁 Project Structure

```
online-quiz-system/
├── backend/
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/com/example/quizapp/
│   │   │   │   ├── config/             # Security & seed data configuration
│   │   │   │   ├── controller/         # REST Controllers
│   │   │   │   ├── dto/                # Request/Response Data Transfer Objects
│   │   │   │   ├── entity/             # JPA Entities (User, Quiz, Question, Attempt, etc.)
│   │   │   │   ├── exception/          # GlobalExceptionHandler and Custom Exceptions
│   │   │   │   ├── repository/         # Spring Data JPA Repositories
│   │   │   │   ├── security/           # JWT Provider, Auth Filter & Security Config
│   │   │   │   └── service/            # Business Logic & Scoring Service
│   │   │   └── resources/
│   │   │       └── application.properties # Environment-driven properties
│   │   └── test/                       # JUnit 5 & SpringBootTest suites
│   ├── pom.xml
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── components/                 # Navbar, Sidebar, Layout, Modal, StatCard, QuizCard
│   │   ├── context/                    # AuthContext and ToastContext
│   │   ├── pages/                      # 18 complete application pages
│   │   ├── services/                   # Axios API service modules
│   │   ├── App.jsx                     # Route definitions & guards
│   │   └── main.jsx
│   ├── package.json
│   ├── vite.config.js
│   └── tailwind.config.js
├── database/
│   └── schema.sql                      # Complete MySQL schema and initial categories
├── online-quiz-system.postman_collection.json # Ready-to-import Postman suite
└── README.md
```

---

## 🚀 Getting Started (Windows)

### Prerequisites
* **Java 21 JDK**
* **Apache Maven** (Portable version configured in `C:\Users\Ajeet\tools\apache-maven-3.9.6\bin`)
* **Node.js 20+ & npm**
* **MySQL Server 8.0** running on `localhost:3306`

---

### Step 1: Database Setup

Run the SQL initialization script located at `database/schema.sql` into MySQL:

```powershell
# Using MySQL CLI
Get-Content ".\database\schema.sql" | & "C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe" -u root -proot
```

Or connect via MySQL Workbench and execute the script. It creates:
* Database `online_quiz`
* All 7 relational tables with indexes and constraints
* 10 standard categories (Programming, Java, Python, Web Dev, OS, DBMS, etc.)

---

### Step 2: Configure & Start Backend Server

Backend port defaults to `http://localhost:8080`.

1. Open a PowerShell terminal and navigate to `backend`:
   ```powershell
   cd C:\Users\Ajeet\.gemini\antigravity\scratch\online-quiz-system\backend
   ```
2. Build and verify test suites:
   ```powershell
   & "C:\Users\Ajeet\tools\apache-maven-3.9.6\bin\mvn.cmd" clean test
   ```
3. Start the Spring Boot application:
   ```powershell
   java -jar target\online-quiz-system-backend-0.0.1-SNAPSHOT.jar
   ```

*Note: On initial startup, the backend automatically seeds sample quizzes and a demo instructor account if empty.*

---

### Step 3: Start React Frontend

Frontend port is `http://localhost:5173`.

1. Open another PowerShell terminal and navigate to `frontend`:
   ```powershell
   cd C:\Users\Ajeet\.gemini\antigravity\scratch\online-quiz-system\frontend
   ```
2. Start the Vite development server:
   ```powershell
   npm.cmd run dev
   ```
3. Open your browser and navigate to:
   ```
   http://localhost:5173
   ```

---

## 🔑 Pre-Configured Test Credentials

| Account | Email | Password | Role |
| :--- | :--- | :--- | :--- |
| **Demo Author** | `demo@quizmaster.com` | `password123` | Creator of Sample Quizzes |
| **Demo Student** | `alice@example.com` | `password123` | Registered Test Taker |

*You can also register any number of new users with unique emails via the Register page.*

---

## 📖 REST API Documentation

Base URL: `http://localhost:8080/api`

### 1. Authentication
* `POST /auth/register` - Create new user account (`fullName`, `email`, `password`)
* `POST /auth/login` - Authenticate and obtain JWT Bearer token
* `GET /auth/me` - Retrieve current user profile (Authenticated)

### 2. User Profile
* `GET /users/me` - Fetch profile details
* `PUT /users/me` - Update full name
* `PUT /users/me/password` - Change password (verifies `currentPassword`)

### 3. Categories
* `GET /categories` - Retrieve all quiz categories

### 4. Quizzes
* `GET /quizzes` - Search and filter published quizzes (Supports `categoryId`, `difficulty`, `search`, pagination)
* `GET /quizzes/{id}` - Get quiz details (Draft quizzes restricted to creator)
* `POST /quizzes` - Create a quiz in DRAFT status
* `PUT /quizzes/{id}` - Update quiz parameters (Creator only)
* `DELETE /quizzes/{id}` - Delete quiz and cascade (Creator only)
* `GET /quizzes/my` - Fetch quizzes authored by authenticated user
* `POST /quizzes/{id}/publish` - Publish quiz (Requires questions > 0, totalMarks > 0)
* `POST /quizzes/{id}/unpublish` - Revert quiz to Draft
* `GET /quizzes/{id}/analytics` - Participant metrics and pass rates (Creator only)

### 5. Questions
* `GET /quizzes/{quizId}/questions` - View question inventory with correct answers & explanations (Creator only)
* `POST /quizzes/{quizId}/questions` - Add question (A, B, C, D choices, marks, correct option, explanation)
* `PUT /questions/{id}` - Update question
* `DELETE /questions/{id}` - Remove question and recalculate quiz marks

### 6. Quiz Attempts & Taking
* `POST /attempts/start` - Initiate or resume a quiz attempt. Questions sent **without** answers or explanations.
* `GET /attempts/{id}` - Get active attempt session and remaining timer
* `PUT /attempts/{id}/answers` - Auto-save selected choice (`A`, `B`, `C`, `D`, or `null`)
* `POST /attempts/{id}/submit` - Submit and score attempt on server
* `GET /attempts/my` - Private attempt history of authenticated user
* `GET /attempts/{id}/result` - Summary score, percentage, pass/fail result
* `GET /attempts/{id}/review` - Comprehensive post-submission review with questions, chosen options, correct answers, and explanations

### 7. Leaderboards
* `GET /leaderboard` - Global standings by score and accuracy
* `GET /leaderboard/quiz/{quizId}` - High scores for a specific quiz

### 8. Notifications & Dashboard
* `GET /notifications` - User notifications (Quiz published, result available)
* `PUT /notifications/{id}/read` - Mark single notification as read
* `PUT /notifications/read-all` - Mark all notifications as read
* `GET /dashboard/stats` - Personalized metrics and score trend trajectory

---

## 🔒 Security Design

1. **Answer Masking**: During an active attempt, question payloads use `QuestionTakerResponse` which omits `correctAnswer` and `explanation`.
2. **Server-Side Timers**: Deadlines are validated using `expiresAt = startedAt + durationMinutes`. Late submissions past the grace threshold are marked expired.
3. **Data Isolation**: Attempt records verify that `attempt.getUser().getId().equals(currentUser.getId())` before returning scores or reviews.
4. **Creator Exclusivity**: Modifications to quizzes and questions verify `quiz.getCreator().getId().equals(currentUser.getId())` returning `403 Forbidden` on mismatch.
