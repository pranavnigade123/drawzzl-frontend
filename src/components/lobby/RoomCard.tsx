'use client';

import { useGameStore } from '@/store/useGameStore';
import { socket } from '@/lib/socket';
import { Copy, Crown, Users, Check, Play } from 'lucide-react';
import { useState } from 'react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';

export default function RoomCard() {
  const { roomId, players, isCreator, gameStarted } = useGameStore();
  const [copied, setCopied] = useState(false);

  if (!roomId) return null;

  const copyRoomId = () => {
    if (roomId) {
      navigator.clipboard.writeText(roomId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const startGame = () => {
    if (roomId) {
      socket.emit('startGame', { roomId });
    }
  };

  return (
    <Card>
      {/* Room Code */}
      <div className="mb-6">
        <div className="text-white/60 text-xs font-medium uppercase tracking-wider mb-2">
          Room Code
        </div>
        <div className="flex items-center justify-between gap-3 bg-black/20 rounded-xl p-4 border border-white/10">
          <span className="text-2xl font-bold tracking-widest font-mono text-purple-400">
            {roomId}
          </span>
          <button
            onClick={copyRoomId}
            className="px-3 py-2 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 text-xs font-medium flex items-center gap-2 transition-all duration-200 active:scale-95"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-green-400" />
                <span className="text-green-400">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                Copy
              </>
            )}
          </button>
        </div>
      </div>

      {/* Player List */}
      <div className="mb-6">
        <div className="text-white/60 text-xs font-medium uppercase tracking-wider mb-3">
          Players ({players.length}/8)
        </div>
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {players.map((p, index) => (
            <div
              key={p.id}
              className="flex items-center justify-between rounded-xl border border-white/10 bg-gradient-to-r from-white/5 to-transparent px-4 py-3 text-white/90 animate-slide-in"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div className="flex items-center gap-3">
                <div className="grid h-10 w-10 place-items-center rounded-lg bg-gradient-to-br from-purple-500/20 to-cyan-500/20 border border-white/10">
                  <Users className="h-5 w-5 text-purple-300" />
                </div>
                <div className="flex flex-col">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">{p.name}</span>
                    {p.isDrawer && (
                      <span className="inline-flex items-center gap-1 rounded-md bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-400/30 px-2 py-0.5 text-[10px] font-bold uppercase text-amber-200">
                        <Crown className="h-3 w-3" />
                        Drawing
                      </span>
                    )}
                  </div>
                  {gameStarted && (
                    <span className="text-xs text-white/50">
                      {p.score} points
                    </span>
                  )}
                </div>
              </div>
              {!gameStarted && (
                <span className="text-sm font-semibold text-white/40">
                  Ready
                </span>
              )}
              {gameStarted && (
                <span className="text-lg font-bold text-purple-400">
                  {p.score}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Start Button */}
      {isCreator && players.length >= 2 && !gameStarted && (
        <Button
          onClick={startGame}
          variant="success"
          size="lg"
          fullWidth
        >
          <Play className="w-5 h-5" />
          Start Game
        </Button>
      )}

      {/* Waiting Message */}
      {!isCreator && !gameStarted && (
        <div className="text-center py-3 px-4 rounded-xl bg-white/5 border border-white/10">
          <p className="text-sm text-white/60">
            Waiting for host to start the game...
          </p>
        </div>
      )}

      {/* Need More Players */}
      {isCreator && players.length < 2 && !gameStarted && (
        <div className="text-center py-3 px-4 rounded-xl bg-amber-500/10 border border-amber-500/30">
          <p className="text-sm text-amber-200">
            Need at least 2 players to start
          </p>
        </div>
      )}
    </Card>
  );
}