import React, { useState } from 'react';
import { BookOpen, Plus, Eye, FileText, Edit2, Trash2, Save, X } from 'lucide-react';

/**
 * Komponen KanbanBoard / NotesBoard
 * Menampilkan dan mengelola kumpulan dokumen catatan panduan Quality Assurance.
 * - QA biasa hanya bisa melihat dan membaca detail dokumen.
 * - Super Admin (Lead QA) memiliki akses penuh untuk Tambah, Ubah (Edit), dan Hapus data.
 */
export default function KanbanBoard({ role, notes, onAddNote, fetchData }) {
  // State untuk mengontrol pembukaan modal tambah panduan baru
  const [isOpenForm, setIsOpenForm] = useState(false);
  // State penampung dokumen yang dipilih untuk ditampilkan secara detail
  const [selectedNote, setSelectedNote] = useState(null);
  // State penanda apakah admin sedang melakukan edit isi dokumen di modal detail
  const [isEditing, setIsEditing] = useState(false);
  
  // State penampung form pembuatan panduan baru
  const [form, setForm] = useState({ title: '', content: '' });
  // State penampung form pengeditan data terpilih
  const [editForm, setEditForm] = useState({ title: '', content: '' });

  // Handler Hapus Dokumen Panduan (Hanya diizinkan jika role = super_admin)
  const handleDelete = async (id) => {
    if (window.confirm("Apakah Anda yakin ingin menghapus dokumen panduan QA ini?")) {
      try {
        const res = await fetch(`http://localhost:5000/api/kanban/${id}`, {
          method: 'DELETE',
          headers: { 'userrole': role }
        });
        if (res.ok) {
          setSelectedNote(null); // Tutup modal detail setelah hapus sukses
          fetchData(); // Muat ulang data terbaru dari backend
        }
      } catch (err) {
        alert("Gagal menghapus panduan.");
      }
    }
  };

  // Handler Update/Edit Dokumen Panduan (Hanya diizinkan jika role = super_admin)
  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`http://localhost:5000/api/kanban/${selectedNote.id}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'userrole': role
        },
        body: JSON.stringify(editForm)
      });
      if (res.ok) {
        setIsEditing(false); // Keluar dari mode edit setelah sukses
        setSelectedNote({ ...selectedNote, ...editForm }); // Perbarui data modal aktif di frontend
        fetchData(); // Muat ulang data terbaru dari backend
      }
    } catch (err) {
      alert("Gagal memperbarui panduan.");
    }
  };

  return (
    <section className="space-y-4">
      
      {/* 1. Header Board Panduan */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-900 pb-4">
        <div>
          <h2 className="text-lg font-black text-white uppercase flex items-center gap-2 tracking-wide">
            <BookOpen size={18} className="text-cyan-500" /> Panduan Quality Assurance
          </h2>
          <p className="text-slate-400 text-xs mt-0.5">Dokumentasi aturan bisnis, skenario acuan, dan memo teknis pengujian aplikasi.</p>
        </div>
        {/* Tampilkan tombol "Tambah Panduan" khusus untuk Admin */}
        {role === 'super_admin' && (
          <button 
            onClick={() => setIsOpenForm(true)} 
            className="flex items-center gap-1 bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold text-xs px-3 py-1.5 rounded-xl transition-all cursor-pointer"
          >
            <Plus size={14} /> <span>Tambah Panduan</span>
          </button>
        )}
      </div>

      {/* 2. Grid Menampilkan Catatan (Notes) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
        {notes.map((note) => (
          <div key={note.id} className="glass-card p-5 rounded-2xl flex flex-col justify-between h-64 relative group border border-slate-900">
            <div className="space-y-2.5 overflow-hidden">
              <div className="text-cyan-500/40 group-hover:text-cyan-400 transition-colors">
                <FileText size={18} />
              </div>
              <h3 className="text-xs font-extrabold text-slate-200 group-hover:text-white line-clamp-2 leading-snug">
                {note.title}
              </h3>
              <p className="text-[11px] text-slate-400 line-clamp-4 leading-relaxed whitespace-pre-line">
                {note.content}
              </p>
            </div>
            
            {/* Aksi Buka Detail Kartu */}
            <div className="flex justify-end pt-3 border-t border-slate-900/60 mt-2">
              <button 
                onClick={() => { setSelectedNote(note); setEditForm(note); setIsEditing(false); }} 
                className="p-1.5 bg-slate-950 hover:bg-cyan-950/40 border border-slate-850 hover:border-cyan-600/30 text-slate-500 hover:text-cyan-400 rounded-lg transition-all cursor-pointer"
              >
                <Eye size={14} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* 3. Modal Detail Note (Ditampilkan ketika selectedNote terisi) */}
      {selectedNote && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="w-full max-w-lg bg-[#0b111e] border border-slate-800 p-6 rounded-2xl space-y-4 shadow-2xl relative">
            
            {/* Tombol hapus cepat (Trash) khusus untuk Admin dan jika tidak sedang mode edit */}
            {role === 'super_admin' && !isEditing && (
              <button 
                onClick={() => handleDelete(selectedNote.id)}
                className="absolute top-6 right-14 text-red-500 hover:text-red-400 p-1.5 hover:bg-red-500/5 rounded-lg cursor-pointer"
                title="Hapus Panduan"
              >
                <Trash2 size={16} />
              </button>
            )}

            {/* Render form edit jika isEditing = true (Khusus Admin) */}
            {isEditing ? (
              <form onSubmit={handleUpdate} className="space-y-4">
                <h3 className="text-sm font-black text-white uppercase border-b border-slate-850 pb-2">Edit Dokumen Panduan</h3>
                <input 
                  type="text" 
                  required 
                  value={editForm.title} 
                  onChange={(e) => setEditForm({...editForm, title: e.target.value})} 
                  className="w-full p-2 bg-slate-950 border border-slate-850 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-500" 
                  placeholder="Judul Panduan"
                />
                <textarea 
                  rows={6} 
                  required 
                  value={editForm.content} 
                  onChange={(e) => setEditForm({...editForm, content: e.target.value})} 
                  className="w-full p-2 bg-slate-950 border border-slate-850 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-500 resize-none" 
                  placeholder="Isi Konten Panduan..."
                />
                
                {/* Aksi simpan / batalkan edit */}
                <div className="flex justify-end gap-2 pt-2 border-t border-slate-850">
                  <button 
                    type="button" 
                    onClick={() => setIsEditing(false)} 
                    className="px-3 py-1.5 bg-slate-900 text-[11px] font-bold text-slate-300 rounded-xl flex items-center gap-1"
                  >
                    <X size={12}/> Batal
                  </button>
                  <button 
                    type="submit" 
                    className="px-4 py-1.5 bg-cyan-600 text-slate-950 text-[11px] font-bold rounded-xl flex items-center gap-1"
                  >
                    <Save size={12}/> Simpan
                  </button>
                </div>
              </form>
            ) : (
              // Mode pembacaan (default)
              <>
                <div className="flex items-center gap-2 border-b border-slate-850 pb-3">
                  <div className="text-cyan-400"><FileText size={16} /></div>
                  <h3 className="text-sm font-black text-white leading-tight">{selectedNote.title}</h3>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Isi Dokumen Panduan:</p>
                  <div className="bg-slate-950 border border-slate-850 p-4 rounded-xl text-xs text-slate-300 leading-relaxed whitespace-pre-line max-h-60 overflow-y-auto font-sans">
                    {selectedNote.content}
                  </div>
                </div>
                
                {/* Aksi footer modal */}
                <div className="pt-2 border-t border-slate-850 flex justify-between items-center">
                  {role === 'super_admin' ? (
                    <button 
                      onClick={() => setIsEditing(true)} 
                      className="px-3 py-1.5 bg-slate-950 hover:bg-cyan-950/20 border border-slate-850 hover:border-cyan-600/30 text-xs font-bold text-cyan-400 rounded-xl flex items-center gap-1 cursor-pointer"
                    >
                      <Edit2 size={12}/> Edit Data
                    </button>
                  ) : <div/>}
                  <button 
                    onClick={() => setSelectedNote(null)} 
                    className="px-4 py-1.5 bg-slate-900 text-xs font-bold text-slate-300 rounded-xl border border-slate-800 cursor-pointer"
                  >
                    Tutup
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* 4. Modal Tambah Panduan Baru (Hanya untuk Admin) */}
      {isOpenForm && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <form 
            onSubmit={(e) => { 
              e.preventDefault(); 
              onAddNote({ ...form, category: 'todo' }); 
              setIsOpenForm(false); 
              setForm({ title: '', content: '' }); 
            }} 
            className="w-full max-w-md bg-[#0b111e] border border-slate-800 p-6 rounded-2xl space-y-4"
          >
            <h3 className="text-sm font-black text-white uppercase border-b border-slate-850 pb-2">Tambah Panduan Baru</h3>
            <input 
              type="text" 
              placeholder="Judul Dokumen" 
              required 
              value={form.title} 
              onChange={(e) => setForm({...form, title: e.target.value})} 
              className="w-full p-2 bg-slate-950 border border-slate-850 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-500"
            />
            <textarea 
              placeholder="Isi Dokumen..." 
              rows={5} 
              required 
              value={form.content} 
              onChange={(e) => setForm({...form, content: e.target.value})} 
              className="w-full p-2 bg-slate-950 border border-slate-850 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-500 resize-none"
            />
            
            {/* Aksi batalkan / submit simpan */}
            <div className="flex justify-end gap-2 pt-2 border-t border-slate-850">
              <button 
                type="button" 
                onClick={() => setIsOpenForm(false)} 
                className="px-3 py-1.5 bg-slate-900 text-[11px] font-bold text-slate-300 rounded-xl cursor-pointer"
              >
                Batal
              </button>
              <button 
                type="submit" 
                className="px-4 py-1.5 bg-cyan-600 text-slate-950 text-[11px] font-bold rounded-xl cursor-pointer"
              >
                Simpan
              </button>
            </div>
          </form>
        </div>
      )}
    </section>
  );
}