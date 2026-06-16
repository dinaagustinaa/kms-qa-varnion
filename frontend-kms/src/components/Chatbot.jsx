import React, { useState, useEffect, useRef } from 'react';
import { Bot } from 'lucide-react';

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [history, setHistory] = useState([]);
  const endRef = useRef(null);

  const loadNode = async (nodeId) => {
    try {
      const res = await fetch(`http://localhost:5000/api/chat/${nodeId}`);
      const data = await res.json();
      setHistory(prev => [...prev, { sender: 'bot', text: data.text, options: data.options }]);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (isOpen && history.length === 0) loadNode('start');
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [isOpen, history]);

  const handleSelect = (text, nextNode) => {
    setHistory(prev => [...prev, { sender: 'user', text }]);
    setTimeout(() => loadNode(nextNode), 400);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      {isOpen && (
        <div className="w-80 md:w-96 h-[400px] rounded-2xl bg-[#0b111e] border border-slate-800 shadow-2xl flex flex-col mb-3 overflow-hidden">
          <div className="bg-slate-950 px-4 py-3 border-b border-slate-800 flex items-center justify-between">
            <h3 className="text-xs font-black text-white flex items-center gap-2"><Bot size={14} className="text-cyan-400"/> QA Copilot Assistant</h3>
            <button onClick={() => setIsOpen(false)} className="text-xs text-slate-500 hover:text-white cursor-pointer">✕</button>
          </div>
          <div className="flex-1 p-4 overflow-y-auto space-y-3 text-xs">
            {history.map((chat, idx) => (
              <div key={idx} className={`flex flex-col ${chat.sender === 'user' ? 'items-end' : 'items-start'}`}>
                <div className={`p-3 rounded-xl max-w-[85%] ${chat.sender === 'user' ? 'bg-cyan-600 text-slate-950 font-semibold' : 'bg-slate-900 border border-slate-800 text-slate-300'}`}>{chat.text}</div>
                {chat.sender === 'bot' && chat.options && (
                  <div className="flex flex-col gap-1 mt-2 w-full max-w-[85%]">
                    {chat.options.map((opt, oIdx) => (
                      <button key={oIdx} onClick={() => handleSelect(opt.text, opt.next)} className="w-full text-left px-3 py-1.5 bg-slate-950 hover:bg-cyan-900/30 border border-slate-850 hover:border-cyan-600/40 text-cyan-400 text-[11px] rounded-lg cursor-pointer">{opt.text}</button>
                    ))}
                  </div>
                )}
              </div>
            ))}
            <div ref={endRef} />
          </div>
        </div>
      )}
      <button onClick={() => setIsOpen(!isOpen)} className="p-3.5 bg-cyan-600 hover:bg-cyan-500 text-slate-950 rounded-full shadow-xl cursor-pointer"><Bot size={24} /></button>
    </div>
  );
}