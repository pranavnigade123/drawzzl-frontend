'use client';

import { useState } from 'react';
import CreateRoom from './CreateRoom';
import JoinRoom from './JoinRoom';
import { socket } from '@/lib/socket';
import Card from '@/components/ui/Card';

type Mode = 'create' | 'join';

export default function ClientOnlyLobby() {
  const [mode, setMode] = useState<Mode>('create');

  const handleCreate = (name: string) => {
    socket.emit('createRoom', { playerName: name });
  };

  const handleJoin = (roomId: string, name: string) => {
    socket.emit('joinRoom', { roomId, playerName: name });
  };

  return (
    <Card variant="glass">
      {/* Tab Switcher */}
      <div className="mb-8 grid grid-cols-2 gap-2 rounded-xl bg-black/20 p-1.5 border border-white/10">
        <button
          onClick={() => setMode('create')}
          className={`rounded-lg px-4 py-3 text-sm font-semibold transition-all duration-200 ${
            mode === 'create'
              ? 'bg-gradient-to-r from-purple-600 to-purple-500 text-white shadow-lg shadow-purple-500/30'
              : 'text-white/60 hover:text-white hover:bg-white/5'
          }`}
        >
          Create Room
        </button>
        <button
          onClick={() => setMode('join')}
          className={`rounded-lg px-4 py-3 text-sm font-semibold transition-all duration-200 ${
            mode === 'join'
              ? 'bg-gradient-to-r from-cyan-600 to-cyan-500 text-white shadow-lg shadow-cyan-500/30'
              : 'text-white/60 hover:text-white hover:bg-white/5'
          }`}
        >
          Join Room
        </button>
      </div>

      {/* Content */}
      <div className="animate-fade-in">
        {mode === 'create' ? (
          <CreateRoom onCreate={handleCreate} />
        ) : (
          <JoinRoom onJoin={handleJoin} />
        )}
      </div>
    </Card>
  );
}