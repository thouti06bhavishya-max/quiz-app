# 🎓 Online Quiz Management System — Student Project Guide

> **Academic Final Year / Semester Project**  
> **Domain:** Full-Stack Web Application with Artificial Intelligence (AI)  
> **Technologies:** React.js, Spring Boot, MySQL Database, Spring Security (JWT), Google Gemini AI API  

---

## 📌 1. Project Abstract & Overview

The **Online Quiz Management System (QuizMaster)** is a full-stack web application designed for students and educators to author, organize, practice, and evaluate online examinations. 

Unlike traditional platforms with complicated administrative barriers, our portal features a **unified student-teacher ecosystem**: any registered student can create quizzes, attempt challenges published by peers, view rankings on the leaderboard, and analyze detailed score breakdowns.

### 🌟 Key Innovation: Dual Question Authoring with Google Gemini AI
* **✍️ Manual Authoring:** Students/teachers can manually write questions, configure 4 options (A, B, C, D), assign marks, and specify answer explanations.
* **✨ AI Auto-Generation:** Integrated with the **Google Gemini API** (`gemini-1.5-flash`), allowing users to generate high-quality multiple-choice questions automatically by simply providing a topic (e.g., "Java Streams", "React Hooks", "Operating Systems Concurrency").
* **🤖 AI Tutor for Answer Review:** After submitting a quiz, students can click **"Ask Gemini AI Tutor"** to get personalized explanations explaining why their chosen option was incorrect and how to remember the correct concept.

---

## 🏗️ 2. System Architecture

The application follows the industry-standard **3-Tier Client-Server Architecture**:

```text
┌────────────────────────────────────────────────────────────────┐
│               PRESENTATION LAYER (Frontend)                    │
│   React.js 18 + Vite + Tailwind CSS + Lucide Icons + Recharts  │
│   Runs on: http://localhost:5173                               │
└───────────────────────────────▲────────────────────────────────┘
                                │ RESTful APIs (JSON over HTTP)
                                │ JWT Bearer Token in Headers
┌───────────────────────────────▼────────────────────────────────┐
│               APPLICATION LAYER (Backend)                      │
│   Spring Boot 3.2.5 + Spring Security 6 + Spring Data JPA     │
│   - Controllers: Auth, Quiz, Question, Attempt, AI, Leaderboard│
│   - Services: Business logic, Auto-grading, Timer validation   │
│   - Repositories: Hibernate ORM Data Access                    │
│   Runs on: http://localhost:8080                               │
└───────────────────────────────▲────────────────────────────────┘
                                │
        ┌───────────────────────┴───────────────────────┐
        ▼                                               ▼
┌───────────────────────────────┐       ┌───────────────────────────────┐
│        DATABASE LAYER         │       │        EXTERNAL AI LAYER      │
│   MySQL Database (Port 3306)  │       │     Google Gemini API         │
│   Database: online_quiz       │       │     Model: gemini-1.5-flash   │
└───────────────────────────────┘       └───────────────────────────────┘
```

---

## 🗄️ 3. Database Schema (MySQL)

The system uses 7 relational tables managed via Spring Data JPA:

| Table Name | Description | Key Relationships |
| :--- | :--- | :--- |
| `users` | Stores registered students/users, BCrypt hashed passwords, and roles. | 1-to-many with Quizzes, Attempts, Notifications |
| `categories` | Pre-seeded subject categories (Java, Python, Web Dev, OS, DBMS, etc.). | 1-to-many with Quizzes |
| `quizzes` | Stores quiz metadata (title, difficulty, duration, passing marks, negative marking). | Many-to-1 with User & Category; 1-to-many with Questions |
| `questions` | Stores individual MCQs (question text, options A-D, correct answer, marks, explanation). | Many-to-1 with Quiz |
| `quiz_attempts` | Records student exam sessions (start time, server deadline, time taken, final score, pass/fail). | Many-to-1 with User & Quiz |
| `attempt_answers` | Stores student selected options in real-time. | Many-to-1 with QuizAttempt & Question |
| `notifications` | In-app alerts for quiz publication, result generation, etc. | Many-to-1 with User |

---

## 🚀 4. How to Run the Project (Step-by-Step)

### Prerequisites:
1. **Java JDK 17 or 21** installed (`java -version`).
2. **Node.js 18+** installed (`node -v`).
3. **MySQL Server 8.0** running on `localhost:3306` with database `online_quiz` (User: `root`, Password: `root`).

### Quick 1-Click Launch (Windows):
Double click the provided `run.bat` file in the project root:
```bat
run.bat
```
This automatically starts both the Spring Boot Backend and the Vite React Frontend!

### Manual Launch:
* **Backend:**
  ```powershell
  cd backend
  java -jar target/online-quiz-system-backend-0.0.1-SNAPSHOT.jar
  # Backend runs on http://localhost:8080
  ```
* **Frontend:**
  ```powershell
  cd frontend
  npm.cmd run dev
  # Frontend runs on http://localhost:5173
  ```

---

## 🎯 5. Top 15 Viva Voce Questions & Answers (College Evaluation)

Here are the most common questions college professors and external examiners ask during final project presentations, along with crisp, impressive student answers:

### Q1: What is the main objective of this project?
> **Answer:** "The objective is to provide an interactive, secure, and full-featured online quiz platform. It enables students to test their knowledge under timed conditions with automatic grading, while also allowing anyone to author quizzes either manually or instantly using Google Gemini AI."

### Q2: Why did you choose Spring Boot instead of plain Servlets/JSP?
> **Answer:** "Spring Boot eliminates boilerplate configuration through its auto-configuration, built-in embedded Tomcat server, and Spring Data JPA. It enables clean separation of concerns using MVC architecture, secure password encryption, and fast development of RESTful APIs."

### Q3: Why did you use React.js with Vite for the frontend?
> **Answer:** "React uses a component-based architecture and a Virtual DOM, which makes the UI highly responsive and modular. Vite provides lightning-fast build times using native ES modules compared to older bundlers like Webpack."

### Q4: How does JWT (JSON Web Token) authentication work in your application?
> **Answer:** "When a student logs in with their email and password, Spring Security verifies the credentials. If valid, the server signs and returns a compact JWT token containing the user's ID and email. On subsequent requests, the React frontend passes this token in the `Authorization: Bearer <token>` header. The backend validates the signature without needing server-side session state, making the API stateless and scalable."

### Q5: How do you prevent password theft in the database?
> **Answer:** "We never store passwords in plain text. We use `BCryptPasswordEncoder` from Spring Security, which performs one-way cryptographic hashing with a random salt. Even if the database is exposed, the actual passwords cannot be reversed."

### Q6: How does the quiz timer work? Can a student cheat by refreshing their browser?
> **Answer:** "No, a student cannot cheat by refreshing. The exam timer is strictly enforced on the server. When the student clicks 'Start Quiz', the backend records the `startedAt` timestamp and computes the strict `deadline`. Whenever the student refreshes or submits, the server checks the current system time against the recorded deadline. If time has expired, the quiz is automatically submitted and scored."

### Q7: Are correct answers visible in the browser network tab during an attempt?
> **Answer:** "No. To maintain security, when a student is attempting a quiz, the API uses a dedicated `QuestionTakerResponse` DTO that strictly omits the `correctAnswer` and `explanation` fields. The answers are stored exclusively in MySQL and are only revealed in `AnswerReview` after final submission."

### Q8: How did you integrate Google Gemini AI into this project?
> **Answer:** "We created a `GeminiService` in Spring Boot that interacts with the Google Gemini REST API (`gemini-1.5-flash`). We formulate a structured prompt asking Gemini to output a strict JSON array of MCQs with question statements, 4 choices, correct answer key, and pedagogical explanations. We then parse the JSON and save the questions directly to the quiz in MySQL."

### Q9: What happens if the Gemini API key is missing or the internet is down?
> **Answer:** "We built a reliable offline fallback generator inside `GeminiService`. If the API key is unconfigured or network requests fail, the application gracefully provides relevant offline challenge questions, ensuring the quiz creation workflow never crashes."

### Q10: How does the auto-grading system calculate final marks?
> **Answer:** "When the student submits, the backend compares each selected option in `attempt_answers` against the official `correctAnswer` in the database:
> * **Correct Answer:** Awards the question's full marks.
> * **Wrong Answer:** If negative marking is enabled on the quiz, deducts the configured penalty (e.g. 0.25 marks); otherwise awards 0.
> * **Unanswered Question:** Awards 0 marks.
> It calculates the total score, percentage, and compares it against `passingMarks` to assign PASS or FAIL."

### Q11: What is Spring Data JPA and how does it help?
> **Answer:** "Spring Data JPA is an abstraction on top of Hibernate (Object-Relational Mapping). Instead of writing raw SQL queries, we define Java entities like `Quiz` and `Question` with annotations like `@Entity`, `@OneToMany`, and `@ManyToOne`. Spring automatically generates CRUD operations through repository interfaces like `QuizRepository`."

### Q12: What is CORS and why was it configured?
> **Answer:** "CORS (Cross-Origin Resource Sharing) is a browser security mechanism that blocks web pages from making requests to a different domain or port. Since our frontend runs on `http://localhost:5173` and backend runs on `http://localhost:8080`, we configured a `CorsConfigurationSource` bean in Spring Security to explicitly permit requests from port 5173."

### Q13: How does the AI Tutor in the Answer Review page work?
> **Answer:** "When a student reviews an attempt and doesn't understand why their answer was incorrect, they click 'Ask Gemini AI Tutor'. The backend sends the question, student's selected answer, and correct answer to Gemini, which returns a clear, step-by-step conceptual explanation."

### Q14: How are users prevented from modifying other users' quizzes?
> **Answer:** "In `QuizService` and `QuestionService`, every update or delete operation checks the authenticated user's ID extracted from the validated JWT token against `quiz.getCreator().getId()`. If they do not match, the backend throws a `ForbiddenException` (HTTP 403 Forbidden)."

### Q15: What future enhancements can be added to this project?
> **Answer:** "Future enhancements could include:
> 1. AI-generated voice reading of questions for accessibility.
> 2. PDF certificate generation upon passing a quiz.
> 3. Real-time multiplayer quiz competition using WebSockets."

---

## 🎬 6. 3-Minute Project Demo Script (For Viva & Evaluation)

Follow this exact flow when demonstrating your project to your teacher or examiner:

1. **Step 1: Introduction (30 seconds)**
   * Show the homepage on `http://localhost:5173`.
   * *"Good morning, Sir/Madam. This is our Online Quiz Management System built using React, Spring Boot, MySQL, and Google Gemini AI."*
   * Point out the clean student portal dashboard with statistics cards and performance trend chart.

2. **Step 2: Create a Quiz with AI (60 seconds)**
   * Click **"Create Quiz"**.
   * Show the two options: **"✍️ Do Manually"** vs **"✨ Generate with AI"**.
   * Select **"✨ Generate with AI"**, type a title like *"Core Java Multithreading"*, choose 3 questions, and click **"Create Quiz & Generate with Gemini AI"**.
   * Show how all 3 questions with 4 options, correct answer, and explanations are instantly generated and saved!
   * Click **"Publish Quiz"** to make it live.

3. **Step 3: Attempting a Timed Quiz (60 seconds)**
   * Go to **"All Quizzes"**, select the published quiz, and review the instructions.
   * Click **"Start Quiz"**.
   * Highlight the **countdown timer**, question navigation palette, and real-time answer saving.
   * Select answers and click **"Submit Quiz"**.

4. **Step 4: Scorecard & AI Tutor Review (30 seconds)**
   * Show the instant scorecard: marks, percentage, breakdown pie chart (Correct vs Wrong vs Skipped).
   * Click **"Review Answers"**.
   * Click **"Ask Gemini AI Tutor"** on a question to show the real-time AI conceptual explanation.
   * Conclude: *"This demonstrates end-to-end full-stack integration with AI-powered personalized learning."*

---
*Created for academic demonstration, project report documentation, and viva preparation.*
