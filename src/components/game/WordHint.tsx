'use client';

import { useGameStore } from '@/store/useGameStore';
import { socket } from '@/lib/socket';
import { Eye, EyeOff, Sparkles } from 'lucide-react';

export default function WordHint() {
  const { currentWord, wordHint, players } = useGameStore();

  const me = players.find((p) => p.id === socket.id);
  const isDrawer = me?.isDrawer;

  if (!isDrawer && !wordHint) return null;

  return (
    <div
      className={`inline-flex items-center gap-3 rounded-xl border-2 px-4 py-2.5 text-sm font-bold shadow-lg backdrop-blur-sm transition-all ${
        isDrawer
          ? 'bg-gradient-to-r from-amber-500/20 to-orange-500/20 border-amber-400/50 text-amber-100'
          : 'bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border-cyan-400/50 text-cyan-100'
      }`}
    >
      {isDrawer ? (
        <>
          <Sparkles className="h-5 w-5 text-amber-300" />
          <span className="text-lg">Your word: <span className="underline font-black">{currentWord}</span></span>
        </>
      ) : (
        <>
          <EyeOff className="h-5 w-5 text-cyan-300" />
          <span className="text-lg tracking-widest font-mono">{wordHint}</span>
        </>
      )}
    </div>
  );
}