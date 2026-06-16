import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { Layers, LogOut, LayoutDashboard, Settings as SettingsIcon, FolderKey } from 'lucide-react';
import LoginCard from './components/LoginCard';
import PlatformGrid from './components/PlatformGrid';
import NotesBoard from './components/NotesBoard';
import Chatbot from './components/Chatbot';
import KnowledgeBase from './components/KnowledgeBase';
import Settings from './components/Settings';
import Profile from './components/Profile';

/**
 * Komponen DashboardLayout
 * Berfungsi sebagai cangkang tata letak (layout wrapper) utama untuk semua halaman setelah login.
 * Menyediakan Sidebar Navigasi di sebelah kiri dan Header/Area Konten Utama di sebelah kanan.
 * 
 * Props:
 * - user: object, data pengguna yang sedang login
 * - onLogout: function, handler untuk keluar dari sesi (Sign Out)
 * - platforms: array, daftar data staging untuk dikirim ke Chatbot
 * - notes: array, daftar catatan QA untuk dikirim ke Chatbot
 * - children: ReactNode, konten halaman spesifik yang akan dirender di area utama
 */
function DashboardLayout({ user, onLogout, platforms = [], notes = [], children }) {
  const location = useLocation();
  const navigate = useNavigate();
  const currentPath = location.pathname;
  
  // Deteksi tab aktif berdasarkan path URL saat ini untuk menyoroti menu sidebar yang sesuai
  const activeTab = currentPath === '/knowledge' 
    ? 'knowledge' 
    : currentPath === '/settings' 
    ? 'settings' 
    : currentPath === '/profile'
    ? 'profile'
    : 'dashboard';

  return (
    <div className="min-h-screen bg-[#070b12] flex font-sans">
      
      {/* 1. SIDEBAR KIRI (Navigasi & Sesi Akun) */}
      <aside className="w-64 border-r border-slate-900 bg-[#090f19] flex flex-col justify-between p-4 sticky top-0 h-screen z-40">
        <div className="space-y-8">
          
          {/* Logo Brand Aplikasi */}
          <div className="flex items-center gap-3 px-2 py-3 border-b border-slate-900">
            <div className="bg-cyan-600/10 p-2 rounded-xl border border-cyan-500/20 text-cyan-400">
              <Layers size={20} />
            </div>
            <div>
              <h1 className="text-sm font-black tracking-wider text-white">VARNION KMS</h1>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Quality Assurance</p>
            </div>
          </div>

          {/* Kumpulan Tautan Menu Utama */}
          <nav className="space-y-1">
            {/* Tombol ke Dashboard */}
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
            
            {/* Tombol ke Knowledge Base */}
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

            {/* Tombol ke Settings */}
            <button 
              onClick={() => navigate('/settings')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold text-left transition-colors cursor-pointer ${
                activeTab === 'settings' 
                  ? 'bg-cyan-600/10 text-cyan-400 border border-cyan-500/10' 
                  : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'
              }`}
            >
              <SettingsIcon size={16} /> <span>Settings</span>
            </button>
          </nav>
        </div>

        {/* Bagian Bawah Sidebar: Info Sesi Penguji Aktif & Aksi Sign Out */}
        <div className="border-t border-slate-900 pt-4 space-y-3">
          
          {/* Card Info User (Dapat diklik untuk menuju ke halaman edit profil) */}
          <div 
            onClick={() => navigate('/profile')}
            className="flex items-center gap-3 p-2 bg-slate-950/60 border border-slate-900 rounded-xl cursor-pointer hover:bg-slate-900/60 hover:border-slate-800 transition-all animate-pulse-subtle"
            title="Lihat Profil"
          >
            {/* Inisial Avatar (Diambil dari 2 huruf depan nama/username) */}
            <div className="w-8 h-8 rounded-lg bg-cyan-600 flex items-center justify-center text-slate-950 font-black text-xs uppercase shrink-0">
              {(user.name || user.username).substring(0, 2)}
            </div>
            <div className="overflow-hidden">
              <h4 className="text-xs font-black text-slate-200 truncate capitalize">{user.name || user.username}</h4>
              <p className="text-[10px] text-cyan-400 font-bold tracking-tight">
                {user.role === 'super_admin' ? 'Lead QA Engineer' : 'QA Engineer'}
              </p>
            </div>
          </div>
          
          {/* Tombol Keluar Sesi */}
          <button 
            onClick={onLogout} 
            className="w-full flex items-center justify-center gap-2 py-2.5 bg-red-950/20 hover:bg-red-950/40 border border-red-900/30 text-red-400 text-xs font-bold rounded-xl transition-all cursor-pointer"
          >
            <LogOut size={14} /> <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* 2. AREA KONTEN UTAMA SEBELAH KANAN */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* Header Atas */}
        <header className="px-8 py-4 bg-[#070b12]/40 backdrop-blur-md border-b border-slate-900 flex justify-between items-center sticky top-0 z-30">
          {/* Breadcrumb navigasi dinamis berdasarkan tab aktif */}
          <div className="text-xs text-slate-500 font-mono">
            QA Operations / <span className="text-slate-300 capitalize">
              {activeTab === 'dashboard' 
                ? 'Dashboard' 
                : activeTab === 'knowledge' 
                ? 'Knowledge Base' 
                : activeTab === 'settings' 
                ? 'Settings' 
                : 'Profile'}
            </span>
          </div>
          
          {/* Status Sinkronisasi Server */}
          <div className="flex items-center gap-2 text-[11px] font-bold text-emerald-400 bg-emerald-500/5 border border-emerald-500/10 px-2.5 py-1 rounded-full">
            <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse"></span> System Live - Synced
          </div>
        </header>

        {/* Main Section untuk merender konten utama */}
        <main className="flex-1 p-8 space-y-12 max-w-6xl w-full mx-auto">
          {children}
        </main>
      </div>

      {/* Komponen Widget Chatbot Asisten QA */}
      <Chatbot user={user} platforms={platforms} notes={notes} />
    </div>
  );
}

// Router Utama Aplikasi KMS QA
export default function App() {
  // State untuk menyimpan data autentikasi user (mengambil dari localStorage jika ada)
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('kms_user_session');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  
  // State form login
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  // State global penampung data dari database
  const [platforms, setPlatforms] = useState([]);
  const [notes, setNotes] = useState([]);
  const [documents, setDocuments] = useState([]);

  // Fungsi utilitas untuk memuat ulang seluruh data dari backend
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

  // Muat data dari server hanya jika user berhasil masuk (login)
  useEffect(() => {
    if (user) fetchData();
  }, [user]);

  // Handler Submit Form Login
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
        setUser(data.user); // Simpan data user ke state
        localStorage.setItem('kms_user_session', JSON.stringify(data.user)); // Simpan data user ke localStorage
        navigate('/dashboard'); // Arahkan ke dashboard
      } else {
        setError(data.message); // Set pesan error dari server
      }
    } catch (err) {
      setError('Koneksi ke server backend gagal. Harap pastikan server backend berjalan.');
    }
  };

  // Handler Aksi Logout
  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('kms_user_session'); // Hapus sesi penyimpanan lokal
  };

  // Handler Tambah Platform Baru
  const handleAddPlatform = async (formData) => {
    await fetch('http://localhost:5000/api/platforms', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'userrole': user.role },
      body: JSON.stringify(formData)
    });
    fetchData(); // Muat ulang data terbaru
  };

  // Handler Tambah Catatan/Notes Baru
  const handleAddNote = async (formData) => {
    await fetch('http://localhost:5000/api/kanban', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'userrole': user.role },
      body: JSON.stringify(formData)
    });
    fetchData(); // Muat ulang data terbaru
  };

  // Handler Tambah Dokumen KB Baru
  const handleAddDocument = async (formData) => {
    await fetch('http://localhost:5000/api/knowledge', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'userrole': user.role },
      body: JSON.stringify(formData)
    });
    fetchData(); // Muat ulang data terbaru
  };

  // Handler Edit/Update Dokumen KB
  const handleUpdateDocument = async (id, formData) => {
    await fetch(`http://localhost:5000/api/knowledge/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'userrole': user.role },
      body: JSON.stringify(formData)
    });
    fetchData(); // Muat ulang data terbaru
  };

  // Handler Hapus Dokumen KB
  const handleDeleteDocument = async (id) => {
    await fetch(`http://localhost:5000/api/knowledge/${id}`, {
      method: 'DELETE',
      headers: { 'userrole': user.role }
    });
    fetchData(); // Muat ulang data terbaru
  };

  return (
    <Router>
      <Routes>
        
        {/* Halaman Login */}
        <Route path="/" element={
          user ? <Navigate to="/dashboard" replace /> : <LoginGatewayWrapper username={username} setUsername={setUsername} password={password} setPassword={setPassword} error={error} onLoginSubmit={handleLoginSubmit} />
        } />

        {/* Halaman Dashboard Utama */}
        <Route path="/dashboard" element={
          user ? (
            <DashboardLayout user={user} onLogout={handleLogout} platforms={platforms} notes={notes}>
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
              platforms={platforms}
              notes={notes} 
            />
          ) : (
            <Navigate to="/" replace />
          )
        } />

        {/* Halaman Settings / Pengaturan */}
        <Route path="/settings" element={
          user ? (
            <SettingsWrapper 
              user={user} 
              onLogout={handleLogout} 
              platforms={platforms}
              notes={notes}
            />
          ) : (
            <Navigate to="/" replace />
          )
        } />

        {/* Halaman Profile Pengguna */}
        <Route path="/profile" element={
          user ? (
            <ProfileWrapper 
              user={user} 
              onLogout={handleLogout} 
              platforms={platforms}
              notes={notes}
              onUpdateSession={(updatedUser) => {
                setUser(updatedUser); // Perbarui state user lokal
                localStorage.setItem('kms_user_session', JSON.stringify(updatedUser)); // Sinkronkan ke sesi localStorage
              }}
            />
          ) : (
            <Navigate to="/" replace />
          )
        } />

        {/* Routing fallback untuk mengarahkan rute tak dikenal ke halaman root */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

// Wrapper Helper Halaman Login
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
function KnowledgeBaseWrapper({ user, onLogout, platforms, notes }) {
  const navigate = useNavigate();
  return (
    <DashboardLayout user={user} onLogout={onLogout} platforms={platforms} notes={notes}>
      <KnowledgeBase notes={notes} onBackToDashboard={() => navigate('/dashboard')} />
    </DashboardLayout>
  );
}

// Wrapper Helper Halaman Settings
function SettingsWrapper({ user, onLogout, platforms, notes }) {
  return (
    <DashboardLayout user={user} onLogout={onLogout} platforms={platforms} notes={notes}>
      <Settings user={user} />
    </DashboardLayout>
  );
}

// Wrapper Helper Halaman Profile
function ProfileWrapper({ user, onLogout, platforms, notes, onUpdateSession }) {
  return (
    <DashboardLayout user={user} onLogout={onLogout} platforms={platforms} notes={notes}>
      <Profile user={user} onUpdateSession={onUpdateSession} />
    </DashboardLayout>
  );
}