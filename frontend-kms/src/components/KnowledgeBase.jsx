import React, { useState } from 'react';
import { FolderKey, Search, FileText, Calendar, ArrowLeft } from 'lucide-react';

export default function KnowledgeBase({ notes, onBackToDashboard }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedNote, setSelectedNote] = useState(null);

  // Filter panduan berdasarkan input pencarian user
  const filteredNotes = notes.filter(note =>
    note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    note.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fade-in">
      {/* HEADER ATAS KNOWLEDGE BASE */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-900 pb-4">
        <div>
          <h2 className="text-lg font-black text-white uppercase flex items-center gap-2 tracking-wide">
            <FolderKey size={18} className="text-cyan-500" />
            Knowledge Base Repository
          </h2>
          <p className="text-slate-400 text-xs mt-0.5">
            Eksplorasi seluruh dokumentasi, SOP, dan kumpulan catatan *testing guide* divisi Quality Assurance.
          </p>
        </div>

        {/* Search Bar Komponen */}
        <div className="relative">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">
            <Search size={14} />
          </span>
          <input 
            type="text" 
            value={searchQuery} 
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8 pr-4 py-1.5 w-64 bg-slate-950 border border-slate-850 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-500 transition-colors"
            placeholder="Cari dokumen panduan..."
          />
        </div>
      </div>

      {/* SUSUNAN LAYOUT KONTEN UTAMA */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* PANEL SEBELAH KIRI: DAFTAR LIST JUDUL DOKUMEN */}
        <div className="md:col-span-1 bg-slate-950/40 border border-slate-900 p-4 rounded-2xl flex flex-col space-y-2 h-[500px] overflow-y-auto pr-1">
          <span className="text-[10px] font-black tracking-wider text-slate-500 uppercase px-2 mb-1">
            Available Documents ({filteredNotes.length})
          </span>
          {filteredNotes.map((note) => (
            <button
              key={note.id}
              onClick={() => setSelectedNote(note)}
              className={`w-full text-left p-3 rounded-xl border text-xs font-bold transition-all flex items-start gap-2.5 group cursor-pointer ${
                selectedNote?.id === note.id
                  ? 'bg-cyan-600/10 border-cyan-500 text-cyan-400'
                  : 'bg-slate-900/20 border-slate-900 text-slate-300 hover:bg-slate-900/60 hover:border-slate-800 hover:text-white'
              }`}
            >
              <FileText size={14} className="mt-0.5 shrink-0 text-slate-500 group-hover:text-cyan-400 transition-colors" />
              <span className="truncate">{note.title}</span>
            </button>
          ))}
          {filteredNotes.length === 0 && (
            <p className="text-center text-[11px] text-slate-600 py-8 italic">Dokumen tidak ditemukan.</p>
          )}
        </div>

        {/* PANEL SEBELAH KANAN: TEMPAT BACA DETAIL ISI DOKUMEN UTUH */}
        <div className="md:col-span-2 bg-slate-950/20 border border-slate-900 p-6 rounded-2xl h-[500px] flex flex-col justify-between">
          {selectedNote ? (
            <div className="space-y-4 flex-1 flex flex-col min-h-0">
              <div className="border-b border-slate-900 pb-3">
                <h3 className="text-md font-black text-white leading-tight">{selectedNote.title}</h3>
                <div className="flex items-center gap-1.5 text-[10px] text-slate-500 font-medium mt-1.5">
                  <Calendar size={12} />
                  <span>Document Sync ID: #{selectedNote.id} • Verified QA Knowledge</span>
                </div>
              </div>
              
              {/* Tempat teks panjang penuh baca dokumen */}
              <div className="flex-1 bg-slate-950/60 border border-slate-900 p-5 rounded-xl text-xs text-slate-300 leading-relaxed whitespace-pre-line overflow-y-auto font-sans">
                {selectedNote.content}
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-6 border border-dashed border-slate-900 rounded-xl">
              <div className="text-slate-700 mb-2"><FolderKey size={36} /></div>
              <h3 className="text-xs font-bold text-slate-400">Belum Ada Dokumen QA yang Dipilih</h3>
              <p className="text-[11px] text-slate-500 max-w-xs mt-1">Silakan pilih salah satu judul panduan di panel sebelah kiri untuk mulai membaca seluruh isi dokumentasi penuh.</p>
            </div>
          )}

          {/* Tombol Navigasi Kembali Cepat */}
          <div className="pt-4 border-t border-slate-900 flex justify-end">
            <button 
              onClick={onBackToDashboard}
              className="flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-cyan-400 transition-colors cursor-pointer"
            >
              <ArrowLeft size={14} />
              <span>Back to Main Dashboard</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}