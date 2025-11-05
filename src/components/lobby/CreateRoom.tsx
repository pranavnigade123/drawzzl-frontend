'use client';

import { useState } from 'react';
import { Loader2 } from 'lucide-react';

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
    setTimeout(() => setCreating(false), 500);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
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

      <button
        type="submit"
        disabled={creating || !playerName.trim()}
        className="w-full py-3 rounded-xl bg-linear-to-r from-fuchsia-500 to-cyan-500 text-white font-semibold shadow-lg active:scale-95 transition disabled:opacity-50 flex items-center justify-center gap-2"
      >
        {creating ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Creating…
          </>
        ) : (
          'Create Room'
        )}
      </button>
    </form>
  );
}