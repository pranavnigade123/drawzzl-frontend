'use client';

import { Crown, Settings } from 'lucide-react';
import { AvatarDisplay } from './AvatarCreator';

interface Player {
  id: string;
  name: string;
  score: number;
  isDrawer?: boolean;
  avatar?: number[];
}

interface PlayersListProps {
  players: Player[];
  isCreator: boolean;
  gameStarted: boolean;
  onShowSettings: () => void;
  onStartGame: () => void;
  onLeaveGame: () => void;
}

export default function PlayersList({ 
  players, 
  isCreator, 
  gameStarted, 
  onShowSettings, 
  onStartGame,
  onLeaveGame
}: PlayersListProps) {
  return (
    <section className="rounded-2xl border border-white/10 bg-white/5 p-4 md:p-6 shadow-[0_0_0_1px_rgba(255,255,255,0.04)] transition-all hover:border-white/20 hover:shadow-lg">
      <div className="space-y-2">
        {players.map((p, idx) => (
          <div
            key={p.id}
            className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-white/80 transition-all hover:bg-white/10 hover:scale-[1.01]"
          >
            <div className="flex items-center gap-3">
              <AvatarDisplay avatar={p.avatar || [0, 0, 0, 0]} size={32} />
              <div className="flex items-center gap-2">
                <span className="font-medium">{p.name}</span>
                {idx === 0 && (
                  <span className="inline-flex items-center gap-1 rounded-md border border-fuchsia-400/30 bg-fuchsia-400/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-fuchsia-100">
                    <Crown className="h-3 w-3" />
                    Host
                  </span>
                )}
                {p.isDrawer && (
                  <span className="inline-flex items-center gap-1 rounded-md border border-amber-400/30 bg-amber-400/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-amber-100">
                    <Crown className="h-3 w-3" />
                    Drawer
                  </span>
                )}
              </div>
            </div>
            <span className="text-sm text-white/60">Score {p.score}</span>
          </div>
        ))}
      </div>

      {/* Action buttons for all players */}
      <div className="mt-4 space-y-2">
        {isCreator && (
          <>
            <button
              onClick={onShowSettings}
              className="w-full py-2.5 flex items-center justify-center gap-2 border border-white/10 bg-white/5 text-white font-medium rounded-xl hover:bg-white/10 transition"
            >
              <Settings className="w-4 h-4" />
              Game Settings
            </button>
            {players.length >= 2 && !gameStarted && (
              <button
                onClick={onStartGame}
                className="w-full py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold rounded-xl hover:scale-105 transition-transform active:scale-95 shadow-lg"
              >
                Start Game
              </button>
            )}
          </>
        )}
        
        {/* Leave Game button - available to all players */}
        <button
          onClick={onLeaveGame}
          className="w-full py-2.5 flex items-center justify-center gap-2 border border-red-400/50 bg-red-500/20 text-red-300 font-medium rounded-xl hover:bg-red-500/30 hover:scale-105 transition-all"
        >
          🚪 Leave Game
        </button>
      </div>
    </section>
  );
}