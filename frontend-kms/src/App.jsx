import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { Layers, LogOut, LayoutDashboard, Settings, FolderKey } from 'lucide-react';
import LoginCard from './components/LoginCard';
import PlatformGrid from './components/PlatformGrid';
import NotesBoard from './components/NotesBoard';
import Chatbot from './components/Chatbot';
import KnowledgeBase from './components/KnowledgeBase';

// Layout Dashboard Utama
function DashboardLayout({ user, onLogout, children }) {
  const location = useLocation();
  const navigate = useNavigate();
  const currentPath = location.pathname;
  const activeTab = currentPath === '/knowledge' ? 'knowledge' : 'dashboard';

  return (
    <div className="min-h-screen bg-[#070b12] flex font-sans">
      
      {/* 1. SIDEBAR KIRI */}
      <aside className="w-64 border-r border-slate-900 bg-[#090f19] flex flex-col justify-between p-4 sticky top-0 h-screen z-40">
        <div className="space-y-8">
          <div className="flex items-center gap-3 px-2 py-3 border-b border-slate-900">
            <div className="bg-cyan-600/10 p-2 rounded-xl border border-cyan-500/20 text-cyan-400"><Layers size={20} /></div>
            <div>
              <h1 className="text-sm font-black tracking-wider text-white">VARNION KMS</h1>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Quality Assurance</p>
            </div>
          </div>

          {/* LINK MENU UTAMA */}
          <nav className="space-y-1">
            <button 
              onClick={() => navigate('/dashboard')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold text-left transition-colors cursor-pointer ${
                activeTab === 'dashboard' 
                  ? 'bg-cyan-600/10 text-cyan-400 border border-cyan-500/10' 
                  : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'
              }`}
            >
              <LayoutDashboard size={16} /> <span>Dashboard</span>
            </button>
            
            <button 
              onClick={() => navigate('/knowledge')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold text-left transition-colors cursor-pointer ${
                activeTab === 'knowledge' 
                  ? 'bg-cyan-600/10 text-cyan-400 border border-cyan-500/10' 
                  : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'
              }`}
            >
              <FolderKey size={16} /> <span>Knowledge Base</span>
            </button>

            <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold text-slate-400 text-left opacity-30 cursor-not-allowed">
              <Settings size={16} /> <span>Settings</span>
            </button>
          </nav>
        </div>

        {/* Info Sesi Penguji */}
        <div className="border-t border-slate-900 pt-4 space-y-3">
          <div className="flex items-center gap-3 p-2 bg-slate-950/60 border border-slate-900 rounded-xl">
            <div className="w-8 h-8 rounded-lg bg-cyan-600 flex items-center justify-center text-slate-950 font-black text-xs uppercase">
              {user.username.substring(0, 2)}
            </div>
            <div className="overflow-hidden">
              <h4 className="text-xs font-black text-slate-200 truncate capitalize">{user.username}</h4>
              <p className="text-[10px] text-cyan-400 font-bold tracking-tight">{user.role === 'super_admin' ? 'Lead QA Engineer' : 'QA Engineer'}</p>
            </div>
          </div>
          <button onClick={onLogout} className="w-full flex items-center justify-center gap-2 py-2.5 bg-red-950/20 hover:bg-red-950/40 border border-red-900/30 text-red-400 text-xs font-bold rounded-xl transition-all cursor-pointer">
            <LogOut size={14} /> <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* 2. AREA KONTEN UTAMA SEBELAH KANAN */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="px-8 py-4 bg-[#070b12]/40 backdrop-blur-md border-b border-slate-900 flex justify-between items-center sticky top-0 z-30">
          <div className="text-xs text-slate-500 font-mono">
            QA Operations / <span className="text-slate-300 capitalize">{activeTab === 'dashboard' ? 'Dashboard' : 'Knowledge Base'}</span>
          </div>
          <div className="flex items-center gap-2 text-[11px] font-bold text-emerald-400 bg-emerald-500/5 border border-emerald-500/10 px-2.5 py-1 rounded-full">
            <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse"></span> System Live - Synced
          </div>
        </header>

        {/* AREA RENDERING VIEWS */}
        <main className="flex-1 p-8 space-y-12 max-w-6xl w-full mx-auto">
          {children}
        </main>
      </div>

      <Chatbot />
    </div>
  );
}

// Router Utama
export default function App() {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('kms_user_session');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const [platforms, setPlatforms] = useState([]);
  const [notes, setNotes] = useState([]);
  const [documents, setDocuments] = useState([]);

  const fetchData = async () => {
    try {
      const resPlat = await fetch('http://localhost:5000/api/platforms');
      setPlatforms(await resPlat.json());

      const resNotes = await fetch('http://localhost:5000/api/kanban');
      setNotes(await resNotes.json());

      const resDocs = await fetch('http://localhost:5000/api/knowledge');
      setDocuments(await resDocs.json());
    } catch (err) {
      console.error("Gagal memuat data dari server:", err);
    }
  };

  useEffect(() => {
    if (user) fetchData();
  }, [user]);

  // Login Handler
  const handleLoginSubmit = async (e, navigate) => {
    e.preventDefault();
    setError('');
    try {
      const res = await fetch('http://localhost:5000/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      const data = await res.json();
      if (data.success) {
        setUser(data.user);
        localStorage.setItem('kms_user_session', JSON.stringify(data.user));
        navigate('/dashboard'); 
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError('Koneksi ke server backend gagal. Harap pastikan server backend berjalan.');
    }
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('kms_user_session');
  };

  const handleAddPlatform = async (formData) => {
    await fetch('http://localhost:5000/api/platforms', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'userrole': user.role },
      body: JSON.stringify(formData)
    });
    fetchData();
  };

  const handleAddNote = async (formData) => {
    await fetch('http://localhost:5000/api/kanban', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'userrole': user.role },
      body: JSON.stringify(formData)
    });
    fetchData();
  };

  const handleAddDocument = async (formData) => {
    await fetch('http://localhost:5000/api/knowledge', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'userrole': user.role },
      body: JSON.stringify(formData)
    });
    fetchData();
  };

  const handleUpdateDocument = async (id, formData) => {
    await fetch(`http://localhost:5000/api/knowledge/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'userrole': user.role },
      body: JSON.stringify(formData)
    });
    fetchData();
  };

  const handleDeleteDocument = async (id) => {
    await fetch(`http://localhost:5000/api/knowledge/${id}`, {
      method: 'DELETE',
      headers: { 'userrole': user.role }
    });
    fetchData();
  };

  return (
    <Router>
      <Routes>
        {/* Halaman Login */}
        <Route path="/" element={
          user ? <Navigate to="/dashboard" replace /> : <LoginGatewayWrapper username={username} setUsername={setUsername} password={password} setPassword={setPassword} error={error} onLoginSubmit={handleLoginSubmit} />
        } />

        {/* Halaman Dashboard */}
        <Route path="/dashboard" element={
          user ? (
            <DashboardLayout user={user} onLogout={handleLogout}>
              <PlatformGrid role={user.role} platforms={platforms} onAddPlatform={handleAddPlatform} fetchData={fetchData} />
              <NotesBoard role={user.role} notes={notes} onAddNote={handleAddNote} fetchData={fetchData} />
            </DashboardLayout>
          ) : (
            <Navigate to="/" replace />
          )
        } />

        {/* Halaman Knowledge Base */}
        <Route path="/knowledge" element={
          user ? (
            <KnowledgeBaseWrapper 
              user={user} 
              onLogout={handleLogout} 
              notes={notes} 
            />
          ) : (
            <Navigate to="/" replace />
          )
        } />

        {/* Fallback routing */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

// Wrapper Helper Login
function LoginGatewayWrapper({ username, setUsername, password, setPassword, error, onLoginSubmit }) {
  const navigate = useNavigate();
  return (
    <LoginCard 
      username={username} setUsername={setUsername} 
      password={password} setPassword={setPassword} 
      error={error} 
      onLogin={(e) => onLoginSubmit(e, navigate)} 
    />
  );
}

// Wrapper Helper Halaman Knowledge Base
function KnowledgeBaseWrapper({ user, onLogout, notes }) {
  const navigate = useNavigate();
  return (
    <DashboardLayout user={user} onLogout={onLogout}>
      <KnowledgeBase notes={notes} onBackToDashboard={() => navigate('/dashboard')} />
    </DashboardLayout>
  );
}