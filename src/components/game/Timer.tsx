'use client';

import { useGameStore } from '@/store/useGameStore';
import { Clock } from 'lucide-react';

export default function Timer() {
  const { timeLeft, round, maxRounds } = useGameStore();

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-sm font-medium">
      <Clock className="h-4 w-4 text-white/70" />
      <span className="tabular-nums text-white">{formatTime(timeLeft)}</span>
      <span className="text-white/40">•</span>
      <span className="text-white/80">
        Round {round} / {maxRounds}
      </span>
    </div>
  );
}