'use client';

import { useState } from 'react';
import { Sparkles } from 'lucide-react';
import Button from '@/components/ui/Button';

interface CreateRoomProps {
  onCreate: (name: string) => void;
}

export default function CreateRoom({ onCreate }: CreateRoomProps) {
  const [playerName, setPlayerName] = useState('');
  const [creating, setCreating] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const name = playerName.trim();
    if (!name) return;

    setCreating(true);
    onCreate(name);
    setTimeout(() => setCreating(false), 1000);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="space-y-2">
        <label className="block text-sm font-medium text-white/80">
          Your Name
        </label>
        <input
          value={playerName}
          onChange={(e) => setPlayerName(e.target.value)}
          placeholder="Enter your name"
          className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 outline-none text-white placeholder:text-white/40 focus:border-purple-500/50 focus:bg-white/10 transition-all duration-200"
          required
          minLength={1}
          maxLength={16}
          autoFocus
        />
        <p className="text-xs text-white/50">This is how others will see you</p>
      </div>

      <Button
        type="submit"
        variant="primary"
        size="lg"
        fullWidth
        loading={creating}
        disabled={!playerName.trim()}
      >
        {!creating && <Sparkles className="w-5 h-5" />}
        Create Room
      </Button>
    </form>
  );
}