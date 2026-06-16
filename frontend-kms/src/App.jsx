import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { Layers, LogOut, LayoutDashboard, Settings, User, FolderKey } from 'lucide-react';
import LoginCard from './components/LoginCard';
import PlatformGrid from './components/PlatformGrid';
import Notes from './components/Notes'; // Komponen baru "Panduan Quality Assurance"
import Chatbot from './components/Chatbot';

// =========================================================
// COMPONENT PANEL UTAMA INTEGRASI SIDEBAR PREMIUM FIGMA
// =========================================================
function DashboardLayout({ user, onLogout, platforms, notes, onAddPlatform, onAddNote }) {
  return (
    <div className="min-h-screen bg-[#070b12] flex font-sans">
      
      {/* 1. SIDEBAR KIRI (SINKRONISASI TAMPILAN FIGMA KAMU) */}
      <aside className="w-64 border-r border-slate-900 bg-[#090f19] flex flex-col justify-between p-4 sticky top-0 h-screen z-40">
        <div className="space-y-8">
          {/* Logo Brand Internal */}
          <div className="flex items-center gap-3 px-2 py-3 border-b border-slate-900">
            <div className="bg-cyan-600/10 p-2 rounded-xl border border-cyan-500/20 text-cyan-400">
              <Layers size={20} />
            </div>
            <div>
              <h1 className="text-sm font-black tracking-wider text-white">VARNION KMS</h1>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Quality Assurance</p>
            </div>
          </div>

          {/* List Tombol Navigasi Menu */}
          <nav className="space-y-1">
            <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold bg-cyan-600/10 text-cyan-400 border border-cyan-500/10 text-left">
              <LayoutDashboard size={16} /> <span>Dashboard</span>
            </button>
            <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold text-slate-400 hover:bg-slate-900 hover:text-slate-200 transition-colors text-left cursor-not-allowed opacity-40">
              <FolderKey size={16} /> <span>Knowledge Base</span>
            </button>
            <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold text-slate-400 hover:bg-slate-900 hover:text-slate-200 transition-colors text-left cursor-not-allowed opacity-40">
              <Settings size={16} /> <span>Settings</span>
            </button>
          </nav>
        </div>

        {/* Info Sesi Login Penguji di Bagian Bawah Sidebar */}
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
          
          <button onClick={onLogout} className="w-full flex items-center justify-center gap-2 py-2.5 bg-red-950/20 hover:bg-red-950/40 border border-red-900/30 text-red-400 text-xs font-bold rounded-xl active:scale-[0.98] transition-all cursor-pointer">
            <LogOut size={14} /> <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* 2. AREA KONTEN UTAMA SEBELAH KANAN */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Topbar Ringkas */}
        <header className="px-8 py-4 bg-[#070b12]/40 backdrop-blur-md border-b border-slate-900 flex justify-between items-center sticky top-0 z-30">
          <div className="text-xs text-slate-500 font-mono">QA Operations / <span className="text-slate-300">Dashboard</span></div>
          <div className="flex items-center gap-2 text-[11px] font-bold text-emerald-400 bg-emerald-500/5 border border-emerald-500/10 px-2.5 py-1 rounded-full">
            <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse"></span> System Live - Synced
          </div>
        </header>

        {/* Grid Platform + Notes */}
        <main className="flex-1 p-8 space-y-12 max-w-6xl w-full mx-auto">
          <PlatformGrid role={user.role} platforms={platforms} onAddPlatform={onAddPlatform} />
          <Notes role={user.role} notes={notes} onAddNote={onAddNote} />
        </main>
      </div>

      {/* Widget Bantuan Chatbot */}
      <Chatbot />
    </div>
  );
}

// =========================================================
// MAESTRO ROOT ROUTER UTAMA (ROUTING HANDLER)
// =========================================================
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

  const fetchData = async () => {
    try {
      const resPlat = await fetch('http://localhost:5000/api/platforms');
      setPlatforms(await resPlat.json());

      const resNotes = await fetch('http://localhost:5000/api/kanban');
      setNotes(await resNotes.json());
    } catch (err) {
      console.error("Gagal memuat data dari XAMPP:", err);
    }
  };

  useEffect(() => {
    if (user) fetchData();
  }, [user]);

  // Logika Login Gateway (Otomatis lompat rute ke /dashboard jika sukses)
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
        setUser(data.success ? data.user : null);
        localStorage.setItem('kms_user_session', JSON.stringify(data.user));
        navigate('/dashboard'); // ✨ URL BERUBAH KEREN DI SINI!
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError('Server Backend mati. Nyalakan dengan perintah "node server.js"!');
    }
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

  return (
    <Router>
      <Routes>
        {/* RUTE GERBANG DEPAN: / */}
        <Route path="/" element={
          user ? <Navigate to="/dashboard" replace /> : <LoginGatewayWrapper username={username} setUsername={setUsername} password={password} setPassword={setPassword} error={error} onLoginSubmit={handleLoginSubmit} />
        } />

        {/* RUTE DALEM AMAN: /dashboard (URL Berubah Sesuai Maumu!) */}
        <Route path="/dashboard" element={
          user ? (
            <DashboardLayout 
              user={user} 
              onLogout={() => { setUser(null); localStorage.removeItem('kms_user_session'); }} 
              platforms={platforms} 
              notes={notes} 
              onAddPlatform={handleAddPlatform} 
              onAddNote={handleAddNote} 
            />
          ) : (
            <Navigate to="/" replace />
          )
        } />

        {/* Jika ketik asal-asalan, lempar ke depan */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

// Wrapper Pembantu untuk memicu fungsi hook useNavigate di halaman login
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