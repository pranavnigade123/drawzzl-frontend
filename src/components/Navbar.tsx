'use client';

import React from 'react';

interface NavbarProps {
  connected: boolean;
  reconnecting: boolean;
  roomId?: string;
  onLeaveGame: () => void;
}

export default function Navbar({ connected, reconnecting, roomId, onLeaveGame }: NavbarProps) {
  return (
    <header className="fixed top-0 left-0 right-0 z-[9999] bg-zinc-950/95 backdrop-blur-md border-b border-white/20 shadow-lg">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-bold">Drawzzl</h1>
          <div className="flex items-center gap-1">
            <div className={`w-2 h-2 rounded-full transition-colors ${
              reconnecting ? 'bg-yellow-400 animate-pulse' : 
              connected ? 'bg-green-400' : 'bg-red-400'
            }`} />
            <span className="text-xs text-white/60">
              {reconnecting ? 'Reconnecting...' : connected ? 'Connected' : 'Disconnected'}
            </span>
          </div>
          <p className="text-white/60 text-sm hidden sm:block">Real-time drawing & guessing</p>
        </div>
        
        {/* Leave Game Button - Show when in a room */}
        {roomId && (
          <button
            onClick={onLeaveGame}
            className="px-3 py-1.5 bg-red-500/30 border border-red-400/60 text-red-200 rounded-lg hover:bg-red-500/50 hover:scale-105 transition-all text-sm font-medium flex items-center gap-2"
            title="Leave current game and start fresh (Ctrl+L)"
          >
            🚪 Leave Game
          </button>
        )}
      </div>
    </header>
  );
}