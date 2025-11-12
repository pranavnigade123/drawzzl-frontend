'use client';

import { useState } from 'react';
import { LogIn } from 'lucide-react';
import Button from '@/components/ui/Button';

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
    setTimeout(() => setJoining(false), 1000);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="space-y-4">
        <div className="space-y-2">
          <label className="block text-sm font-medium text-white/80">
            Room Code
          </label>
          <input
            value={roomId}
            onChange={(e) => setRoomId(e.target.value)}
            placeholder="ABC123"
            className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 outline-none text-white placeholder:text-white/40 focus:border-cyan-500/50 focus:bg-white/10 transition-all duration-200 uppercase tracking-wider text-center text-lg font-mono"
            required
            minLength={6}
            maxLength={6}
            autoFocus
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-white/80">
            Your Name
          </label>
          <input
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
            placeholder="Enter your name"
            className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 outline-none text-white placeholder:text-white/40 focus:border-cyan-500/50 focus:bg-white/10 transition-all duration-200"
            required
            minLength={1}
            maxLength={16}
          />
        </div>
      </div>

      <Button
        type="submit"
        variant="secondary"
        size="lg"
        fullWidth
        loading={joining}
        disabled={!roomId.trim() || !playerName.trim()}
      >
        {!joining && <LogIn className="w-5 h-5" />}
        Join Room
      </Button>
    </form>
  );
}