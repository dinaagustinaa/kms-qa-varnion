import React, { useState, useEffect } from 'react';
import { Settings as SettingsIcon, ShieldAlert, UserPlus, KeyRound, AlertCircle, CheckCircle2, Users, Trash2 } from 'lucide-react';

/**
 * Komponen Settings
 * Digunakan untuk mengelola konfigurasi keamanan akun dan panel administrasi User.
 * - Tab "Ganti Sandi" dapat diakses oleh semua User.
 * - Tab "Registrasi User Baru" dan "Reset Sandi Akun User" hanya ditampilkan jika User memiliki role 'super_admin'.
 * 
 * Props:
 * - user: object, data User yang sedang aktif (login)
 */
export default function Settings({ user }) {
  // Mengecek apakah User aktif adalah Super Admin
  const isAdmin = user.role === 'super_admin';
  // State untuk mengontrol tab aktif pada menu pengaturan
  const [activeTab, setActiveTab] = useState('change_password'); 

  // State form & status untuk Ganti Password 
  const [passwordForm, setPasswordForm] = useState({ oldPassword: '', newPassword: '', confirmPassword: '' });
  const [passwordStatus, setPasswordStatus] = useState({ success: '', error: '' });

  // State form & status untuk Registrasi User Baru (Khusus Admin)
  const [userForm, setUserForm] = useState({ username: '', password: '', role: 'user_qa', name: '', email: '' });
  const [userStatus, setUserStatus] = useState({ success: '', error: '' });

  // State form & status untuk Reset Password User Lain (Khusus Admin)
  const [resetForm, setResetForm] = useState({ targetUsername: '', newPassword: '', confirmPassword: '' });
  const [resetStatus, setResetStatus] = useState({ success: '', error: '' });

  // State untuk menyimpan daftar semua pengguna
  const [usersList, setUsersList] = useState([]);
  const [listStatus, setListStatus] = useState({ success: '', error: '' });

  // Fungsi untuk memuat data semua pengguna dari backend
  const fetchUsers = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/users');
      if (res.ok) {
        const data = await res.json();
        setUsersList(data);
      } else {
        setListStatus({ success: '', error: 'Gagal memuat daftar pengguna.' });
      }
    } catch (err) {
      setListStatus({ success: '', error: 'Gagal memuat daftar pengguna. Hubungi admin atau periksa server.' });
    }
  };

  // Efek untuk memuat daftar pengguna jika tab aktif adalah 'users_list'
  useEffect(() => {
    if (activeTab === 'users_list') {
      fetchUsers();
    }
  }, [activeTab]);

  // Handler Hapus User (Hanya Admin)
  const handleDeleteUser = async (id, targetUsername) => {
    if (window.confirm(`Apakah Anda yakin ingin menghapus akun user "${targetUsername}"?`)) {
      try {
        const res = await fetch(`http://localhost:5000/api/users/${id}`, {
          method: 'DELETE',
          headers: { 'userrole': user.role }
        });
        const data = await res.json();
        if (res.ok && data.success) {
          setListStatus({ success: `Akun "${targetUsername}" berhasil dihapus.`, error: '' });
          fetchUsers(); // Refresh daftar pengguna
        } else {
          setListStatus({ success: '', error: data.message || 'Gagal menghapus user.' });
        }
      } catch (err) {
        setListStatus({ success: '', error: 'Gagal menghapus user. Cek koneksi server.' });
      }
    }
  };

  // Handler Ganti Password (Semua User)
  const handlePasswordChange = async (e) => {
    e.preventDefault(); // Mencegah reload halaman
    setPasswordStatus({ success: '', error: '' });

    // Validasi kecocokan konfirmasi password
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      return setPasswordStatus({ success: '', error: 'Konfirmasi password baru tidak cocok.' });
    }

    try {
      // Mengirim data password lama & baru ke endpoint API
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
        // Reset isi input form setelah sukses
        setPasswordForm({ oldPassword: '', newPassword: '', confirmPassword: '' });
      } else {
        setPasswordStatus({ success: '', error: data.message });
      }
    } catch (err) {
      setPasswordStatus({ success: '', error: 'Gagal memperbarui password. Cek koneksi server.' });
    }
  };

  // Handler Tambah User QA / Admin Baru (Hanya Super Admin)
  const handleCreateUser = async (e) => {
    e.preventDefault(); // Mencegah reload halaman
    setUserStatus({ success: '', error: '' });

    try {
      // Mengirim payload registrasi ke backend dengan verifikasi header role admin
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
        // Reset isi input form registrasi setelah sukses
        setUserForm({ username: '', password: '', role: 'user_qa', name: '', email: '' });
      } else {
        setUserStatus({ success: '', error: data.message });
      }
    } catch (err) {
      setUserStatus({ success: '', error: 'Gagal mendaftarkan user baru.' });
    }
  };

  // Handler Reset Paksa Password User Lain (Hanya Super Admin)
  const handleResetPassword = async (e) => {
    e.preventDefault(); // Mencegah reload halaman
    setResetStatus({ success: '', error: '' });

    // Validasi kecocokan konfirmasi password baru target
    if (resetForm.newPassword !== resetForm.confirmPassword) {
      return setResetStatus({ success: '', error: 'Konfirmasi password baru tidak cocok.' });
    }

    try {
      // Mengirim request reset ke backend dengan melampirkan header role admin
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
        // Reset isi input form reset setelah sukses
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
      
      {/* 1. Header Pengaturan */}
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

      {/* 2. Grid Menu & Form Konten */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        
        {/* PANEL SEBELAH KIRI: Tab Navigasi Pengaturan */}
        <div className="md:col-span-1 bg-slate-950/40 border border-slate-900 p-4 rounded-2xl flex flex-col space-y-1.5 h-fit">
          <span className="text-[9px] font-black tracking-wider text-slate-500 uppercase px-2 mb-1.5">
            Menu Pengaturan
          </span>
          
          {/* Tombol Tab: Ganti Sandi */}
          <button
            onClick={() => setActiveTab('change_password')}
            className={`w-full text-left px-3 py-2.5 rounded-xl border text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'change_password'
                ? 'bg-cyan-600/10 border-cyan-500/20 text-cyan-400'
                : 'bg-transparent border-transparent text-slate-400 hover:bg-slate-900/60 hover:text-white'
            }`}
          >
            <KeyRound size={14} />
            <span>Ganti Sandi</span>
          </button>

          {/* Menampilkan menu khusus admin jika role = super_admin */}
          {isAdmin && (
            <>
              {/* Tombol Tab: Registrasi User Baru */}
              <button
                onClick={() => setActiveTab('create_user')}
                className={`w-full text-left px-3 py-2.5 rounded-xl border text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                  activeTab === 'create_user'
                    ? 'bg-cyan-600/10 border-cyan-500/20 text-cyan-400'
                    : 'bg-transparent border-transparent text-slate-400 hover:bg-slate-900/60 hover:text-white'
                }`}
              >
                <UserPlus size={14} />
                <span>Registrasi User Baru</span>
              </button>

              {/* Tombol Tab: Reset Sandi Akun User/Lainnya */}
              <button
                onClick={() => setActiveTab('reset_password')}
                className={`w-full text-left px-3 py-2.5 rounded-xl border text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                  activeTab === 'reset_password'
                    ? 'bg-cyan-600/10 border-cyan-500/20 text-cyan-400'
                    : 'bg-transparent border-transparent text-slate-400 hover:bg-slate-900/60 hover:text-white'
                }`}
              >
                <ShieldAlert size={14} />
                <span>Reset Sandi Akun User</span>
              </button>
            </>
          )}

          {/* Tombol Tab: Daftar Pengguna */}
          <button
            onClick={() => setActiveTab('users_list')}
            className={`w-full text-left px-3 py-2.5 rounded-xl border text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'users_list'
                ? 'bg-cyan-600/10 border-cyan-500/20 text-cyan-400'
                : 'bg-transparent border-transparent text-slate-400 hover:bg-slate-900/60 hover:text-white'
            }`}
          >
            <Users size={14} />
            <span>Daftar Pengguna</span>
          </button>
        </div>

        {/* PANEL SEBELAH KANAN: Tempat Rendering Form Berdasarkan Tab Aktif */}
        <div className="md:col-span-3 bg-slate-950/20 border border-slate-900 p-6 rounded-2xl min-h-[350px] flex flex-col justify-between">
          
          {/* TAB 1: FORM GANTI PASSWORD */}
          {activeTab === 'change_password' && (
            <form onSubmit={handlePasswordChange} className="space-y-4">
              <div className="border-b border-slate-900 pb-3 mb-2">
                <h3 className="text-sm font-black text-white uppercase">Ganti Kata Sandi Akun</h3>
                <p className="text-[11px] text-slate-400 mt-0.5">Ubah sandi login Anda secara berkala demi keamanan platform.</p>
              </div>

              {/* Tampilan alert sukses/error */}
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

              {/* Input grid ganti password */}
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

              {/* Aksi submit */}
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

          {/* TAB 2: FORM REGISTRASI USER BARU (ADMIN ONLY) */}
          {activeTab === 'create_user' && isAdmin && (
            <form onSubmit={handleCreateUser} className="space-y-4">
              <div className="border-b border-slate-900 pb-3 mb-2">
                <h3 className="text-sm font-black text-white uppercase">Registrasi Akun Penguji Baru</h3>
                <p className="text-[11px] text-slate-400 mt-0.5">Daftarkan akun QA Engineer atau Super Admin baru ke dalam basis data.</p>
              </div>

              {/* Tampilan alert sukses/error */}
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

              {/* Input grid form registrasi */}
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

              {/* Aksi submit */}
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

          {/* TAB 3: FORM RESET PASSWORD USER LAIN (ADMIN ONLY) */}
          {activeTab === 'reset_password' && isAdmin && (
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div className="border-b border-slate-900 pb-3 mb-2">
                <h3 className="text-sm font-black text-white uppercase">Reset Kata Sandi Penguji</h3>
                <p className="text-[11px] text-slate-400 mt-0.5">Setel ulang paksa password anggota tim QA yang lupa kata sandi.</p>
              </div>

              {/* Tampilan alert sukses/error */}
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

              {/* Input grid form reset password */}
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

              {/* Aksi submit */}
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

          {/* TAB 4: DAFTAR PENGGUNA */}
          {activeTab === 'users_list' && (
            <div className="space-y-4">
              <div className="border-b border-slate-900 pb-3 mb-2 flex justify-between items-center">
                <div>
                  <h3 className="text-sm font-black text-white uppercase">Daftar Semua Pengguna</h3>
                  <p className="text-[11px] text-slate-400 mt-0.5">Melihat semua akun penguji divisi Quality Assurance yang terdaftar.</p>
                </div>
              </div>

              {/* Tampilan alert sukses/error */}
              {listStatus.success && (
                <div className="p-3 bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-xs rounded-xl flex items-center gap-2">
                  <CheckCircle2 size={16} />
                  <span>{listStatus.success}</span>
                </div>
              )}
              {listStatus.error && (
                <div className="p-3 bg-red-500/10 border border-red-500/25 text-red-400 text-xs rounded-xl flex items-center gap-2">
                  <AlertCircle size={16} />
                  <span>{listStatus.error}</span>
                </div>
              )}

              {/* List Pengguna */}
              <div className="space-y-2.5 max-h-[350px] overflow-y-auto pr-1 custom-scrollbar">
                {usersList.map((usr) => (
                  <div key={usr.id} className="p-3.5 bg-slate-950/40 border border-slate-900 hover:border-slate-800 rounded-xl flex items-center justify-between transition-all">
                    <div className="flex items-center gap-3">
                      {/* Avatar Bulat Inisial */}
                      <div className="w-8 h-8 rounded-lg bg-cyan-600/15 border border-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold text-xs uppercase shrink-0">
                        {(usr.name || usr.username).substring(0, 2)}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-200 capitalize truncate">{usr.name || usr.username}</span>
                          <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase ${
                            usr.role === 'super_admin' 
                              ? 'bg-cyan-500/10 text-cyan-400' 
                              : 'bg-slate-800 text-slate-400'
                          }`}>
                            {usr.role === 'super_admin' ? 'Lead QA' : 'QA Engineer'}
                          </span>
                        </div>
                        <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                          @{usr.username} • {usr.email || 'Email belum diatur'}
                        </div>
                      </div>
                    </div>

                    {/* Tombol Hapus (Hanya muncul untuk Admin, dan hanya boleh menghapus user biasa) */}
                    {isAdmin && usr.role !== 'super_admin' && (
                      <button
                        type="button"
                        onClick={() => handleDeleteUser(usr.id, usr.username)}
                        className="text-red-500 hover:text-red-400 hover:bg-red-500/5 p-2 rounded-xl transition-colors cursor-pointer"
                        title="Hapus Akun User"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                ))}

                {usersList.length === 0 && (
                  <p className="text-center text-[11px] text-slate-600 py-8 italic">Tidak ada data pengguna.</p>
                )}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
