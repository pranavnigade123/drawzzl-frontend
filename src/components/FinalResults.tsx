'use client';

import { useState, useEffect } from 'react';
import { AvatarDisplay } from './AvatarCreator';
import { Trophy, Crown, Medal, Star, Home, RotateCcw, Sparkles } from 'lucide-react';

interface Player {
  id: string;
  name: string;
  score: number;
  avatar?: number[];
}

interface FinalResultsProps {
  players: Player[];
  onReturnToLobby: () => void;
  onQuit: () => void;
}

export default function FinalResults({ players, onReturnToLobby, onQuit }: FinalResultsProps) {
  const [showConfetti, setShowConfetti] = useState(false);
  
  // Sort players by score
  const sortedPlayers = [...players].sort((a, b) => b.score - a.score);
  const top3 = sortedPlayers.slice(0, 3);

  useEffect(() => {
    // Trigger confetti animation
    setShowConfetti(true);
    const timer = setTimeout(() => setShowConfetti(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  // Generate positions for floating avatars (limited to top 6 for performance)
  const getFloatingStyle = (index: number) => {
    const positions = [
      { top: '10%', left: '5%' },
      { top: '20%', right: '8%' },
      { top: '60%', left: '10%' },
      { top: '70%', right: '15%' },
      { top: '40%', left: '3%' },
      { top: '50%', right: '5%' },
    ];
    return positions[index % positions.length];
  };

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-purple-900 via-indigo-900 to-blue-900 z-50 overflow-y-auto overflow-x-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 opacity-20 pointer-events-none">
        <div className="absolute top-0 left-0 w-96 h-96 bg-fuchsia-500 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-cyan-500 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-indigo-500 rounded-full blur-3xl" />
      </div>

      {/* Floating Avatars - Limited to top 6 players for performance */}
      <div className="fixed inset-0 pointer-events-none">
        {players.slice(0, 6).map((player, idx) => {
          const style = getFloatingStyle(idx);
          return (
            <div
              key={player.id}
              className="absolute animate-float opacity-20"
              style={{
                ...style,
                animationDelay: `${idx * 0.5}s`,
              }}
            >
              <AvatarDisplay avatar={player.avatar || [0, 0, 0, 0]} size={60} />
            </div>
          );
        })}
      </div>

      {/* Confetti Effect - Reduced count for performance */}
      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none">
          {Array.from({ length: 30 }).map((_, i) => (
            <div
              key={i}
              className="absolute animate-confetti"
              style={{
                left: `${Math.random() * 100}%`,
                top: '-10%',
                animationDelay: `${Math.random() * 1}s`,
              }}
            >
              <Sparkles className="w-4 h-4 text-yellow-400" />
            </div>
          ))}
        </div>
      )}

      {/* Main Content */}
      <div className="relative z-10 flex items-center justify-center min-h-screen p-4 md:p-8 py-8">
        <div className="max-w-4xl w-full">
          {/* Header */}
          <div className="text-center mb-8 md:mb-12 animate-slideInUp">
            <Trophy className="w-16 h-16 md:w-24 md:h-24 mx-auto mb-4 text-yellow-400" />
            <h1 className="text-4xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-yellow-400 via-orange-400 to-pink-400 bg-clip-text text-transparent">
              Game Over!
            </h1>
            <p className="text-lg md:text-2xl text-white/80">Final Rankings</p>
          </div>

          {/* Podium - Top 3 */}
          <div className="grid grid-cols-3 gap-2 md:gap-4 mb-8 md:mb-12 max-w-2xl mx-auto">
            {/* 2nd Place */}
            {top3[1] && (
              <div className="flex flex-col items-center">
                <div className="relative mb-2 md:mb-4">
                  <div className="absolute -top-2 -right-2 bg-gray-400 rounded-full p-1 md:p-2">
                    <Medal className="w-4 h-4 md:w-6 md:h-6 text-white" />
                  </div>
                  <AvatarDisplay avatar={top3[1].avatar || [0, 0, 0, 0]} size={window.innerWidth < 768 ? 60 : 80} />
                </div>
                <div className="bg-gradient-to-b from-gray-400 to-gray-600 rounded-t-xl px-3 md:px-6 py-4 md:py-8 w-full text-center">
                  <div className="text-white font-bold text-sm md:text-base mb-1 truncate">{top3[1].name}</div>
                  <div className="text-2xl md:text-3xl font-bold text-white">{top3[1].score}</div>
                  <div className="text-xs md:text-sm text-white/70 mt-1">2nd Place</div>
                </div>
              </div>
            )}

            {/* 1st Place */}
            {top3[0] && (
              <div className="flex flex-col items-center">
                <div className="relative mb-2 md:mb-4">
                  <div className="absolute -top-2 -right-2 bg-yellow-400 rounded-full p-1 md:p-2">
                    <Crown className="w-5 h-5 md:w-8 md:h-8 text-white" />
                  </div>
                  <div className="ring-4 ring-yellow-400 rounded-full">
                    <AvatarDisplay avatar={top3[0].avatar || [0, 0, 0, 0]} size={window.innerWidth < 768 ? 80 : 100} />
                  </div>
                </div>
                <div className="bg-gradient-to-b from-yellow-400 to-orange-500 rounded-t-xl px-3 md:px-6 py-6 md:py-12 w-full text-center shadow-2xl">
                  <div className="text-white font-bold text-base md:text-lg mb-2 truncate">{top3[0].name}</div>
                  <div className="text-3xl md:text-5xl font-bold text-white">{top3[0].score}</div>
                  <div className="text-sm md:text-base text-white/90 mt-2 font-semibold">🏆 Winner!</div>
                </div>
              </div>
            )}

            {/* 3rd Place */}
            {top3[2] && (
              <div className="flex flex-col items-center">
                <div className="relative mb-2 md:mb-4">
                  <div className="absolute -top-2 -right-2 bg-amber-600 rounded-full p-1 md:p-2">
                    <Star className="w-4 h-4 md:w-6 md:h-6 text-white" />
                  </div>
                  <AvatarDisplay avatar={top3[2].avatar || [0, 0, 0, 0]} size={window.innerWidth < 768 ? 60 : 80} />
                </div>
                <div className="bg-gradient-to-b from-amber-600 to-amber-800 rounded-t-xl px-3 md:px-6 py-4 md:py-8 w-full text-center">
                  <div className="text-white font-bold text-sm md:text-base mb-1 truncate">{top3[2].name}</div>
                  <div className="text-2xl md:text-3xl font-bold text-white">{top3[2].score}</div>
                  <div className="text-xs md:text-sm text-white/70 mt-1">3rd Place</div>
                </div>
              </div>
            )}
          </div>

          {/* Full Rankings */}
          {sortedPlayers.length > 3 && (
            <div className="bg-white/10 rounded-2xl border border-white/20 p-4 md:p-6 mb-6 md:mb-8 max-w-2xl mx-auto animate-fadeIn">
              <h3 className="text-lg md:text-xl font-bold text-white mb-4 flex items-center gap-2">
                <Trophy className="w-5 h-5 text-yellow-400" />
                Complete Rankings
              </h3>
              <div className="space-y-2 max-h-48 md:max-h-64 overflow-y-auto">
                {sortedPlayers.map((player, idx) => (
                  <div
                    key={player.id}
                    className={`flex items-center justify-between rounded-xl px-3 md:px-4 py-2 md:py-3 transition-colors ${
                      idx < 3
                        ? 'bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-400/30'
                        : 'bg-white/5 border border-white/10'
                    }`}
                  >
                    <div className="flex items-center gap-2 md:gap-3">
                      <span className={`text-lg md:text-2xl font-bold ${idx < 3 ? 'text-yellow-400' : 'text-white/60'}`}>
                        #{idx + 1}
                      </span>
                      <AvatarDisplay avatar={player.avatar || [0, 0, 0, 0]} size={window.innerWidth < 768 ? 32 : 40} />
                      <span className="text-white font-medium text-sm md:text-base truncate max-w-[120px] md:max-w-none">{player.name}</span>
                    </div>
                    <span className="text-white font-bold text-lg md:text-2xl">{player.score}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 md:gap-4 max-w-2xl mx-auto animate-fadeIn">
            <button
              onClick={onReturnToLobby}
              className="flex-1 py-3 md:py-4 px-6 md:px-8 rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold text-base md:text-lg shadow-2xl hover:scale-105 active:scale-95 transition-transform flex items-center justify-center gap-2"
            >
              <Home className="w-5 h-5" />
              Return to Lobby
            </button>
            <button
              onClick={onQuit}
              className="flex-1 py-3 md:py-4 px-6 md:px-8 rounded-xl bg-red-500/20 border border-red-400/30 text-red-300 font-bold text-base md:text-lg hover:bg-red-500/30 hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              <RotateCcw className="w-5 h-5" />
              Quit
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
