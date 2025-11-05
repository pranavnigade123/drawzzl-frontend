'use client';

import { useState } from 'react';
import CreateRoom from './CreateRoom';
import JoinRoom from './JoinRoom';
import { socket } from '@/lib/socket';

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
    <section className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur">
      <div className="mb-6 grid grid-cols-2 rounded-xl border border-white/10 bg-white/5 p-1">
        <button
          onClick={() => setMode('create')}
          className={`rounded-lg px-4 py-2.5 text-sm font-medium transition ${
            mode === 'create'
              ? 'bg-linear-to-r from-fuchsia-500/30 to-cyan-500/30 text-white shadow-inner'
              : 'text-white/70 hover:text-white'
          }`}
        >
          Create room
        </button>
        <button
          onClick={() => setMode('join')}
          className={`rounded-lg px-4 py-2.5 text-sm font-medium transition ${
            mode === 'join'
              ? 'bg-linear-to-r from-fuchsia-500/30 to-cyan-500/30 text-white shadow-inner'
              : 'text-white/70 hover:text-white'
          }`}
        >
          Join room
        </button>
      </div>

      {mode === 'create' ? (
        <CreateRoom onCreate={handleCreate} />
      ) : (
        <JoinRoom onJoin={handleJoin} />
      )}
    </section>
  );
}