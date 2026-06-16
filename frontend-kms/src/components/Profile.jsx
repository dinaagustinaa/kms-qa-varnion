import React, { useState, useEffect } from 'react';
import { User, Mail, Shield, Calendar, CheckCircle2, AlertCircle, Save, Loader2 } from 'lucide-react';

export default function Profile({ user, onUpdateSession }) {
  const [formData, setFormData] = useState({
    name: user.name || '',
    email: user.email || ''
  });
  const [status, setStatus] = useState({ success: '', error: '' });
  const [loading, setLoading] = useState(false);

  // Sync state if user prop changes
  useEffect(() => {
    setFormData({
      name: user.name || '',
      email: user.email || ''
    });
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ success: '', error: '' });
    setLoading(true);

    try {
      const res = await fetch(`http://localhost:5000/api/users/profile/${user.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      setLoading(false);

      if (data.success) {
        setStatus({ success: data.message, error: '' });
        // Update user session di parent component dan localStorage
        if (onUpdateSession) {
          onUpdateSession(data.user);
        }
      } else {
        setStatus({ success: '', error: data.message });
      }
    } catch (err) {
      setLoading(false);
      setStatus({ success: '', error: 'Gagal memperbarui profil. Cek koneksi server.' });
    }
  };

  // Format tanggal gabung
  const formatJoinedDate = (dateStr) => {
    if (!dateStr) return '-';
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      });
    } catch (e) {
      return dateStr;
    }
  };

  const getInitials = (nameStr, usernameStr) => {
    const target = nameStr || usernameStr || 'QA';
    return target.split(' ')
      .map(n => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* HEADER ATAS */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-900 pb-4">
        <div>
          <h2 className="text-lg font-black text-white uppercase flex items-center gap-2.5 tracking-wide">
            <User size={18} className="text-cyan-500" />
            Profil Pengguna
          </h2>
          <p className="text-slate-400 text-xs mt-0.5 font-medium">
            Kelola data diri Anda yang digunakan pada sistem Varnion KMS.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* PANEL KIRI: PREVIEW AVATAR & AKUN */}
        <div className="lg:col-span-1 bg-slate-950/40 border border-slate-900 p-6 rounded-2xl flex flex-col items-center text-center space-y-4">
          <div className="relative group">
            {/* Glow effect */}
            <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-2xl blur opacity-30 group-hover:opacity-50 transition duration-300"></div>
            <div className="relative w-24 h-24 rounded-2xl bg-[#090f19] border border-slate-800 flex items-center justify-center text-cyan-400 text-3xl font-black shadow-inner">
              {getInitials(formData.name, user.username)}
            </div>
          </div>

          <div className="space-y-1">
            <h3 className="text-sm font-black text-white capitalize">{formData.name || user.username}</h3>
            <p className="text-xs text-slate-500 font-mono">@{user.username}</p>
          </div>

          <div className="w-full pt-4 border-t border-slate-900 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500 font-semibold">Status Role:</span>
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase border ${
                user.role === 'super_admin'
                  ? 'bg-cyan-500/5 text-cyan-400 border-cyan-500/20'
                  : 'bg-slate-900 text-slate-400 border-slate-800'
              }`}>
                {user.role === 'super_admin' ? 'Lead QA' : 'QA Engineer'}
              </span>
            </div>

            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500 font-semibold flex items-center gap-1">
                <Calendar size={12} /> Terdaftar:
              </span>
              <span className="text-slate-300 font-mono">
                {formatJoinedDate(user.created_at)}
              </span>
            </div>
          </div>
        </div>

        {/* PANEL KANAN: FORM EDIT PROFIL */}
        <div className="lg:col-span-2 bg-slate-950/20 border border-slate-900 p-6 rounded-2xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="border-b border-slate-900 pb-3 mb-2">
              <h3 className="text-sm font-black text-white uppercase">Ubah Informasi Profil</h3>
              <p className="text-[11px] text-slate-400 mt-0.5">Username dan hak akses bersifat permanen, hanya nama dan email yang dapat diubah.</p>
            </div>

            {status.success && (
              <div className="p-3 bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-xs rounded-xl flex items-center gap-2">
                <CheckCircle2 size={16} className="shrink-0" />
                <span>{status.success}</span>
              </div>
            )}

            {status.error && (
              <div className="p-3 bg-red-500/10 border border-red-500/25 text-red-400 text-xs rounded-xl flex items-center gap-2">
                <AlertCircle size={16} className="shrink-0" />
                <span>{status.error}</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-slate-400 text-[10px] font-bold uppercase mb-1.5 flex items-center gap-1.5">
                  <User size={12} className="text-slate-500" /> Username
                </label>
                <input
                  type="text"
                  disabled
                  value={user.username}
                  className="w-full px-3.5 py-2.5 bg-slate-950/60 border border-slate-900 rounded-xl text-xs text-slate-500 cursor-not-allowed font-mono"
                  title="Username tidak dapat diubah"
                />
              </div>

              <div>
                <label className="block text-slate-400 text-[10px] font-bold uppercase mb-1.5 flex items-center gap-1.5">
                  <Shield size={12} className="text-slate-500" /> Akses Role
                </label>
                <input
                  type="text"
                  disabled
                  value={user.role === 'super_admin' ? 'Lead QA (Super Admin)' : 'QA Engineer'}
                  className="w-full px-3.5 py-2.5 bg-slate-950/60 border border-slate-900 rounded-xl text-xs text-slate-500 cursor-not-allowed"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-slate-400 text-[10px] font-bold uppercase mb-1.5 flex items-center gap-1.5">
                  Nama Lengkap
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-850 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-500 placeholder-slate-600 transition-colors"
                  placeholder="Masukkan nama lengkap Anda"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-slate-400 text-[10px] font-bold uppercase mb-1.5 flex items-center gap-1.5">
                  <Mail size={12} className="text-slate-500" /> Email Address
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-850 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-500 placeholder-slate-600 transition-colors"
                  placeholder="name@example.com"
                />
              </div>
            </div>

            <div className="pt-4 flex justify-end border-t border-slate-900/60">
              <button
                type="submit"
                disabled={loading}
                className="px-5 py-2.5 bg-cyan-600 hover:bg-cyan-500 disabled:bg-cyan-800 disabled:text-slate-500 text-slate-950 font-bold text-xs rounded-xl active:scale-95 transition-all cursor-pointer shadow-lg shadow-cyan-600/10 flex items-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    <span>Menyimpan...</span>
                  </>
                ) : (
                  <>
                    <Save size={14} />
                    <span>Simpan Perubahan</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
