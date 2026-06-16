import React, { useState } from 'react';
import { Layers, Search, Plus, Eye, ExternalLink, Edit2, Trash2, Save, X } from 'lucide-react';

export default function PlatformGrid({ role, platforms, onAddPlatform, fetchData }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selected, setSelected] = useState(null);
  const [isOpenForm, setIsOpenForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  
  const [form, setForm] = useState({ name: '', url: '', status: 'Testing', testing_guide: '' });
  const [editForm, setEditForm] = useState({ name: '', url: '', status: 'Testing', testing_guide: '' });

  const filtered = platforms.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()));

  // Menghapus platform
  const handleDelete = async (id) => {
    if (window.confirm("Apakah Anda yakin ingin menghapus platform ini?")) {
      try {
        const res = await fetch(`http://localhost:5000/api/platforms/${id}`, {
          method: 'DELETE',
          headers: { 'userrole': role }
        });
        if (res.ok) {
          setSelected(null);
          fetchData();
        }
      } catch (err) {
        alert("Gagal menghapus platform.");
      }
    }
  };

  // Memperbarui platform
  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`http://localhost:5000/api/platforms/${selected.id}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'userrole': role
        },
        body: JSON.stringify(editForm)
      });
      if (res.ok) {
        setIsEditing(false);
        setSelected({ ...selected, ...editForm });
        fetchData();
      }
    } catch (err) {
      alert("Gagal memperbarui platform.");
    }
  };

  return (
    <section className="space-y-4">
      {/* Header */}
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

      {/* Grid Platform */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((plat) => (
          <div key={plat.id} className="glass-card p-5 rounded-2xl flex flex-col justify-between h-44 border border-slate-900">
            <div>
              <span className={`px-2.5 py-0.5 rounded-md text-[10px] font-bold tracking-wide uppercase ${plat.status === 'Stable' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'}`}>
                {plat.status}
              </span>
              <h3 className="text-sm font-black text-slate-100 mt-3">{plat.name}</h3>
            </div>

            <div className="mt-5 pt-3 border-t border-slate-900/60 flex items-center justify-between text-[11px]">
              <button 
                onClick={() => { setSelected(plat); setEditForm(plat); setIsEditing(false); }} 
                className="text-cyan-400 hover:text-cyan-300 font-bold transition-colors cursor-pointer flex items-center gap-1"
              >
                <Eye size={12} /> <span>Detail</span>
              </button>

              <a href={plat.url} target="_blank" rel="noreferrer" className="p-1.5 bg-slate-950 hover:bg-cyan-950/40 border border-slate-850 hover:border-cyan-600/30 text-slate-400 hover:text-cyan-400 rounded-lg transition-all">
                <ExternalLink size={14} />
              </a>
            </div>
          </div>
        ))}
      </div>

      {/* Modal Detail Platform */}
      {selected && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="w-full max-w-xl bg-[#0b111e] border border-slate-800 p-6 rounded-2xl space-y-4 shadow-2xl relative">
            
            {/* Tombol Hapus (Admin saja) */}
            {role === 'super_admin' && !isEditing && (
              <button 
                onClick={() => handleDelete(selected.id)}
                className="absolute top-6 right-14 text-red-500 hover:text-red-400 p-1.5 hover:bg-red-500/5 rounded-lg transition-colors cursor-pointer"
                title="Hapus Platform"
              >
                <Trash2 size={16} />
              </button>
            )}

            {isEditing ? (
              /* Form Edit */
              <form onSubmit={handleUpdate} className="space-y-4">
                <h3 className="text-sm font-black text-white uppercase border-b border-slate-850 pb-2">Edit Data Platform</h3>
                <input type="text" value={editForm.name} onChange={(e) => setEditForm({...editForm, name: e.target.value})} className="w-full p-2 bg-slate-950 border border-slate-850 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-500" placeholder="Nama Platform"/>
                <input type="url" value={editForm.url} onChange={(e) => setEditForm({...editForm, url: e.target.value})} className="w-full p-2 bg-slate-950 border border-slate-850 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-500" placeholder="Link Staging"/>
                <select value={editForm.status} onChange={(e) => setEditForm({...editForm, status: e.target.value})} className="w-full p-2 bg-slate-950 border border-slate-850 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-500">
                  <option value="Testing">Testing</option>
                  <option value="Stable">Stable</option>
                </select>
                <textarea rows={4} value={editForm.testing_guide} onChange={(e) => setEditForm({...editForm, testing_guide: e.target.value})} className="w-full p-2 bg-slate-950 border border-slate-850 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-500 resize-none" placeholder="Instruksi Panduan..."/>
                <div className="flex justify-end gap-2 pt-2 border-t border-slate-850">
                  <button type="button" onClick={() => setIsEditing(false)} className="px-3 py-1.5 bg-slate-900 text-[11px] font-bold text-slate-300 rounded-xl flex items-center gap-1"><X size={12}/> Batal</button>
                  <button type="submit" className="px-4 py-1.5 bg-cyan-600 text-slate-950 text-[11px] font-bold rounded-xl flex items-center gap-1 shadow-lg shadow-cyan-500/10"><Save size={12}/> Simpan</button>
                </div>
              </form>
            ) : (
              /* Tampilan Detail */
              <>
                <div className="border-b border-slate-850 pb-3 flex justify-between items-center">
                  <h3 className="text-md font-black text-white">{selected.name}</h3>
                  <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${selected.status === 'Stable' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'}`}>{selected.status}</span>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Target URL Environment:</p>
                  <a href={selected.url} target="_blank" rel="noreferrer" className="text-xs text-cyan-400 hover:underline font-mono break-all flex items-center gap-1">{selected.url} <ExternalLink size={12} /></a>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Panduan Pelaksanaan Testing:</p>
                  <div className="bg-slate-950 p-4 border border-slate-850 rounded-xl text-xs text-slate-300 whitespace-pre-line max-h-48 overflow-y-auto leading-relaxed">{selected.testing_guide || "Belum ada instruksi khusus."}</div>
                </div>
                <div className="pt-2 border-t border-slate-850 flex justify-between gap-2">
                  {role === 'super_admin' ? (
                    <button onClick={() => setIsEditing(true)} className="px-3 py-1.5 bg-slate-950 hover:bg-cyan-950/20 border border-slate-850 hover:border-cyan-600/30 text-xs font-bold text-cyan-400 rounded-xl flex items-center gap-1 cursor-pointer"><Edit2 size={12}/> Edit Data</button>
                  ) : <div/>}
                  <button onClick={() => setSelected(null)} className="px-4 py-1.5 bg-slate-900 text-xs font-bold text-slate-300 rounded-xl border border-slate-800 hover:bg-slate-800 cursor-pointer">Tutup</button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Modal Tambah Platform */}
      {isOpenForm && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <form onSubmit={(e) => { e.preventDefault(); onAddPlatform(form); setIsOpenForm(false); setForm({ name: '', url: '', status: 'Testing', testing_guide: '' }); }} className="w-full max-w-md bg-[#0b111e] border border-slate-800 p-6 rounded-2xl space-y-4">
            <h3 className="text-sm font-black text-white uppercase border-b border-slate-850 pb-2 tracking-wider">Tambah Platform Staging</h3>
            <input type="text" placeholder="Nama Aplikasi" required value={form.name} onChange={(e) => setForm({...form, name: e.target.value})} className="w-full p-2 bg-slate-950 border border-slate-850 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-500"/>
            <input type="url" placeholder="URL Staging Link" required value={form.url} onChange={(e) => setForm({...form, url: e.target.value})} className="w-full p-2 bg-slate-950 border border-slate-850 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-500"/>
            <select value={form.status} onChange={(e) => setForm({...form, status: e.target.value})} className="w-full p-2 bg-slate-950 border border-slate-850 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-500">
              <option value="Testing">Testing</option>
              <option value="Stable">Stable</option>
            </select>
            <textarea placeholder="Tulis instruksi testing..." rows={4} required value={form.testing_guide} onChange={(e) => setForm({...form, testing_guide: e.target.value})} className="w-full p-2 bg-slate-950 border border-slate-850 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-500 resize-none"/>
            <div className="flex justify-end gap-2 pt-2 border-t border-slate-850">
              <button type="button" onClick={() => setIsOpenForm(false)} className="px-3 py-1.5 bg-slate-900 text-[11px] font-bold text-slate-300 rounded-xl cursor-pointer">Batal</button>
              <button type="submit" className="px-4 py-1.5 bg-cyan-600 text-slate-950 text-[11px] font-bold rounded-xl cursor-pointer">Simpan</button>
            </div>
          </form>
        </div>
      )}
    </section>
  );
}