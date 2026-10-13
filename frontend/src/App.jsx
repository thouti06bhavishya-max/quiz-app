import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';

import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import AllQuizzes from './pages/AllQuizzes';
import QuizDetails from './pages/QuizDetails';
import CreateQuiz from './pages/CreateQuiz';
import EditQuiz from './pages/EditQuiz';
import ManageQuestions from './pages/ManageQuestions';
import QuizInstructions from './pages/QuizInstructions';
import TakeQuiz from './pages/TakeQuiz';
import QuizResult from './pages/QuizResult';
import AnswerReview from './pages/AnswerReview';
import MyQuizzes from './pages/MyQuizzes';
import MyAttempts from './pages/MyAttempts';
import Leaderboard from './pages/Leaderboard';
import Profile from './pages/Profile';
import Notifications from './pages/Notifications';
import NotFound from './pages/NotFound';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <Routes>
            {/* Public Auth Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Protected Routes inside App Layout */}
            <Route
              element={
                <ProtectedRoute>
                  <Layout />
                </ProtectedRoute>
              }
            >
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/quizzes" element={<AllQuizzes />} />
              <Route path="/quizzes/:id" element={<QuizDetails />} />
              <Route path="/quizzes/create" element={<CreateQuiz />} />
              <Route path="/quizzes/:id/edit" element={<EditQuiz />} />
              <Route path="/quizzes/:quizId/questions" element={<ManageQuestions />} />
              <Route path="/quizzes/:id/instructions" element={<QuizInstructions />} />
              <Route path="/attempts/:attemptId/take" element={<TakeQuiz />} />
              <Route path="/attempts/:attemptId/result" element={<QuizResult />} />
              <Route path="/attempts/:attemptId/review" element={<AnswerReview />} />
              <Route path="/my-quizzes" element={<MyQuizzes />} />
              <Route path="/my-attempts" element={<MyAttempts />} />
              <Route path="/leaderboard" element={<Leaderboard />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/notifications" element={<Notifications />} />
            </Route>

            {/* Catch-all 404 */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
