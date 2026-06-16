import React, { useState } from 'react';
import { FolderKey, Plus, Search, BookOpen, FileText, Eye, Edit2, Trash2, Save, X, Tag } from 'lucide-react';

export default function KnowledgeBase({ role, documents, onAddDocument, onUpdateDocument, onDeleteDocument }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedProduct, setSelectedProduct] = useState('All');
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isOpenForm, setIsOpenForm] = useState(false);

  const [form, setForm] = useState({ title: '', content: '', category: 'Business Rules', product: 'Megalos' });
  const [editForm, setEditForm] = useState({ title: '', content: '', category: 'Business Rules', product: 'Megalos' });

  // Filter dokumen berdasarkan pencarian, kategori, dan produk
  const filtered = documents.filter(doc => {
    const matchesSearch = doc.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          doc.content.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || doc.category === selectedCategory;
    const matchesProduct = selectedProduct === 'All' || doc.product === selectedProduct;
    return matchesSearch && matchesCategory && matchesProduct;
  });

  const getProductColor = (product) => {
    switch (product) {
      case 'Megalos': return 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20';
      case 'Nexbill': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'Nextune': return 'bg-purple-500/10 text-purple-400 border-purple-500/20';
      default: return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
    }
  };

  const handleEditClick = (doc) => {
    setEditForm({ title: doc.title, content: doc.content, category: doc.category, product: doc.product });
    setSelectedDoc(doc);
    setIsEditing(true);
  };

  const handleDeleteClick = (id) => {
    if (window.confirm("Apakah Anda yakin ingin menghapus dokumen knowledge base ini?")) {
      onDeleteDocument(id);
      setSelectedDoc(null);
    }
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    onAddDocument(form);
    setIsOpenForm(false);
    setForm({ title: '', content: '', category: 'Business Rules', product: 'Megalos' });
  };

  const handleUpdateSubmit = (e) => {
    e.preventDefault();
    onUpdateDocument(selectedDoc.id, editForm);
    setIsEditing(false);
    setSelectedDoc({ ...selectedDoc, ...editForm });
  };

  return (
    <section className="space-y-6 animate-fade-in">
      {/* Header Halaman */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-900 pb-4">
        <div>
          <h2 className="text-xl font-black text-white uppercase flex items-center gap-2.5 tracking-wide">
            <FolderKey size={22} className="text-cyan-500" /> Knowledge Base Pustaka QA
          </h2>
          <p className="text-slate-400 text-xs mt-1">Dokumentasi skenario pengujian, test case, prasyarat, dan aturan bisnis Varnion.</p>
        </div>
        {role === 'super_admin' && (
          <button 
            onClick={() => setIsOpenForm(true)} 
            className="flex items-center justify-center gap-1.5 bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold text-xs px-4 py-2 rounded-xl transition-all active:scale-95 cursor-pointer shadow-lg shadow-cyan-600/10"
          >
            <Plus size={16} /> <span>Tambah Dokumen</span>
          </button>
        )}
      </div>

      {/* Filter Kontrol & Kolom Pencarian */}
      <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-4 gap-4 bg-slate-950/40 border border-slate-900 p-4 rounded-2xl">
        {/* Pencarian */}
        <div className="relative col-span-1 sm:col-span-1 md:col-span-2">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500"><Search size={14} /></span>
          <input 
            type="text" 
            value={searchQuery} 
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-4 py-2 bg-slate-950 border border-slate-850 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-500 placeholder-slate-500 transition-colors"
            placeholder="Cari dokumen..."
          />
        </div>

        {/* Filter Kategori */}
        <div>
          <select 
            value={selectedCategory} 
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full px-3 py-2 bg-slate-950 border border-slate-850 rounded-xl text-xs text-slate-300 focus:outline-none focus:border-cyan-500 cursor-pointer"
          >
            <option value="All">Semua Kategori</option>
            <option value="Business Rules">Business Rules</option>
            <option value="QA Documentation">QA Documentation</option>
          </select>
        </div>

        {/* Filter Produk */}
        <div>
          <select 
            value={selectedProduct} 
            onChange={(e) => setSelectedProduct(e.target.value)}
            className="w-full px-3 py-2 bg-slate-950 border border-slate-850 rounded-xl text-xs text-slate-300 focus:outline-none focus:border-cyan-500 cursor-pointer"
          >
            <option value="All">Semua Produk</option>
            <option value="Megalos">Megalos</option>
            <option value="Nexbill">Nexbill</option>
            <option value="Nextune">Nextune</option>
            <option value="General">General</option>
          </select>
        </div>
      </div>

      {/* Grid Dokumen */}
      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((doc) => (
            <div 
              key={doc.id} 
              className="glass-card p-5 rounded-2xl flex flex-col justify-between h-72 border border-slate-900 group"
            >
              <div className="space-y-3 overflow-hidden">
                <div className="flex items-center justify-between">
                  <span className={`px-2 py-0.5 rounded-md text-[9px] font-bold border tracking-wider uppercase ${getProductColor(doc.product)}`}>
                    {doc.product}
                  </span>
                  <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                    {doc.category}
                  </span>
                </div>
                
                <h3 className="text-sm font-extrabold text-slate-200 group-hover:text-white line-clamp-2 leading-snug">
                  {doc.title}
                </h3>
                
                <p className="text-[11px] text-slate-400 line-clamp-5 leading-relaxed whitespace-pre-line">
                  {doc.content}
                </p>
              </div>

              <div className="flex justify-end pt-3 border-t border-slate-900/60 mt-3">
                <button 
                  onClick={() => { setSelectedDoc(doc); setIsEditing(false); }} 
                  className="px-3 py-1.5 bg-slate-950 hover:bg-cyan-950/40 border border-slate-850 hover:border-cyan-600/30 text-slate-400 hover:text-cyan-400 text-[11px] font-bold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Eye size={12} /> <span>Baca Detail</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-slate-950/20 border border-slate-900 rounded-2xl">
          <BookOpen size={36} className="mx-auto text-slate-700 mb-3" />
          <p className="text-xs text-slate-500 font-bold">Tidak ada dokumen yang sesuai dengan filter pencarian.</p>
        </div>
      )}

      {/* Modal Detail & Edit */}
      {selectedDoc && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="w-full max-w-xl bg-[#0b111e] border border-slate-800 p-6 rounded-2xl space-y-4 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            
            {/* Tombol Hapus Cepat (Admin) */}
            {role === 'super_admin' && !isEditing && (
              <button 
                onClick={() => handleDeleteClick(selectedDoc.id)}
                className="absolute top-6 right-14 text-red-500 hover:text-red-400 p-1.5 hover:bg-red-500/5 rounded-lg cursor-pointer transition-colors"
                title="Hapus Dokumen"
              >
                <Trash2 size={16} />
              </button>
            )}

            {isEditing ? (
              /* Formulir Edit */
              <form onSubmit={handleUpdateSubmit} className="space-y-4">
                <h3 className="text-sm font-black text-white uppercase border-b border-slate-850 pb-2">Edit Dokumen</h3>
                
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-400 text-[10px] font-bold uppercase mb-1">Produk</label>
                    <select 
                      value={editForm.product} 
                      onChange={(e) => setEditForm({...editForm, product: e.target.value})} 
                      className="w-full p-2 bg-slate-950 border border-slate-850 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-500"
                    >
                      <option value="Megalos">Megalos</option>
                      <option value="Nexbill">Nexbill</option>
                      <option value="Nextune">Nextune</option>
                      <option value="General">General</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-slate-400 text-[10px] font-bold uppercase mb-1">Kategori</label>
                    <select 
                      value={editForm.category} 
                      onChange={(e) => setEditForm({...editForm, category: e.target.value})} 
                      className="w-full p-2 bg-slate-950 border border-slate-850 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-500"
                    >
                      <option value="Business Rules">Business Rules</option>
                      <option value="QA Documentation">QA Documentation</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-slate-400 text-[10px] font-bold uppercase mb-1">Judul Dokumen</label>
                  <input 
                    type="text" 
                    required 
                    value={editForm.title} 
                    onChange={(e) => setEditForm({...editForm, title: e.target.value})} 
                    className="w-full p-2 bg-slate-950 border border-slate-850 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-500" 
                    placeholder="Judul Dokumen"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 text-[10px] font-bold uppercase mb-1">Isi Dokumen</label>
                  <textarea 
                    rows={8} 
                    required 
                    value={editForm.content} 
                    onChange={(e) => setEditForm({...editForm, content: e.target.value})} 
                    className="w-full p-2 bg-slate-950 border border-slate-850 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-500 resize-none font-sans" 
                    placeholder="Isi penjelasan atau test case secara detail..."
                  />
                </div>

                <div className="flex justify-end gap-2 pt-3 border-t border-slate-850">
                  <button 
                    type="button" 
                    onClick={() => setIsEditing(false)} 
                    className="px-3 py-1.5 bg-slate-900 hover:bg-slate-850 text-[11px] font-bold text-slate-300 rounded-xl flex items-center gap-1 cursor-pointer"
                  >
                    <X size={12}/> Batal
                  </button>
                  <button 
                    type="submit" 
                    className="px-4 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-slate-950 text-[11px] font-bold rounded-xl flex items-center gap-1 cursor-pointer"
                  >
                    <Save size={12}/> Simpan
                  </button>
                </div>
              </form>
            ) : (
              /* Detail Baca */
              <>
                <div className="border-b border-slate-850 pb-3 flex flex-col gap-1.5">
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded text-[9px] font-bold border ${getProductColor(selectedDoc.product)}`}>
                      {selectedDoc.product}
                    </span>
                    <span className="text-[10px] text-slate-500 font-bold uppercase">
                      {selectedDoc.category}
                    </span>
                  </div>
                  <h3 className="text-base font-black text-white leading-tight">{selectedDoc.title}</h3>
                </div>

                <div className="space-y-1">
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Konten Dokumen:</p>
                  <div className="bg-slate-950 border border-slate-850 p-4 rounded-xl text-xs text-slate-300 leading-relaxed whitespace-pre-line max-h-80 overflow-y-auto font-mono">
                    {selectedDoc.content}
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-850 flex justify-between items-center">
                  {role === 'super_admin' ? (
                    <button 
                      onClick={() => handleEditClick(selectedDoc)} 
                      className="px-3 py-1.5 bg-slate-950 hover:bg-cyan-950/20 border border-slate-850 hover:border-cyan-600/30 text-xs font-bold text-cyan-400 rounded-xl flex items-center gap-1 cursor-pointer"
                    >
                      <Edit2 size={12}/> Edit Data
                    </button>
                  ) : <div/>}
                  <button 
                    onClick={() => setSelectedDoc(null)} 
                    className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 text-xs font-bold text-slate-300 rounded-xl border border-slate-800 cursor-pointer"
                  >
                    Tutup
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Modal Tambah Dokumen */}
      {isOpenForm && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <form onSubmit={handleFormSubmit} className="w-full max-w-md bg-[#0b111e] border border-slate-800 p-6 rounded-2xl space-y-4 shadow-2xl">
            <h3 className="text-sm font-black text-white uppercase border-b border-slate-850 pb-2">Tambah Dokumen Baru</h3>
            
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-400 text-[10px] font-bold uppercase mb-1">Produk</label>
                <select 
                  value={form.product} 
                  onChange={(e) => setForm({...form, product: e.target.value})} 
                  className="w-full p-2 bg-slate-950 border border-slate-850 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-500"
                >
                  <option value="Megalos">Megalos</option>
                  <option value="Nexbill">Nexbill</option>
                  <option value="Nextune">Nextune</option>
                  <option value="General">General</option>
                </select>
              </div>
              <div>
                <label className="block text-slate-400 text-[10px] font-bold uppercase mb-1">Kategori</label>
                <select 
                  value={form.category} 
                  onChange={(e) => setForm({...form, category: e.target.value})} 
                  className="w-full p-2 bg-slate-950 border border-slate-850 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-500"
                >
                  <option value="Business Rules">Business Rules</option>
                  <option value="QA Documentation">QA Documentation</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-slate-400 text-[10px] font-bold uppercase mb-1">Judul Dokumen</label>
              <input 
                type="text" 
                placeholder="Judul Dokumen" 
                required 
                value={form.title} 
                onChange={(e) => setForm({...form, title: e.target.value})} 
                className="w-full p-2 bg-slate-950 border border-slate-850 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="block text-slate-400 text-[10px] font-bold uppercase mb-1">Isi Dokumen</label>
              <textarea 
                placeholder="Tulis skenario, preconditions, test case, atau aturan bisnis di sini..." 
                rows={6} 
                required 
                value={form.content} 
                onChange={(e) => setForm({...form, content: e.target.value})} 
                className="w-full p-2 bg-slate-950 border border-slate-850 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-500 resize-none font-sans"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-850">
              <button 
                type="button" 
                onClick={() => setIsOpenForm(false)} 
                className="px-3 py-1.5 bg-slate-900 hover:bg-slate-850 text-[11px] font-bold text-slate-300 rounded-xl cursor-pointer"
              >
                Batal
              </button>
              <button 
                type="submit" 
                className="px-4 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-slate-950 text-[11px] font-bold rounded-xl cursor-pointer"
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
