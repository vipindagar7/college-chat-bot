import { Routes, Route, Navigate } from 'react-router-dom';
import { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import AuthFlow from './components/auth/AuthFlow';
import ChatInterface from './components/chat/ChatInterface';
import AdminLogin from './components/admin/AdminLogin';
import AdminDashboard from './components/admin/AdminDashboard';

function ChatApp() {
  const { isAuth } = useAuth();
  return (
    <div className="h-screen w-screen overflow-hidden">
      {isAuth ? <ChatInterface /> : <AuthFlow />}
    </div>
  );
}

function AdminApp() {
  const [tok, setTok] = useState(() => sessionStorage.getItem('ab_admin_tok'));

  const login = (token) => {
    setTok(token);
    sessionStorage.setItem('ab_admin_tok', token);
  };
  const logout = () => {
    setTok(null);
    sessionStorage.removeItem('ab_admin_tok');
  };

  if (!tok) return <AdminLogin onLogin={login} />;
  return <AdminDashboard token={tok} onLogout={logout} />;
}

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<ChatApp />} />
        <Route path="/admin" element={<AdminApp />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </AuthProvider>
  );
}
