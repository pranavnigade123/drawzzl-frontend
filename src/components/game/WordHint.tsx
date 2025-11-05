// src/components/game/WordHint.tsx
'use client';

import { useGameStore } from '@/store/useGameStore';

export default function WordHint() {
  const { currentWord, wordHint, players } = useGameStore();
  const me = players.find(p => p.id === (typeof window !== 'undefined' ? window.localStorage.getItem('socketId') : null) || p.id === '');
  const isDrawer = me?.isDrawer;

  if (!isDrawer && !wordHint) return null;

  return (
    <div className={`rounded-lg px-3 py-1 text-sm font-medium ${isDrawer ? 'bg-amber-400/10 border border-amber-400/30 text-amber-100' : 'bg-cyan-400/10 border border-cyan-400/30 text-cyan-100'}`}>
      {isDrawer ? (
        <>Draw: <span className="underline">{currentWord}</span></>
      ) : (
        <>{wordHint || 'Guess the word!'}</>
      )}
    </div>
  );
}