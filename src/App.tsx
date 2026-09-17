import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider, useApp } from './context/AppContext';
import { AppLayout } from './components/Layout';
import { LandingPage } from './pages/Landing';
import { LoginPage, RegisterPage, ForgotPasswordPage } from './pages/Auth';
import { DashboardPage } from './pages/Dashboard';
import { CreateSetPage } from './pages/CreateSet';
import { StudySetPage } from './pages/StudySet';
import { FlashcardsPage } from './pages/Flashcards';
import { QuizPage } from './pages/Quiz';
import { WrittenTestPage, FillBlanksPage } from './pages/WrittenTest';
import { NotesPage } from './pages/Notes';
import { TutorPage } from './pages/Tutor';
import { PodcastPage } from './pages/Podcast';
import { ResolvePage } from './pages/Resolve';
import { FoldersPage, SetsListPage } from './pages/Folders';
import { ProgressPage } from './pages/Progress';
import { SettingsPage } from './pages/Settings';
import { LearnerProfilePage } from './pages/LearnerProfile';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useApp();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useApp();
  if (isAuthenticated) return <Navigate to="/app" replace />;
  return <>{children}</>;
}

function AppRoutes() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<PublicRoute><LandingPage /></PublicRoute>} />
      <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
      <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />
      <Route path="/forgot" element={<PublicRoute><ForgotPasswordPage /></PublicRoute>} />

      {/* Protected app routes */}
      <Route path="/app" element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
        <Route index element={<DashboardPage />} />
        <Route path="create" element={<CreateSetPage />} />
        <Route path="sets" element={<SetsListPage />} />
        <Route path="set/:id" element={<StudySetPage />} />
        <Route path="set/:id/flashcards" element={<FlashcardsPage />} />
        <Route path="set/:id/quiz" element={<QuizPage />} />
        <Route path="set/:id/written" element={<WrittenTestPage />} />
        <Route path="set/:id/fillblanks" element={<FillBlanksPage />} />
        <Route path="set/:id/notes" element={<NotesPage />} />
        <Route path="set/:id/tutor" element={<TutorPage />} />
        <Route path="set/:id/podcast" element={<PodcastPage />} />
        <Route path="folders" element={<FoldersPage />} />
        <Route path="resolve" element={<ResolvePage />} />
        <Route path="progress" element={<ProgressPage />} />
        <Route path="settings" element={<SettingsPage />} />
        <Route path="profile" element={<LearnerProfilePage />} />
      </Route>

      {/* Catch all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppProvider>
        <AppRoutes />
      </AppProvider>
    </BrowserRouter>
  );
}
