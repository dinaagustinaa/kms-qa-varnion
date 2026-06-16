import React from 'react';
import { ShieldCheck, User, Lock, AlertCircle } from 'lucide-react';

/**
 * Komponen LoginCard
 * Digunakan untuk menampilkan halaman login sistem KMS QA dengan desain glassmorphism.
 * 
 * Props:
 * - username: string, state untuk username
 * - setUsername: function, handler untuk mengubah state username
 * - password: string, state untuk password
 * - setPassword: function, handler untuk mengubah state password
 * - error: string, pesan error jika login gagal
 * - onLogin: function, handler submit form untuk memproses autentikasi ke backend
 */
export default function LoginCard({ 
  username, setUsername, password, setPassword, error, onLogin 
}) {
  return (
    // Container utama setinggi layar penuh dengan latar belakang gelap
    <div className="min-h-screen flex items-center justify-center bg-[#090f19] px-4 relative overflow-hidden">
      
      {/* Ornamen dekoratif lingkaran blur untuk efek kedalaman visual */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl"></div>
      
      {/* Box Kartu Login dengan efek Glassmorphism */}
      <div className="w-full max-w-md p-8 rounded-2xl glass-card relative z-10">
        
        {/* Bagian Header Kartu: Logo dan Judul Sistem */}
        <div className="text-center mb-8">
          <div className="inline-flex p-3 bg-cyan-500/10 rounded-xl text-cyan-400 mb-3 border border-cyan-500/20">
            <ShieldCheck size={32} />
          </div>
          <h2 className="text-2xl font-black tracking-tight text-white">VARNION KMS QA</h2>
          <p className="text-slate-400 text-xs mt-1">Knowledge Management System</p>
        </div>

        {/* Menampilkan pesan error jika terjadi kegagalan autentikasi */}
        {error && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 text-red-400 text-xs rounded-xl flex items-center gap-2">
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        {/* Form Input Autentikasi */}
        <form onSubmit={onLogin} className="space-y-4">
          
          {/* Input Field: Username */}
          <div>
            <label className="block text-slate-400 text-xs font-semibold mb-1.5 uppercase">Username</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-500">
                <User size={16} />
              </span>
              <input 
                type="text" 
                required 
                value={username} 
                onChange={(e) => setUsername(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-880 rounded-xl text-sm text-white focus:outline-none focus:border-cyan-500 placeholder-slate-650"
                placeholder="admin_varnion / user_varnion"
              />
            </div>
          </div>

          {/* Input Field: Kata Sandi */}
          <div>
            <label className="block text-slate-400 text-xs font-semibold mb-1.5 uppercase">Kata Sandi</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-500">
                <Lock size={16} />
              </span>
              <input 
                type="password" 
                required 
                value={password} 
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-cyan-500 placeholder-slate-650"
                placeholder="••••••••"
              />
            </div>
          </div>

          {/* Tombol Submit Login */}
          <button 
            type="submit" 
            className="w-full py-2.5 bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold rounded-xl text-sm tracking-wide transition-all mt-2 cursor-pointer active:scale-[0.98]"
          >
            Login
          </button>
        </form>
      </div>
    </div>
  );
}