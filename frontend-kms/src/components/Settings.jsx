import React, { useState } from 'react';
import { Settings as SettingsIcon, ShieldAlert, UserPlus, KeyRound, AlertCircle, CheckCircle2 } from 'lucide-react';

export default function Settings({ user }) {
  const isAdmin = user.role === 'super_admin';
  const [activeTab, setActiveTab] = useState('change_password'); // 'change_password', 'create_user', 'reset_password'

  // State untuk Ganti Password Mandiri
  const [passwordForm, setPasswordForm] = useState({ oldPassword: '', newPassword: '', confirmPassword: '' });
  const [passwordStatus, setPasswordStatus] = useState({ success: '', error: '' });

  // State untuk Pusat Kendali Pengguna (Admin)
  const [userForm, setUserForm] = useState({ username: '', password: '', role: 'user_qa', name: '', email: '' });
  const [userStatus, setUserStatus] = useState({ success: '', error: '' });

  // State untuk Reset Password Orang Lain (Admin)
  const [resetForm, setResetForm] = useState({ targetUsername: '', newPassword: '', confirmPassword: '' });
  const [resetStatus, setResetStatus] = useState({ success: '', error: '' });

  // Handler Ganti Password Mandiri
  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setPasswordStatus({ success: '', error: '' });

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      return setPasswordStatus({ success: '', error: 'Konfirmasi password baru tidak cocok.' });
    }

    try {
      const res = await fetch('http://localhost:5000/api/users/change-password', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: user.username,
          oldPassword: passwordForm.oldPassword,
          newPassword: passwordForm.newPassword
        })
      });
      const data = await res.json();
      if (data.success) {
        setPasswordStatus({ success: data.message, error: '' });
        setPasswordForm({ oldPassword: '', newPassword: '', confirmPassword: '' });
      } else {
        setPasswordStatus({ success: '', error: data.message });
      }
    } catch (err) {
      setPasswordStatus({ success: '', error: 'Gagal memperbarui password. Cek koneksi server.' });
    }
  };

  // Handler Tambah User QA Baru (Admin)
  const handleCreateUser = async (e) => {
    e.preventDefault();
    setUserStatus({ success: '', error: '' });

    try {
      const res = await fetch('http://localhost:5000/api/users', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'userrole': user.role
        },
        body: JSON.stringify(userForm)
      });
      const data = await res.json();
      if (data.success) {
        setUserStatus({ success: data.message, error: '' });
        setUserForm({ username: '', password: '', role: 'user_qa', name: '', email: '' });
      } else {
        setUserStatus({ success: '', error: data.message });
      }
    } catch (err) {
      setUserStatus({ success: '', error: 'Gagal mendaftarkan user baru.' });
    }
  };

  // Handler Reset Password Pengguna Lain (Admin)
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setResetStatus({ success: '', error: '' });

    if (resetForm.newPassword !== resetForm.confirmPassword) {
      return setResetStatus({ success: '', error: 'Konfirmasi password baru tidak cocok.' });
    }

    try {
      const res = await fetch('http://localhost:5000/api/users/reset-password', {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'userrole': user.role
        },
        body: JSON.stringify({
          targetUsername: resetForm.targetUsername,
          newPassword: resetForm.newPassword
        })
      });
      const data = await res.json();
      if (data.success) {
        setResetStatus({ success: data.message, error: '' });
        setResetForm({ targetUsername: '', newPassword: '', confirmPassword: '' });
      } else {
        setResetStatus({ success: '', error: data.message });
      }
    } catch (err) {
      setResetStatus({ success: '', error: 'Gagal mereset password.' });
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* HEADER ATAS SETTINGS */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-900 pb-4">
        <div>
          <h2 className="text-lg font-black text-white uppercase flex items-center gap-2.5 tracking-wide">
            <SettingsIcon size={18} className="text-cyan-500" />
            Pengaturan Sistem & Keamanan
          </h2>
          <p className="text-slate-400 text-xs mt-0.5 font-medium">
            Kelola kata sandi akun Anda dan administrasi penguji divisi Quality Assurance.
          </p>
        </div>
      </div>

      {/* LAYOUT UTAMA SETTINGS */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        
        {/* PANEL SEBELAH KIRI: NAVIGATION TABS (Hanya tampil penuh jika Admin) */}
        <div className="md:col-span-1 bg-slate-950/40 border border-slate-900 p-4 rounded-2xl flex flex-col space-y-1.5 h-fit">
          <span className="text-[9px] font-black tracking-wider text-slate-500 uppercase px-2 mb-1.5">
            Menu Pengaturan
          </span>
          
          <button
            onClick={() => setActiveTab('change_password')}
            className={`w-full text-left px-3 py-2.5 rounded-xl border text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'change_password'
                ? 'bg-cyan-600/10 border-cyan-500/20 text-cyan-400'
                : 'bg-transparent border-transparent text-slate-400 hover:bg-slate-900/60 hover:text-white'
            }`}
          >
            <KeyRound size={14} />
            <span>Ganti Sandi Mandiri</span>
          </button>

          {isAdmin && (
            <>
              <button
                onClick={() => setActiveTab('create_user')}
                className={`w-full text-left px-3 py-2.5 rounded-xl border text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                  activeTab === 'create_user'
                    ? 'bg-cyan-600/10 border-cyan-500/20 text-cyan-400'
                    : 'bg-transparent border-transparent text-slate-400 hover:bg-slate-900/60 hover:text-white'
                }`}
              >
                <UserPlus size={14} />
                <span>Pusat Kendali User</span>
              </button>

              <button
                onClick={() => setActiveTab('reset_password')}
                className={`w-full text-left px-3 py-2.5 rounded-xl border text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                  activeTab === 'reset_password'
                    ? 'bg-cyan-600/10 border-cyan-500/20 text-cyan-400'
                    : 'bg-transparent border-transparent text-slate-400 hover:bg-slate-900/60 hover:text-white'
                }`}
              >
                <ShieldAlert size={14} />
                <span>Reset Sandi Massal</span>
              </button>
            </>
          )}
        </div>

        {/* PANEL SEBELAH KANAN: FORM KONTEN AKTIF */}
        <div className="md:col-span-3 bg-slate-950/20 border border-slate-900 p-6 rounded-2xl min-h-[350px] flex flex-col justify-between">
          
          {/* TAB 1: GANTI PASSWORD MANDIRI */}
          {activeTab === 'change_password' && (
            <form onSubmit={handlePasswordChange} className="space-y-4">
              <div className="border-b border-slate-900 pb-3 mb-2">
                <h3 className="text-sm font-black text-white uppercase">Ganti Kata Sandi Akun</h3>
                <p className="text-[11px] text-slate-400 mt-0.5">Ubah sandi login Anda secara berkala demi keamanan platform.</p>
              </div>

              {passwordStatus.success && (
                <div className="p-3 bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-xs rounded-xl flex items-center gap-2">
                  <CheckCircle2 size={16} />
                  <span>{passwordStatus.success}</span>
                </div>
              )}

              {passwordStatus.error && (
                <div className="p-3 bg-red-500/10 border border-red-500/25 text-red-400 text-xs rounded-xl flex items-center gap-2">
                  <AlertCircle size={16} />
                  <span>{passwordStatus.error}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-slate-400 text-[10px] font-bold uppercase mb-1.5">Kata Sandi Lama</label>
                  <input
                    type="password"
                    required
                    value={passwordForm.oldPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, oldPassword: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-850 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-500 placeholder-slate-600 transition-colors"
                    placeholder="Masukkan sandi lama Anda"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 text-[10px] font-bold uppercase mb-1.5">Kata Sandi Baru</label>
                  <input
                    type="password"
                    required
                    value={passwordForm.newPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-850 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-500 placeholder-slate-600 transition-colors"
                    placeholder="Sandi baru minimal 6 karakter"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 text-[10px] font-bold uppercase mb-1.5">Konfirmasi Kata Sandi Baru</label>
                  <input
                    type="password"
                    required
                    value={passwordForm.confirmPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-850 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-500 placeholder-slate-600 transition-colors"
                    placeholder="Ulangi sandi baru"
                  />
                </div>
              </div>

              <div className="pt-4 flex justify-end">
                <button
                  type="submit"
                  className="px-5 py-2 bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold text-xs rounded-xl active:scale-95 transition-all cursor-pointer shadow-lg shadow-cyan-600/10"
                >
                  Perbarui Kata Sandi
                </button>
              </div>
            </form>
          )}

          {/* TAB 2: PUSAT KENDALI USER (ADMIN ONLY) */}
          {activeTab === 'create_user' && isAdmin && (
            <form onSubmit={handleCreateUser} className="space-y-4">
              <div className="border-b border-slate-900 pb-3 mb-2">
                <h3 className="text-sm font-black text-white uppercase">Registrasi Akun Penguji Baru</h3>
                <p className="text-[11px] text-slate-400 mt-0.5">Daftarkan akun QA Engineer atau Super Admin baru ke dalam basis data.</p>
              </div>

              {userStatus.success && (
                <div className="p-3 bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-xs rounded-xl flex items-center gap-2">
                  <CheckCircle2 size={16} />
                  <span>{userStatus.success}</span>
                </div>
              )}

              {userStatus.error && (
                <div className="p-3 bg-red-500/10 border border-red-500/25 text-red-400 text-xs rounded-xl flex items-center gap-2">
                  <AlertCircle size={16} />
                  <span>{userStatus.error}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-400 text-[10px] font-bold uppercase mb-1.5">Nama Lengkap</label>
                  <input
                    type="text"
                    required
                    value={userForm.name}
                    onChange={(e) => setUserForm({ ...userForm, name: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-850 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-500 placeholder-slate-600 transition-colors"
                    placeholder="Contoh: Dina Agustina"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 text-[10px] font-bold uppercase mb-1.5">Email</label>
                  <input
                    type="email"
                    required
                    value={userForm.email}
                    onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-850 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-500 placeholder-slate-600 transition-colors"
                    placeholder="dina@varnion.com"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 text-[10px] font-bold uppercase mb-1.5">Username Penguji</label>
                  <input
                    type="text"
                    required
                    value={userForm.username}
                    onChange={(e) => setUserForm({ ...userForm, username: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-850 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-500 placeholder-slate-600 transition-colors"
                    placeholder="Contoh: dina_qa"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 text-[10px] font-bold uppercase mb-1.5">Akses Role Akun</label>
                  <select
                    value={userForm.role}
                    onChange={(e) => setUserForm({ ...userForm, role: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-850 rounded-xl text-xs text-slate-300 focus:outline-none focus:border-cyan-500 cursor-pointer"
                  >
                    <option value="user_qa">QA Engineer (User Biasa)</option>
                    <option value="super_admin">Lead QA (Super Admin)</option>
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-slate-400 text-[10px] font-bold uppercase mb-1.5">Kata Sandi Awal</label>
                  <input
                    type="password"
                    required
                    value={userForm.password}
                    onChange={(e) => setUserForm({ ...userForm, password: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-850 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-500 placeholder-slate-600 transition-colors"
                    placeholder="Masukkan sandi default akun"
                  />
                </div>
              </div>

              <div className="pt-4 flex justify-end">
                <button
                  type="submit"
                  className="px-5 py-2 bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold text-xs rounded-xl active:scale-95 transition-all cursor-pointer shadow-lg shadow-cyan-600/10"
                >
                  Daftarkan Akun Baru
                </button>
              </div>
            </form>
          )}

          {/* TAB 3: RESET PASSWORD ORANG LAIN (ADMIN ONLY) */}
          {activeTab === 'reset_password' && isAdmin && (
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div className="border-b border-slate-900 pb-3 mb-2">
                <h3 className="text-sm font-black text-white uppercase">Reset Kata Sandi Penguji</h3>
                <p className="text-[11px] text-slate-400 mt-0.5">Setel ulang paksa password anggota tim QA yang lupa kata sandi.</p>
              </div>

              {resetStatus.success && (
                <div className="p-3 bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-xs rounded-xl flex items-center gap-2">
                  <CheckCircle2 size={16} />
                  <span>{resetStatus.success}</span>
                </div>
              )}

              {resetStatus.error && (
                <div className="p-3 bg-red-500/10 border border-red-500/25 text-red-400 text-xs rounded-xl flex items-center gap-2">
                  <AlertCircle size={16} />
                  <span>{resetStatus.error}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-slate-400 text-[10px] font-bold uppercase mb-1.5">Username Target</label>
                  <input
                    type="text"
                    required
                    value={resetForm.targetUsername}
                    onChange={(e) => setResetForm({ ...resetForm, targetUsername: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-850 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-500 placeholder-slate-600 transition-colors"
                    placeholder="Masukkan username akun yang ingin direset"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 text-[10px] font-bold uppercase mb-1.5">Kata Sandi Baru Target</label>
                  <input
                    type="password"
                    required
                    value={resetForm.newPassword}
                    onChange={(e) => setResetForm({ ...resetForm, newPassword: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-850 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-500 placeholder-slate-600 transition-colors"
                    placeholder="Sandi baru target minimal 6 karakter"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 text-[10px] font-bold uppercase mb-1.5">Ulangi Kata Sandi Baru Target</label>
                  <input
                    type="password"
                    required
                    value={resetForm.confirmPassword}
                    onChange={(e) => setResetForm({ ...resetForm, confirmPassword: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-850 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-500 placeholder-slate-600 transition-colors"
                    placeholder="Ulangi sandi baru target"
                  />
                </div>
              </div>

              <div className="pt-4 flex justify-end">
                <button
                  type="submit"
                  className="px-5 py-2 bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold text-xs rounded-xl active:scale-95 transition-all cursor-pointer shadow-lg shadow-cyan-600/10"
                >
                  Reset Kata Sandi Target
                </button>
              </div>
            </form>
          )}

        </div>
      </div>
    </div>
  );
}
