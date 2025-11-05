'use client';

import { useGameStore } from '@/store/useGameStore';
import { socket } from '@/lib/socket';
import { Copy, Crown, Users } from 'lucide-react';

export default function RoomCard() {
  const { roomId, players, isCreator, gameStarted } = useGameStore();

  if (!roomId) return null;

  const copyRoomId = () => {
    if (roomId) navigator.clipboard.writeText(roomId);
  };

  const startGame = () => {
    if (roomId) {
      socket.emit('startGame', { roomId });
    }
  };

  return (
    <section className="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-[0_0_0_1px_rgba(255,255,255,0.04)] backdrop-blur">
      {/* Room Code */}
      <div className="mb-4">
        <div className="text-white/70 text-xs">Room Code</div>
        <div className="mt-1 flex items-center justify-between gap-3">
          <span className="text-lg font-semibold tracking-wider">{roomId}</span>
          <button
            onClick={copyRoomId}
            className="px-3 py-1 rounded-md border border-white/10 bg-white/10 text-xs flex items-center gap-1 hover:bg-white/20 transition"
          >
            <Copy className="w-3 h-3" />
            Copy
          </button>
        </div>
      </div>

      {/* Player List */}
      <div className="space-y-2 mb-4">
        {players.map((p) => (
          <div
            key={p.id}
            className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-white/80"
          >
            <div className="flex items-center gap-3">
              <div className="grid h-8 w-8 place-items-center rounded-md bg-linear-to-b from-white/20 to-white/0 border border-white/10">
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

      {/* Start Button */}
      {isCreator && players.length >= 2 && !gameStarted && (
        <button
          onClick={startGame}
          className="w-full py-3 bg-linear-to-r from-green-500 to-emerald-600 text-white font-bold rounded-xl hover:scale-105 transition active:scale-95 shadow-lg"
        >
          Start Game
        </button>
      )}
    </section>
  );
}