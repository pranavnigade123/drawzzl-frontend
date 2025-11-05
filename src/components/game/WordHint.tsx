'use client';

import { useGameStore } from '@/store/useGameStore';
import { socket } from '@/lib/socket';
import { Eye, EyeOff } from 'lucide-react';

export default function WordHint() {
  const { currentWord, wordHint, players } = useGameStore();

  const me = players.find((p) => p.id === socket.id);
  const isDrawer = me?.isDrawer;

  if (!isDrawer && !wordHint) return null;

  return (
    <div
      className={`inline-flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-medium transition-all ${
        isDrawer
          ? 'bg-amber-400/10 border border-amber-400/30 text-amber-100'
          : 'bg-cyan-400/10 border border-cyan-400/30 text-cyan-100'
      }`}
    >
      {isDrawer ? (
        <>
          <Eye className="h-4 w-4" />
          <span className="underline">{currentWord}</span>
        </>
      ) : (
        <>
          <EyeOff className="h-4 w-4" />
          <span>{wordHint}</span>
        </>
      )}
    </div>
  );
}