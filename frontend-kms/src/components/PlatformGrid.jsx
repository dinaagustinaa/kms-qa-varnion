import React, { useState } from 'react';
import { Layers, Search, Plus, Eye, ExternalLink } from 'lucide-react';

export default function PlatformGrid({ role, platforms, onAddPlatform }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selected, setSelected] = useState(null);
  const [isOpenForm, setIsOpenForm] = useState(false);
  
  const [form, setForm] = useState({ name: '', url: '', status: 'Testing', testing_guide: '' });

  const filtered = platforms.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <section className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-900 pb-4">
        <div>
          <h2 className="text-lg font-black text-white uppercase flex items-center gap-2 tracking-wide">
            <Layers size={18} className="text-cyan-500" /> DIREKTORI STAGING APLIKASI
          </h2>
          <p className="text-slate-400 text-xs mt-0.5">Klik kartu untuk melihat rincian prasyarat teknis pengujian.</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500"><Search size={14} /></span>
            <input 
              type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 pr-4 py-1.5 w-60 bg-slate-950 border border-slate-850 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-500"
              placeholder="Cari platform..."
            />
          </div>
          {role === 'super_admin' && (
            <button onClick={() => setIsOpenForm(true)} className="flex items-center gap-1 bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold text-xs px-3 py-1.5 rounded-xl cursor-pointer">
              <Plus size={14} /> <span>Tambah Platform</span>
            </button>
          )}
        </div>
      </div>

      {/* GRID KARTU PLATFORM */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((plat) => (
          <div key={plat.id} className="glass-card p-5 rounded-2xl flex flex-col justify-between h-44 border border-slate-900">
            <div>
              <span className={`px-2.5 py-0.5 rounded-md text-[10px] font-bold tracking-wide uppercase ${plat.status === 'Stable' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'}`}>
                {plat.status}
              </span>
              {/* Judul Aplikasi */}
              <h3 className="text-sm font-black text-slate-100 mt-3">{plat.name}</h3>
              {/* LINK KOTAK UNGU DIHAPUS DARI SINI AGAR DESAIN BERSIH */}
            </div>

            {/* AREA TOMBOL BAWAH YANG SUDAH DIPERBAIKI */}
            <div className="mt-5 pt-3 border-t border-slate-900/60 flex items-center justify-between text-[11px]">
              
              {/* Pojok Kiri: Klik untuk Buka Modal Dokumentasi */}
              <button 
                onClick={() => setSelected(plat)} 
                className="text-cyan-400 hover:text-cyan-300 font-bold transition-colors cursor-pointer flex items-center gap-1"
              >
                <Eye size={12} />
                <span>Description</span>
              </button>

              {/* Pojok Kanan: Klik untuk Langsung Lompat ke URL Staging Asli */}
              <a 
                href={plat.url} 
                target="_blank" 
                rel="noreferrer" 
                className="p-1.5 bg-slate-950 hover:bg-cyan-950/40 border border-slate-850 hover:border-cyan-600/30 text-slate-400 hover:text-cyan-400 rounded-lg transition-all"
                title="Buka Link Staging Environment"
              >
                <ExternalLink size={14} />
              </a>
              
            </div>
          </div>
        ))}
      </div>

      {/* MODAL VIEW PLATFORM (READ ONLY) */}
      {selected && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="w-full max-w-xl bg-[#0b111e] border border-slate-800 p-6 rounded-2xl space-y-4 shadow-2xl">
            <div className="border-b border-slate-850 pb-3 flex justify-between items-center">
              <h3 className="text-md font-black text-white">{selected.name}</h3>
              <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${selected.status === 'Stable' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'}`}>{selected.status}</span>
            </div>
            
            <div className="space-y-1">
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Target URL Environment:</p>
              <a href={selected.url} target="_blank" rel="noreferrer" className="text-xs text-cyan-400 hover:underline font-mono break-all flex items-center gap-1">
                {selected.url} <ExternalLink size={12} />
              </a>
            </div>

            <div className="space-y-1">
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Panduan Pelaksanaan Testing:</p>
              <div className="bg-slate-950 p-4 border border-slate-850 rounded-xl text-xs text-slate-300 whitespace-pre-line max-h-48 overflow-y-auto font-sans leading-relaxed">
                {selected.testing_guide || "Belum ada teks instruksi khusus untuk platform ini."}
              </div>
            </div>

            <button onClick={() => setSelected(null)} className="w-full py-2 bg-slate-900 text-xs font-bold text-slate-300 rounded-xl border border-slate-800 hover:bg-slate-800 transition-colors cursor-pointer">
              Tutup Dokumentasi
            </button>
          </div>
        </div>
      )}

      {/* MODAL FORM TAMBAH (ADMIN ONLY) */}
      {isOpenForm && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <form onSubmit={(e) => { e.preventDefault(); onAddPlatform(form); setIsOpenForm(false); setForm({ name: '', url: '', status: 'Testing', testing_guide: '' }); }} className="w-full max-w-md bg-[#0b111e] border border-slate-800 p-6 rounded-2xl space-y-4">
            <h3 className="text-sm font-black text-white uppercase border-b border-slate-850 pb-2 tracking-wider">Tambah Platform Staging</h3>
            <input type="text" placeholder="Nama Aplikasi (Contoh: Megalos V2)" required value={form.name} onChange={(e) => setForm({...form, name: e.target.value})} className="w-full p-2 bg-slate-950 border border-slate-850 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-500"/>
            <input type="url" placeholder="URL Staging Environment Link" required value={form.url} onChange={(e) => setForm({...form, url: e.target.value})} className="w-full p-2 bg-slate-950 border border-slate-850 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-500"/>
            <select value={form.status} onChange={(e) => setForm({...form, status: e.target.value})} className="w-full p-2 bg-slate-950 border border-slate-850 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-500">
              <option value="Testing">Testing</option>
              <option value="Stable">Stable</option>
            </select>
            <textarea placeholder="Tulis instruksi prasyarat atau business rules testing di sini..." rows={4} required value={form.testing_guide} onChange={(e) => setForm({...form, testing_guide: e.target.value})} className="w-full p-2 bg-slate-950 border border-slate-850 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-500 resize-none"/>
            <div className="flex justify-end gap-2 pt-2 border-t border-slate-850">
              <button type="button" onClick={() => setIsOpenForm(false)} className="px-3 py-1.5 bg-slate-900 text-[11px] font-bold text-slate-300 rounded-xl cursor-pointer">Batal</button>
              <button type="submit" className="px-4 py-1.5 bg-cyan-600 text-slate-950 text-[11px] font-bold rounded-xl cursor-pointer">Simpan Platform</button>
            </div>
          </form>
        </div>
      )}
    </section>
  );
}