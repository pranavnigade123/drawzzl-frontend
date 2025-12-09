'use client';

import { useState, useEffect } from 'react';
import { Paintbrush, Users, Zap } from 'lucide-react';
import AvatarCreator, { AvatarDisplay } from './AvatarCreator';

interface LandingPageProps {
  onJoin: (playerName: string, avatar: number[], roomCode: string) => void;
  onCreateRoom: (playerName: string, avatar: number[]) => void;
}

export default function LandingPage({ onJoin, onCreateRoom }: LandingPageProps) {
  const [mode, setMode] = useState<'create' | 'join'>('create');
  const [playerName, setPlayerName] = useState('');
  const [roomCode, setRoomCode] = useState('');
  const [avatar, setAvatar] = useState<number[]>([0, 0, 0, 0]);
  const [showAvatarCreator, setShowAvatarCreator] = useState(false);

  // Check for room code in URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const roomParam = params.get('room');
    if (roomParam) {
      setMode('join');
      setRoomCode(roomParam.toUpperCase());
    }
  }, []);

  const validateAndSubmit = () => {
    // Name validation
    let finalName = playerName.trim();
    
    // Restrict length to 12 characters
    if (finalName.length > 12) {
      finalName = finalName.substring(0, 12);
    }
    
    // Assign guest name if empty
    if (!finalName) {
      finalName = `Guest${Math.floor(1000 + Math.random() * 9000)}`;
    }

    if (mode === 'create') {
      onCreateRoom(finalName, avatar);
    } else {
      if (!roomCode.trim()) {
        alert('Please enter a room code');
        return;
      }
      onJoin(finalName, avatar, roomCode.trim().toUpperCase());
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-zinc-950 text-white">
      {/* Background accents */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-32 -left-24 h-80 w-80 rounded-full bg-fuchsia-500/25 blur-3xl" />
        <div className="absolute top-1/3 -right-24 h-72 w-72 rounded-full bg-cyan-500/20 blur-3xl" />
        <div className="absolute -bottom-28 left-1/4 h-64 w-64 rounded-full bg-indigo-500/25 blur-3xl" />
      </div>

      <main className="relative z-10 max-w-6xl mx-auto px-4 py-6 md:py-10">
        {/* Header with Logo and Title */}
        <div className="flex items-start justify-between mb-8 md:mb-12 animate-fadeIn">
          {/* Left: Drawzzl Title */}
          <div className="flex items-center gap-2 md:gap-3">
            <Paintbrush className="w-8 h-8 md:w-12 md:h-12 text-fuchsia-400" />
            <div>
              <h1 className="text-3xl md:text-5xl font-bold bg-gradient-to-r from-fuchsia-400 via-cyan-400 to-indigo-400 bg-clip-text text-transparent">
                Drawzzl
              </h1>
              <p className="text-xs md:text-sm text-white/60 mt-1">Real-time drawing & guessing</p>
            </div>
          </div>
          
          {/* Right: Parent Company Logo */}
          <div className="flex items-center">
            <img 
              src="/logo dark bg.png" 
              alt="Company Logo" 
              className="h-10 md:h-14 w-auto opacity-90 hover:opacity-100 transition-opacity"
            />
          </div>
        </div>

        {/* Hero Section */}
        <div className="text-center mb-8 md:mb-12">
          <p className="text-lg md:text-xl text-white/70 mb-6 md:mb-8">
            Draw, guess, and compete in real-time!
          </p>

          {/* Features */}
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-3 md:gap-4 max-w-3xl mx-auto mb-8 md:mb-12">
            <div className="rounded-xl border border-white/10 bg-white/5 p-4 transition-all hover:border-white/20 hover:scale-105">
              <Zap className="w-6 h-6 md:w-8 md:h-8 text-yellow-400 mx-auto mb-2" />
              <h3 className="font-semibold mb-1 text-sm md:text-base">Fast-Paced</h3>
              <p className="text-xs md:text-sm text-white/60">Speed matters! Guess quickly for more points</p>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/5 p-4 transition-all hover:border-white/20 hover:scale-105">
              <Users className="w-6 h-6 md:w-8 md:h-8 text-cyan-400 mx-auto mb-2" />
              <h3 className="font-semibold mb-1 text-sm md:text-base">Multiplayer</h3>
              <p className="text-xs md:text-sm text-white/60">Play with friends in private rooms</p>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/5 p-4 transition-all hover:border-white/20 hover:scale-105 sm:col-span-2 md:col-span-1">
              <Paintbrush className="w-6 h-6 md:w-8 md:h-8 text-fuchsia-400 mx-auto mb-2" />
              <h3 className="font-semibold mb-1 text-sm md:text-base">Creative</h3>
              <p className="text-xs md:text-sm text-white/60">Express yourself with drawing tools</p>
            </div>
          </div>
        </div>

        {/* Main Form */}
        <div className="max-w-md mx-auto animate-scaleIn">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4 md:p-6 shadow-[0_0_0_1px_rgba(255,255,255,0.04)]">
            {/* Mode Toggle */}
            <div className="mb-6 grid grid-cols-2 rounded-xl border border-white/10 bg-white/5 p-1">
              <button
                onClick={() => setMode('create')}
                className={`w-full rounded-lg px-4 py-2.5 text-sm font-medium transition ${
                  mode === 'create'
                    ? 'bg-gradient-to-r from-fuchsia-500/30 to-cyan-500/30 text-white shadow-inner'
                    : 'text-white/70 hover:text-white'
                }`}
              >
                Create Room
              </button>
              <button
                onClick={() => setMode('join')}
                className={`w-full rounded-lg px-4 py-2.5 text-sm font-medium transition ${
                  mode === 'join'
                    ? 'bg-gradient-to-r from-fuchsia-500/30 to-cyan-500/30 text-white shadow-inner'
                    : 'text-white/70 hover:text-white'
                }`}
              >
                Join Room
              </button>
            </div>

            {/* Avatar Section */}
            <div className="mb-6">
              <label className="block text-sm text-white/70 mb-2">Your Avatar</label>
              <button
                onClick={() => setShowAvatarCreator(!showAvatarCreator)}
                className="w-full"
              >
                <div className="flex items-center gap-3 p-3 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 transition cursor-pointer">
                  <AvatarDisplay avatar={avatar} size={48} />
                  <span className="text-sm text-white/60">Click to customize</span>
                </div>
              </button>

              {showAvatarCreator && (
                <div className="mt-4 p-4 rounded-lg border border-white/10 bg-white/5">
                  <AvatarCreator avatar={avatar} onChange={setAvatar} />
                </div>
              )}
            </div>

            {/* Name Input */}
            <div className="mb-4">
              <label className="block text-sm text-white/70 mb-2">
                Your Name {playerName.length > 0 && `(${playerName.length}/12)`}
              </label>
              <input
                type="text"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value.slice(0, 12))}
                placeholder="Enter your name (or leave blank for Guest)"
                className="w-full rounded-lg border border-white/10 bg-white/10 px-4 py-3 outline-none focus:border-fuchsia-400 transition"
                maxLength={12}
              />
            </div>

            {/* Room Code (Join Mode) */}
            {mode === 'join' && (
              <div className="mb-4">
                <label className="block text-sm text-white/70 mb-2">Room Code</label>
                <input
                  type="text"
                  value={roomCode}
                  onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                  placeholder="e.g., ABC123"
                  className="w-full rounded-lg border border-white/10 bg-white/10 px-4 py-3 outline-none focus:border-cyan-400 transition uppercase"
                  maxLength={6}
                />
              </div>
            )}

            {/* Submit Button */}
            <button
              onClick={validateAndSubmit}
              className={`w-full py-3 rounded-xl font-semibold shadow-lg hover:scale-105 active:scale-95 transition-transform ${
                mode === 'create'
                  ? 'bg-gradient-to-r from-fuchsia-500 to-cyan-500 text-white'
                  : 'bg-gradient-to-r from-indigo-500 to-blue-500 text-white'
              }`}
            >
              {mode === 'create' ? 'Create Room' : 'Join Room'}
            </button>
          </div>

          {/* Info Text */}
          <p className="text-center text-sm text-white/50 mt-4">
            {mode === 'create'
              ? 'Create a room and invite your friends to play!'
              : 'Enter the room code shared by your friend'}
          </p>
        </div>
      </main>
    </div>
  );
}
