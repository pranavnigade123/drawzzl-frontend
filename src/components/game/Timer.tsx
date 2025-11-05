// src/components/game/Timer.tsx
'use client';

import { useGameStore } from '@/store/useGameStore';
import { Clock } from 'lucide-react';

export default function Timer() {
  const { timeLeft, round, maxRounds } = useGameStore();

  return (
    <div className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-1 text-sm">
      <Clock className="h-4 w-4" />
      <span className="tabular-nums">{timeLeft}s</span>
      <span className="text-white/40">•</span>
      <span>Round {round}/{maxRounds}</span>
    </div>
  );
}