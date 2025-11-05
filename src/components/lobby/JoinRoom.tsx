// src/components/lobby/JoinRoom.tsx
'use client';

import { useState } from 'react';
import { Loader2 } from 'lucide-react';

interface JoinRoomProps {
  onJoin: (roomId: string, name: string) => void;
}

export default function JoinRoom({ onJoin }: JoinRoomProps) {
  const [roomId, setRoomId] = useState('');
  const [playerName, setPlayerName] = useState('');
  const [joining, setJoining] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const rid = roomId.trim().toUpperCase();
    const name = playerName.trim();
    if (!rid || !name) return;

    setJoining(true);
    onJoin(rid, name);
    // Simulate async join (socket handles real logic)
    setTimeout(() => setJoining(false), 500);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm text-white/70 mb-1">Room code</label>
          <input
            value={roomId}
            onChange={(e) => setRoomId(e.target.value)}
            placeholder="e.g., 8NZ3QK"
            className="w-full rounded-md border border-white/10 bg-white/10 px-3 py-2 outline-none text-white placeholder:text-white/40 focus:border-white/30 transition uppercase"
            required
            minLength={6}
            maxLength={6}
          />
        </div>
        <div>
          <label className="block text-sm text-white/70 mb-1">Your name</label>
          <input
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
            placeholder="e.g., Kumar"
            className="w-full rounded-md border border-white/10 bg-white/10 px-3 py-2 outline-none text-white placeholder:text-white/40 focus:border-white/30 transition"
            required
            minLength={1}
            maxLength={16}
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={joining || !roomId.trim() || !playerName.trim()}
        className="w-full py-3 rounded-xl bg-linear-to-r from-indigo-500 to-blue-500 text-white font-semibold shadow-lg active:scale-95 transition disabled:opacity-50 flex items-center justify-center gap-2"
      >
        {joining ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Joining…
          </>
        ) : (
          'Join Room'
        )}
      </button>
    </form>
  );
}