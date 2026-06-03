import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Layout/Navbar';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import TaskDetail from './pages/TaskDetail';
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';

/* ── Protected route wrapper ─────────────────────────────────────────────── */
function PrivateRoute({ children }) {
  const { user } = useAuth();
  return user ? children : <Navigate to="/login" replace />;
}

/* ── Public-only route (redirect logged-in users away) ───────────────────── */
function PublicRoute({ children }) {
  const { user } = useAuth();
  return user ? <Navigate to="/dashboard" replace /> : children;
}

/* ── App shell ────────────────────────────────────────────────────────────── */
function AppShell() {
  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0f0c29 0%, #1a1535 50%, #0d0b25 100%)',
      fontFamily: "'Inter', 'Segoe UI', sans-serif",
      color: '#fff',
    }}>
      <Navbar />
      <Routes>
        {/* Public pages */}
        <Route path="/" element={<Home />} />
        <Route path="/login"    element={<PublicRoute><Login /></PublicRoute>} />
        <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />

        {/* Protected pages */}
        <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
        <Route path="/tasks/:id" element={<PrivateRoute><TaskDetail /></PrivateRoute>} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppShell />
      </AuthProvider>
    </BrowserRouter>
  );
}
