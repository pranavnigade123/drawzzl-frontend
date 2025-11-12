'use client';

import { useState, useRef, useEffect } from 'react';
import { useGameStore } from '@/store/useGameStore';
import { socket } from '@/lib/socket';
import { Send } from 'lucide-react';
import Card from '@/components/ui/Card';

export default function ChatBox() {
  const { roomId, players, chat, gameStarted } = useGameStore();
  const [guess, setGuess] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);

  const me = players.find((p) => p.id === socket.id);
  const isDrawer = me?.isDrawer;
  
  // In lobby (game not started), everyone uses chat
  // During game, drawer uses chat, others use guess
  const shouldUseChat = !gameStarted || isDrawer;

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
    <Card>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold">
          {shouldUseChat ? '💬 Chat' : '🎯 Guess the Word'}
        </h3>
        <span className="text-xs text-white/50 font-medium">
          {chat.length} messages
        </span>
      </div>

      {/* Chat Messages */}
      <div className="h-80 overflow-y-auto rounded-xl border border-white/10 bg-black/30 p-4 mb-4 space-y-2 scroll-smooth">
        {chat.length === 0 ? (
          <div className="h-full flex items-center justify-center text-white/40 text-sm">
            {shouldUseChat ? 'No messages yet...' : 'Start guessing!'}
          </div>
        ) : (
          chat.map((m, i) => (
            <div
              key={i}
              className="text-sm bg-white/5 rounded-lg px-3 py-2 animate-slide-in"
            >
              <span className="text-purple-400 font-semibold mr-2">
                {m.name}:
              </span>
              <span className="text-white/90">{m.msg}</span>
            </div>
          ))
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Input */}
      <div className="flex gap-2">
        <input
          value={guess}
          onChange={(e) => setGuess(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              if (shouldUseChat) {
                sendChat(guess);
                setGuess('');
              } else {
                sendGuess();
              }
            }
          }}
          placeholder={
            shouldUseChat ? 'Type a message...' : 'Type your guess...'
          }
          className="flex-1 rounded-xl border border-white/10 bg-white/5 px-4 py-3 outline-none text-white placeholder:text-white/40 focus:border-purple-500/50 focus:bg-white/10 transition-all duration-200"
          disabled={!roomId}
        />
        <button
          onClick={() => {
            if (shouldUseChat) {
              sendChat(guess);
              setGuess('');
            } else {
              sendGuess();
            }
          }}
          disabled={!guess.trim() || !roomId}
          className="px-4 py-3 rounded-xl border border-white/10 bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-500 hover:to-purple-400 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
        >
          <Send className="h-5 w-5" />
        </button>
      </div>
    </Card>
  );
}