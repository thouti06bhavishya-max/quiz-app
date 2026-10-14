# 🚀 Complete Cloud Deployment Guide: Aiven + Render + Vercel

This guide provides step-by-step instructions to deploy the **Online Quiz Management System** 24/7 online for free using:
1. **Database:** [Aiven.io](https://aiven.io) (Cloud MySQL)
2. **Backend:** [Render.com](https://render.com) (Spring Boot Web Service via Docker)
3. **Frontend:** [Vercel.com](https://vercel.com) (React + Vite Web App)

---

## 📌 Architecture of Cloud Deployment

```text
┌─────────────────────────────────┐
│       VERCEL (Frontend)         │  https://your-quiz-app.vercel.app
│   React.js 18 + Vite (SPA)      │
└────────────────┬────────────────┘
                 │ Calls REST APIs with JWT
                 ▼
┌─────────────────────────────────┐
│       RENDER (Backend)          │  https://your-quiz-backend.onrender.com
│   Spring Boot 3 + Java 21       │
└────────────────┬────────────────┘
                 │ JDBC with SSL (sslMode=REQUIRED)
                 ▼
┌─────────────────────────────────┐
│       AIVEN (Database)          │  mysql-xxxx.aivencloud.com:12345
│   Cloud MySQL 8.0               │
└─────────────────────────────────┘
```

---

## 🗄️ Step 1: Create Free Cloud MySQL on Aiven (2 Minutes)

1. Go to **[https://aiven.io](https://aiven.io)** and sign up for a free account.
2. In the console, click **"Create Service"**.
3. Select **MySQL**.
4. Choose the **Free Plan** (or trial tier) and pick the cloud provider/region closest to you (e.g. AWS or Google Cloud).
5. Click **"Create Service"**.
6. Wait 1–2 minutes until the service status turns **Running**.
7. In the **Overview** tab, copy these connection details:
   * **Host** (e.g. `mysql-36abc.aivencloud.com`)
   * **Port** (e.g. `12345`)
   * **User** (e.g. `avnadmin`)
   * **Password** (e.g. `AVNS_xxxxxxxxxxxx`)
   * **Database** (default is `defaultdb`)

👉 **Construct your JDBC URL:**
```text
jdbc:mysql://<HOST>:<PORT>/defaultdb?sslMode=REQUIRED&serverTimezone=UTC&allowPublicKeyRetrieval=true
```
*(Example: `jdbc:mysql://mysql-36abc.aivencloud.com:12345/defaultdb?sslMode=REQUIRED&serverTimezone=UTC&allowPublicKeyRetrieval=true`)*

---

## 🐙 Step 2: Push Project to Your GitHub (1 Minute)

1. Go to **[https://github.com/new](https://github.com/new)** and create a new repository (e.g. `online-quiz-system`). Keep it Public or Private.
2. Open PowerShell in your project folder (`C:\Users\Ajeet\Downloads\online-quiz-system`):
   ```powershell
   git init
   git add .
   git commit -m "Complete project ready for cloud deployment"
   git branch -M main
   git remote add origin https://github.com/YOUR_GITHUB_USERNAME/online-quiz-system.git
   git push -u origin main
   ```

---

## ⚙️ Step 3: Deploy Backend on Render (3 Minutes)

1. Go to **[https://render.com](https://render.com)** and sign in with GitHub.
2. Click **"New +"** (top right) ➔ select **"Web Service"**.
3. Click **"Build and deploy from a Git repository"** and select your `online-quiz-system` repository.
4. Fill in the service configuration:
   * **Name:** `online-quiz-backend`
   * **Region:** Any (e.g. Frankfurt or Oregon)
   * **Runtime:** Select **Docker** *(Render will automatically use the pre-configured `backend/Dockerfile`!)*
   * **Dockerfile Path:** `backend/Dockerfile`
   * **Docker Context:** `backend`
   * **Instance Type:** Select **Free**
5. Scroll down to **"Environment Variables"** and add these:

   | Key | Value | Description |
   | :--- | :--- | :--- |
   | `PORT` | `8080` | Server listening port |
   | `SPRING_DATASOURCE_URL` | `jdbc:mysql://<HOST>:<PORT>/defaultdb?sslMode=REQUIRED&serverTimezone=UTC&allowPublicKeyRetrieval=true` | Your Aiven JDBC URL |
   | `SPRING_DATASOURCE_USERNAME` | `avnadmin` | Aiven MySQL username |
   | `SPRING_DATASOURCE_PASSWORD` | `<YOUR_AIVEN_PASSWORD>` | Aiven MySQL password |
   | `CORS_ALLOWED_ORIGINS` | `*` | Allows Vercel frontend requests |
   | `GEMINI_API_KEY` | *(Optional)* | Your Google Gemini API Key |

6. Click **"Create Web Service"**.
7. Render will build the container, connect to Aiven, auto-create tables, and seed the default quiz categories!
8. Copy your backend live URL:  
   👉 **`https://online-quiz-backend-xxxx.onrender.com`**

---

## 💻 Step 4: Deploy Frontend on Vercel (2 Minutes)

1. Go to **[https://vercel.com](https://vercel.com)** and sign in with GitHub.
2. Click **"Add New..."** ➔ **"Project"**.
3. Find your `online-quiz-system` repository and click **"Import"**.
4. In the configuration screen:
   * **Root Directory:** Click **Edit** and choose `frontend`.
   * **Framework Preset:** `Vite` (automatically detected).
5. Open the **"Environment Variables"** section and add:
   * **Key:** `VITE_API_BASE_URL`
   * **Value:** `https://online-quiz-backend-xxxx.onrender.com/api`  
     *(Make sure to append `/api` at the end of your Render backend URL!)*
6. Click **"Deploy"**.
7. Vercel will build and publish your frontend in ~30 seconds!
8. Click the generated live link:  
   👉 **`https://online-quiz-system-xxxx.vercel.app`**

---

## ✅ Step 5: Final Check

1. Open your Vercel link in your browser.
2. Click **"Register"** and create your student account.
3. Everything (Database on Aiven, API logic on Render, and React UI on Vercel) is permanently connected and running 24/7!
