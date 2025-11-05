'use client';

import { useState, useRef, useEffect } from 'react';
import { useGameStore } from '@/store/useGameStore';
import { socket } from '@/lib/socket';
import { Send } from 'lucide-react';

export default function ChatBox() {
  const { roomId, players, chat, addChat } = useGameStore();
  const [guess, setGuess] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);

  const me = players.find((p) => p.id === socket.id);
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
      <h3 className="text-lg font-semibold mb-3">
        {isDrawer ? 'Chat' : 'Guess the Word'}
      </h3>

      {/* Chat Messages */}
      <div className="h-80 overflow-y-auto rounded-md border border-white/10 bg-black/20 p-3 mb-3 space-y-1">
        {chat.map((m, i) => (
          <div key={i} className="text-sm">
            <span className="text-white/60 mr-1">{m.name}:</span>
            <span className="text-white/90">{m.msg}</span>
          </div>
        ))}
        <div ref={chatEndRef} />
      </div>

      {/* Input */}
      <div className="flex gap-2">
        <input
          value={guess}
          onChange={(e) => setGuess(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              if (isDrawer) {
                sendChat(guess);
                setGuess('');
              } else {
                sendGuess();
              }
            }
          }}
          placeholder={isDrawer ? 'Send message...' : 'Type your guess...'}
          className="flex-1 rounded-md border border-white/10 bg-white/10 px-3 py-2 outline-none text-white placeholder:text-white/40 focus:border-white/30 transition"
          disabled={!roomId}
        />
        <button
          onClick={() => {
            if (isDrawer) {
              sendChat(guess);
              setGuess('');
            } else {
              sendGuess();
            }
          }}
          disabled={!guess.trim() || !roomId}
          className="px-3 py-2 rounded-md border border-white/10 bg-white/10 hover:bg-white/20 transition disabled:opacity-50"
        >
          <Send className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}