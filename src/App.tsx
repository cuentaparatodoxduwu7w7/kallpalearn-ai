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
import { SystemStatusPage } from './pages/SystemStatus';

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

// Detectar basename para GitHub Pages
function getBasename(): string {
  // En desarrollo, usar '/'
  if (import.meta.env.DEV) {
    return '/';
  }
  
  // En producción, detectar el nombre del repositorio desde la URL
  const pathParts = window.location.pathname.split('/');
  
  // Si la URL tiene formato /repo-name/..., extraer repo-name
  // GitHub Pages usa: https://username.github.io/repo-name/
  if (pathParts.length > 1 && pathParts[1] && !pathParts[1].startsWith('app') && pathParts[1] !== '') {
    return `/${pathParts[1]}`;
  }
  
  return '/';
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
        <Route path="system-status" element={<SystemStatusPage />} />
      </Route>

      {/* Catch all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  const basename = getBasename();
  
  return (
    <BrowserRouter basename={basename}>
      <AppProvider>
        <AppRoutes />
      </AppProvider>
    </BrowserRouter>
  );
}
