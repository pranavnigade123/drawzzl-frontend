// src/components/lobby/RoomCard.tsx
'use client';

import { useGameStore } from '@/store/useGameStore';
import { Crown, Users, Copy, Loader2 } from 'lucide-react';
import { socket } from '@/lib/socket';

export default function RoomCard() {
  const { roomId, players, isCreator, gameStarted, setGameStarted } = useGameStore();

  const startGame = () => {
    if (!roomId) return;
    socket.emit('startGame', { roomId });
  };

  const copyRoomId = () => {
    if (roomId) navigator.clipboard.writeText(roomId);
  };

  if (!roomId) return null;

  return (
    <section className="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-[0_0_0_1px_rgba(255,255,255,0.04)]">
      <div className="mb-4">
        <div className="text-white/70 text-xs">Room Code</div>
        <div className="mt-1 flex items-center justify-between gap-3">
          <span className="text-lg font-semibold tracking-wider">{roomId}</span>
          <button
            onClick={copyRoomId}
            className="px-3 py-1 rounded-md border border-white/10 bg-white/10 text-xs flex items-center gap-1"
          >
            <Copy className="w-3 h-3" />
            Copy
          </button>
        </div>
      </div>

      <div className="space-y-2 mb-4">
        {players.map((p) => (
          <div
            key={p.id}
            className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-white/80"
          >
            <div className="flex items-center gap-3">
              <div className="grid h-8 w-8 place-items-center rounded-md bg-gradient-to-b from-white/20 to-white/0 border border-white/10">
                <Users className="h-4 w-4" />
              </div>
              <div className="flex items-center gap-2">
                <span className="font-medium">{p.name}</span>
                {p.isDrawer && (
                  <span className="inline-flex items-center gap-1 rounded-md border border-amber-400/30 bg-amber-400/10 px-2 py-0.5 text-[10px] font-semibold uppercase text-amber-100">
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

      {isCreator && players.length >= 2 && !gameStarted && (
        <button
          onClick={startGame}
          className="w-full py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold rounded-xl hover:scale-105 transition active:scale-95 shadow-lg"
        >
          Start Game
        </button>
      )}
    </section>
  );
}