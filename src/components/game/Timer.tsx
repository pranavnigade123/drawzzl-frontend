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

  const isLowTime = timeLeft <= 10;

  return (
    <div
      className={`inline-flex items-center gap-3 rounded-xl border-2 px-4 py-2.5 text-sm font-bold shadow-lg transition-all duration-200 ${
        isLowTime
          ? 'border-red-500/50 bg-gradient-to-r from-red-500/20 to-orange-500/20 animate-pulse'
          : 'border-white/20 bg-white/10 backdrop-blur-sm'
      }`}
    >
      <Clock className={`h-5 w-5 ${isLowTime ? 'text-red-400' : 'text-white/80'}`} />
      <span className={`tabular-nums text-lg ${isLowTime ? 'text-red-300' : 'text-white'}`}>
        {formatTime(timeLeft)}
      </span>
      <span className="text-white/40">•</span>
      <span className="text-white/90">
        Round {round}/{maxRounds}
      </span>
    </div>
  );
}