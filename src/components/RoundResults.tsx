'use client';

import { AvatarDisplay } from './AvatarCreator';
import { Trophy, Award } from 'lucide-react';

interface Player {
  id: string;
  name: string;
  score: number;
  avatar?: number[];
  roundPoints?: number;
}

interface RoundResultsProps {
  word: string;
  players: Player[];
  correctGuessers: string[];
}

export default function RoundResults({ word, players, correctGuessers }: RoundResultsProps) {
  // Sort players by round points (highest first)
  const sortedPlayers = [...players].sort((a, b) => (b.roundPoints || 0) - (a.roundPoints || 0));

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-gradient-to-br from-zinc-900 to-zinc-800 rounded-2xl border border-white/20 p-6 md:p-8 max-w-2xl w-full shadow-2xl animate-scaleIn">
        {/* Word Reveal */}
        <div className="text-center mb-6 animate-slideInUp">
          <h2 className="text-lg md:text-xl text-white/70 mb-2">The word was</h2>
          <div className="text-3xl md:text-5xl font-bold bg-gradient-to-r from-fuchsia-400 via-cyan-400 to-indigo-400 bg-clip-text text-transparent mb-4">
            {word}
          </div>
        </div>

        {/* Round Scores */}
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
            <Award className="w-5 h-5 text-yellow-400" />
            Round Results
          </h3>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {sortedPlayers.map((player, idx) => {
              const guessedCorrectly = correctGuessers.includes(player.id);
              const isTopScorer = idx === 0 && (player.roundPoints || 0) > 0;

              return (
                <div
                  key={player.id}
                  className={`flex flex-col sm:flex-row items-start sm:items-center justify-between rounded-xl border px-4 py-3 transition-colors gap-2 sm:gap-0 ${
                    isTopScorer
                      ? 'bg-gradient-to-r from-yellow-500/20 to-amber-500/20 border-yellow-400/50'
                      : guessedCorrectly
                      ? 'bg-green-500/10 border-green-400/30'
                      : 'bg-white/5 border-white/10'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {isTopScorer && <Trophy className="w-5 h-5 text-yellow-400" />}
                    <AvatarDisplay avatar={player.avatar || [0, 0, 0, 0]} size={32} />
                    <span className="text-white font-medium">{player.name}</span>
                  </div>
                  <div className="flex items-center gap-3 sm:gap-4">
                    {(player.roundPoints || 0) > 0 ? (
                      <span className="text-green-400 font-bold text-base md:text-lg">
                        +{player.roundPoints}
                      </span>
                    ) : (
                      <span className="text-white/40 text-sm">No points</span>
                    )}
                    <span className="text-white/60 text-xs sm:text-sm">
                      Total: <span className="text-white font-semibold">{player.score}</span>
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Next Round Indicator */}
        <div className="text-center mt-6">
          <p className="text-white/60 text-sm">Next round starting soon...</p>
        </div>
      </div>
    </div>
  );
}
