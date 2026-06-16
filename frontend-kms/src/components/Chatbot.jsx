import React, { useState, useEffect, useRef } from 'react';
import { Bot, MessageSquare, FolderKey, Layers, ArrowLeft, ExternalLink } from 'lucide-react';

export default function Chatbot({ user, platforms = [], notes = [] }) {
  const [isOpen, setIsOpen] = useState(false);
  const [history, setHistory] = useState([]);
  const endRef = useRef(null);

  // Fungsi untuk memicu menu paling utama (Sesuai teks persis di image_4a1c60.png)
  const loadMainMenu = () => {
    const clientName = user?.username || 'Penguji';
    setHistory([
      {
        sender: 'bot',
        text: `Halo ${clientName}! Selamat datang di KMS QA. Opsi modul panduan mana yang ingin kamu validasi hari ini?`,
        type: 'menu', 
      }
    ]);
  };

  useEffect(() => {
    if (isOpen && history.length === 0) {
      loadMainMenu();
    }
  }, [isOpen, user]);

  useEffect(() => {
    // Memastikan gelembung chat otomatis meluncur ke bawah saat ada pesan baru
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history]);

  // HANDLER UTAMA SAAT USER MEMILIH KATEGORI
  const handleSelectMenu = (pilihan) => {
    if (pilihan === 'staging') {
      setHistory(prev => [
        ...prev,
        { sender: 'user', text: 'Direktori Staging Aplikasi' },
        {
          sender: 'bot',
          text: 'Berikut adalah daftar seluruh platform staging aktif yang tersedia di direktori PT Varnion Technology Semesta:',
          type: 'list_platforms'
        }
      ]);
    } else if (pilihan === 'notes') {
      setHistory(prev => [
        ...prev,
        { sender: 'user', text: 'Panduan QA / Knowledge Base' },
        {
          sender: 'bot',
          text: 'Berikut adalah daftar dokumen memo teknis dan business rules pengujian yang tersimpan di Knowledge Base Repository:',
          type: 'list_notes'
        }
      ]);
    }
  };

  // ✨ PERBAIKAN BUG KUNCI: Menggunakan parameter 'jenis' secara benar agar tidak crash
  const handleSelectItem = (item, jenis) => {
    if (jenis === 'platform') {
      setHistory(prev => [
        ...prev,
        { sender: 'user', text: `Lihat Detail: ${item.name}` },
        {
          sender: 'bot',
          text: `• Platform: ${item.name}\n• Status: ${item.status}\n• Target URL Environment:\n${item.url}\n\n• Panduan Singkat:\n${item.testing_guide || 'Belum ada instruksi khusus.'}`,
          type: 'final_platform',
          url: item.url
        }
      ]);
    } else if (jenis === 'note') {
      setHistory(prev => [
        ...prev,
        { sender: 'user', text: `Lihat Dokumen: ${item.title}` },
        {
          sender: 'bot',
          text: `• Judul Panduan: ${item.title}\n\n• Isi Ringkasan Dokumen:\n${item.content}`,
          type: 'final'
        }
      ]);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end font-sans">
      
      {/* JENDELA WIDGET CHATBOX */}
      {isOpen && (
        <div className="w-80 md:w-96 h-[460px] rounded-2xl bg-[#0b111e] border border-slate-800 shadow-2xl flex flex-col mb-3 overflow-hidden animate-fade-in">
          
          {/* HEADER (SINKRON GAYA CYBERPUNK) */}
          <div className="bg-slate-950 px-4 py-3 border-b border-slate-800 flex items-center justify-between">
            <h3 className="text-xs font-black text-white flex items-center gap-2 tracking-wide">
              <Bot size={16} className="text-cyan-400"/> Asisten Virtual QA
            </h3>
            <button onClick={() => setIsOpen(false)} className="text-xs text-slate-500 hover:text-white cursor-pointer">✕</button>
          </div>

          {/* AREA RIWAYAT OBROLAN */}
          <div className="flex-1 p-4 overflow-y-auto space-y-4 text-xs flex flex-col bg-[#070b12]/40">
            {history.map((chat, idx) => (
              <div key={idx} className={`flex flex-col ${chat.sender === 'user' ? 'items-end' : 'items-start'}`}>
                
                {/* Balon Kata */}
                <div className={`p-3 rounded-xl max-w-[85%] whitespace-pre-line leading-relaxed ${
                  chat.sender === 'user' 
                    ? 'bg-cyan-600 text-slate-950 font-bold rounded-br-none' 
                    : 'bg-slate-900 border border-slate-850 text-slate-300 rounded-bl-none'
                }`}>
                  {chat.text}
                </div>

                {/* AREA OPSI 1: TOMBOL PILIHAN KATEGORI UTAMA (PERSIS IMAGE_4A1C60.PNG) */}
                {chat.sender === 'bot' && chat.type === 'menu' && (
                  <div className="flex flex-col gap-2 mt-3 w-full max-w-[85%]">
                    <button 
                      onClick={() => handleSelectMenu('staging')}
                      className="w-full text-left px-4 py-2.5 bg-slate-950 hover:bg-cyan-900/20 border border-slate-850 hover:border-cyan-600/40 text-cyan-400 text-[11px] rounded-xl font-bold transition-all cursor-pointer flex items-center gap-2"
                    >
                      <Layers size={12} /> <span>Direktori Staging Aplikasi</span>
                    </button>
                    <button 
                      onClick={() => handleSelectMenu('notes')}
                      className="w-full text-left px-4 py-2.5 bg-slate-950 hover:bg-cyan-900/20 border border-slate-850 hover:border-cyan-600/40 text-cyan-400 text-[11px] rounded-xl font-bold transition-all cursor-pointer flex items-center gap-2"
                    >
                      <FolderKey size={12} /> <span>Panduan QA / Knowledge Base</span>
                    </button>
                  </div>
                )}

                {/* AREA OPSI 2: LISTING NAMA PLATFORM SECARA REAL-TIME */}
                {chat.sender === 'bot' && chat.type === 'list_platforms' && (
                  <div className="flex flex-col gap-1.5 mt-2.5 w-full max-w-[85%] max-h-40 overflow-y-auto bg-slate-950/60 p-2 rounded-xl border border-slate-900 custom-scrollbar">
                    {platforms.map((p) => (
                      <button 
                        key={p.id} onClick={() => handleSelectItem(p, 'platform')}
                        className="w-full text-left px-3 py-2 bg-slate-900 hover:bg-cyan-950/30 border border-slate-850 text-slate-300 hover:text-cyan-400 text-[11px] rounded-lg truncate font-bold transition-colors cursor-pointer"
                      >
                        🚀 {p.name}
                      </button>
                    ))}
                    {platforms.length === 0 && (
                      <span className="text-[10px] text-slate-600 italic p-1">Belum ada platform terdaftar.</span>
                    )}
                  </div>
                )}

                {/* AREA OPSI 3: LISTING JUDUL NOTES SECARA REAL-TIME */}
                {chat.sender === 'bot' && chat.type === 'list_notes' && (
                  <div className="flex flex-col gap-1.5 mt-2.5 w-full max-w-[85%] max-h-40 overflow-y-auto bg-slate-950/60 p-2 rounded-xl border border-slate-900 custom-scrollbar">
                    {notes.map((n) => (
                      <button 
                        key={n.id} onClick={() => handleSelectItem(n, 'note')}
                        className="w-full text-left px-3 py-2 bg-slate-900 hover:bg-cyan-950/30 border border-slate-850 text-slate-300 hover:text-cyan-400 text-[11px] rounded-lg truncate font-bold transition-colors cursor-pointer"
                      >
                        📄 {n.title}
                      </button>
                    ))}
                    {notes.length === 0 && (
                      <span className="text-[10px] text-slate-600 italic p-1">Belum ada panduan terdaftar.</span>
                    )}
                  </div>
                )}

                {/* AREA OPSI TERAKHIR: TOMBOL KEMBALI KE MENU UTAMA ATAU BUKA LINK */}
                {chat.sender === 'bot' && (chat.type === 'final' || chat.type === 'final_platform') && (
                  <div className="flex flex-col gap-2 mt-2.5">
                    {chat.type === 'final_platform' && chat.url && (
                      <a 
                        href={chat.url} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="inline-flex items-center gap-1.5 px-3 py-2 bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold text-[11px] rounded-lg transition-all cursor-pointer w-fit"
                      >
                        <ExternalLink size={12} /> Buka Platform (Tab Baru)
                      </a>
                    )}
                    <button 
                      onClick={loadMainMenu}
                      className="flex items-center gap-1 text-[10px] font-black uppercase text-slate-500 hover:text-cyan-400 transition-colors cursor-pointer w-fit"
                    >
                      <ArrowLeft size={10} /> Kembali ke Menu Utama
                    </button>
                  </div>
                )}

              </div>
            ))}
            <div ref={endRef} />
          </div>

        </div>
      )}

      {/* FLOATING BUTTON BULAT DI POJOK BAWAH */}
      <button 
        onClick={() => setIsOpen(!isOpen)} 
        className="p-3.5 bg-cyan-600 hover:bg-cyan-500 text-slate-950 rounded-full shadow-xl shadow-cyan-500/10 active:scale-95 transition-all cursor-pointer"
      >
        <MessageSquare size={24} />
      </button>
    </div>
  );
}