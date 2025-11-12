'use client';

import { useGameStore } from '@/store/useGameStore';
import { motion } from 'framer-motion';
import { Trophy, Crown, Medal } from 'lucide-react';

const rankIcons = [Crown, Medal, Trophy];

export default function FinalLeaderboard() {
  const { players, gameStarted, gameEnded, reset } = useGameStore();

  if (!gameEnded || gameStarted) return null;

  const sorted = [...players].sort((a, b) => b.score - a.score);
  const winner = sorted[0];

  const handlePlayAgain = () => {
    reset();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={handlePlayAgain}
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="bg-gradient-to-br from-purple-900/90 to-indigo-900/90 rounded-3xl p-8 max-w-md w-full border border-white/20 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="text-center mb-6">
          <Trophy className="w-16 h-16 mx-auto text-yellow-400 mb-2" />
          <h2 className="text-3xl font-bold text-white">Game Over!</h2>
          <p className="text-white/70 mt-1">Final Results</p>
        </div>

        {/* Leaderboard List */}
        <div className="space-y-3 mb-6">
          {sorted.map((p, i) => {
            const Icon = rankIcons[i] || null;
            const isWinner = i === 0;

            return (
              <motion.div
                key={p.id}
                initial={{ x: -50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: i * 0.1 }}
                className={`flex items-center justify-between p-4 rounded-xl border transition-all ${
                  isWinner
                    ? 'bg-gradient-to-r from-yellow-500/20 to-amber-500/20 border-yellow-400/50 shadow-lg shadow-yellow-500/20'
                    : 'bg-white/5 border-white/10'
                }`}
              >
                <div className="flex items-center gap-3">
                  {Icon && (
                    <Icon
                      className={`w-6 h-6 ${isWinner ? 'text-yellow-400' : 'text-white/60'}`}
                    />
                  )}
                  <span
                    className={`font-semibold ${isWinner ? 'text-yellow-100' : 'text-white'}`}
                  >
                    {i + 1}. {p.name}
                  </span>
                </div>
                <span
                  className={`text-lg font-bold ${isWinner ? 'text-yellow-300' : 'text-white/80'}`}
                >
                  {p.score}
                </span>
              </motion.div>
            );
          })}
        </div>

        {/* Play Again Button */}
        <button
          onClick={handlePlayAgain}
          className="w-full py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold rounded-xl hover:scale-105 active:scale-95 transition shadow-lg flex items-center justify-center gap-2"
        >
          <span>Play Again</span>
        </button>
      </motion.div>
    </motion.div>
  );
}