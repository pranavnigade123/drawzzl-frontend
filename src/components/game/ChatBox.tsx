// src/components/game/ChatBox.tsx
'use client';

import { useState, useRef, useEffect } from 'react';
import { useGameStore } from '@/store/useGameStore';
import { socket } from '@/lib/socket';
import { Send } from 'lucide-react';

export default function ChatBox() {
  const { roomId, players, addChat, chat } = useGameStore();
  const [guess, setGuess] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);

  const me = players.find(p => p.id === socket.id);
  const isDrawer = me?.isDrawer;

  const sendGuess = () => {
    const g = guess.trim();
    if (!g || !roomId) return;
    socket.emit('guess', { roomId, guess: g, name: me?.name || 'Me' });
    setGuess('');
  };

  const sendChat = (msg: string) => {
    if (!msg.trim() || !roomId) return;
    socket.emit('chat', { roomId, msg: msg.trim(), name: me?.name || 'Me' });
  };

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chat]);

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
      <h3 className="text-lg font-semibold mb-3">{isDrawer ? 'Chat' : 'Guess / Chat'}</h3>
      <div className="h-80 overflow-y-auto rounded-md border border-white/10 bg-black/20 p-3 mb-3">
        {chat.map((m, i) => (
          <div key={i} className="text-sm mb-1">
            <span className="text-white/60 mr-1">{m.name}:</span>
            <span>{m.msg}</span>
          </div>
        ))}
        <div ref={chatEndRef} />
      </div>

      {!isDrawer && (
        <div className="flex gap-2">
          <input
            value={guess}
            onChange={(e) => setGuess(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && sendGuess()}
            placeholder="Type your guess…"
            className="flex-1 rounded-md border border-white/10 bg-white/10 px-3 py-2 outline-none text-white placeholder:text-white/40"
          />
          <button
            onClick={sendGuess}
            className="px-3 py-2 rounded-md border border-white/10 bg-white/10"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
}