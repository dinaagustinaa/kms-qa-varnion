import React, { useState } from 'react';
import { BookOpen, Plus, Eye, FileText } from 'lucide-react';

export default function Notes({ role, notes, onAddNote }) {
  const [isOpenForm, setIsOpenForm] = useState(false);
  const [selectedNote, setSelectedNote] = useState(null); // State untuk modal lihat detail catatan full
  const [form, setForm] = useState({ title: '', content: '' });

  return (
    <section className="space-y-4">
      {/* HEADER UTAMA AREA BAWAH */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-900 pb-4">
        <div>
          <h2 className="text-lg font-black text-white uppercase flex items-center gap-2 tracking-wide">
            <BookOpen size={18} className="text-cyan-500" />
            Panduan Quality Assurance
          </h2>
          <p className="text-slate-400 text-xs mt-0.5">
            Dokumentasi aturan bisnis, skenario acuan, dan memo teknis pengujian aplikasi.
          </p>
        </div>
        
        {/* Tombol tambah catatan dikunci khusus untuk QA Admin */}
        {role === 'super_admin' && (
          <button 
            onClick={() => setIsOpenForm(true)} 
            className="flex items-center gap-1 bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold text-xs px-3 py-1.5 rounded-xl transition-all cursor-pointer shadow-lg shadow-cyan-500/5"
          >
            <Plus size={14} />
            <span>Tambah Panduan</span>
          </button>
        )}
      </div>

      {/* RENDER LAYOUT GRID KARTU KOTAK MEMANJANG KE BAWAH */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
        {notes.map((note) => (
          <div 
            key={note.id} 
            className="glass-card p-5 rounded-2xl flex flex-col justify-between h-64 relative group border border-slate-900"
          >
            {/* Bagian Atas: Judul dan Deskripsi yang Kelihatan Dikit */}
            <div className="space-y-2.5 overflow-hidden">
              <div className="text-cyan-500/40 group-hover:text-cyan-400 transition-colors">
                <FileText size={18} />
              </div>
              <h3 className="text-xs font-extrabold text-slate-200 group-hover:text-white line-clamp-2 leading-snug">
                {note.title}
              </h3>
              {/* line-clamp-4 memotong teks deskripsi agar hanya terlihat dikit (maksimal 4 baris) */}
              <p className="text-[11px] text-slate-400 line-clamp-4 leading-relaxed whitespace-pre-line">
                {note.content}
              </p>
            </div>

            {/* Bagian Pojok Kanan Bawah: Gambar Mata untuk Lihat Full */}
            <div className="flex justify-end pt-3 border-t border-slate-900/60 mt-2">
              <button
                onClick={() => setSelectedNote(note)}
                className="p-1.5 bg-slate-950 hover:bg-cyan-950/40 border border-slate-850 hover:border-cyan-600/30 text-slate-500 hover:text-cyan-400 rounded-lg transition-all cursor-pointer"
                title="Lihat Catatan Penuh"
              >
                <Eye size={14} />
              </button>
            </div>
          </div>
        ))}

        {notes.length === 0 && (
          <div className="col-span-full py-12 text-center glass-card rounded-2xl border border-dashed border-slate-850">
            <p className="text-xs text-slate-500 italic">Belum ada dokumen panduan QA yang terdaftar.</p>
          </div>
        )}
      </div>

      {/* =================================================== */}
      {/* JENDELA MODAL DETAIL BACA FULL NOTE (ALL ROLES)     */}
      {/* =================================================== */}
      {selectedNote && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="w-full max-w-lg bg-[#0b111e] border border-slate-800 p-6 rounded-2xl space-y-4 shadow-2xl">
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

            <div className="pt-2 border-t border-slate-850 flex justify-end">
              <button 
                onClick={() => setSelectedNote(null)} 
                className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs font-bold text-slate-300 rounded-xl cursor-pointer transition-colors"
              >
                Tutup Panduan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =================================================== */}
      {/* MODAL FORM TAMBAH PANDUAN (KHUSUS QA ADMIN)         */}
      {/* =================================================== */}
      {isOpenForm && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <form 
            onSubmit={(e) => { 
              e.preventDefault(); 
              // Tetap mengirim objek data dengan default category 'todo' agar API backend lamamu tidak error/crash
              onAddNote({ ...form, category: 'todo' }); 
              setIsOpenForm(false); 
              setForm({ title: '', content: '' }); 
            }} 
            className="w-full max-w-md bg-[#0b111e] border border-slate-800 p-6 rounded-2xl space-y-4"
          >
            <h3 className="text-xs font-black text-white uppercase tracking-wider border-b border-slate-850 pb-2">
              Tambah Panduan Baru
            </h3>
            
            <div>
              <label className="block text-slate-400 text-[10px] font-bold uppercase mb-1">Judul Dokumen Panduan</label>
              <input 
                type="text" required value={form.title} 
                onChange={(e) => setForm({...form, title: e.target.value})} 
                className="w-full p-2 bg-slate-950 border border-slate-850 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-500"
                placeholder="Misal: Prosedur Verifikasi Token JWT"
              />
            </div>

            <div>
              <label className="block text-slate-400 text-[10px] font-bold uppercase mb-1">Isi Detail Panduan</label>
              <textarea 
                rows={5} required value={form.content} 
                onChange={(e) => setForm({...form, content: e.target.value})} 
                className="w-full p-2 bg-slate-950 border border-slate-850 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-500 resize-none font-sans" 
                placeholder="Tulis materi instruksi testing atau batasan logika bisnis di sini..."
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-850">
              <button 
                type="button" 
                onClick={() => setIsOpenForm(false)} 
                className="px-3 py-1.5 bg-slate-900 border border-slate-850 text-[11px] font-bold text-slate-300 rounded-xl cursor-pointer"
              >
                Batal
              </button>
              <button 
                type="submit" 
                className="px-4 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-slate-950 text-[11px] font-bold rounded-xl cursor-pointer transition-all"
              >
                Simpan Panduan
              </button>
            </div>
          </form>
        </div>
      )}
    </section>
  );
}