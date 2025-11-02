'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { socket } from '@/lib/socket';
import Canvas from './Canvas';
import { Crown, Loader2, Users, Send, Clock } from 'lucide-react';

type Mode = 'create' | 'join';

interface Player {
  id: string;
  name: string;
  score: number;
  isDrawer?: boolean;
}

interface ChatItem {
  id: string;
  name: string;
  msg: string;
}

export default function Lobby() {
  // view state
  const [mounted, setMounted] = useState(false);
  const [mode, setMode] = useState<Mode>('create');

  // room state
  const [roomId, setRoomId] = useState('');
  const [players, setPlayers] = useState<Player[]>([]);
  const [isCreator, setIsCreator] = useState(false);

  // game state
  const [gameStarted, setGameStarted] = useState(false);
  const [iAmDrawer, setIAmDrawer] = useState(false);
  const [currentWord, setCurrentWord] = useState<string | undefined>(undefined);
  const [wordHint, setWordHint] = useState<string>('');
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [round, setRound] = useState<number>(1);
  const [maxRounds, setMaxRounds] = useState<number>(3);

  // chat / guess
  const [chat, setChat] = useState<ChatItem[]>([]);
  const [guess, setGuess] = useState('');
  const chatEndRef = useRef<HTMLDivElement | null>(null);

  // forms
  const [createForm, setCreateForm] = useState({ playerName: '' });
  const [joinForm, setJoinForm] = useState({ roomId: '', playerName: '' });
  const [joining, setJoining] = useState(false);
  const [creating, setCreating] = useState(false);

  // derived
  const me = useMemo(
    () => players.find((p) => p.id === socket.id),
    [players]
  );

  useEffect(() => {
    setMounted(true);

    // ----- handlers from server -----
    const onRoomCreated = (data: { roomId: string; playerId: string }) => {
      setRoomId(data.roomId);
      setIsCreator(true);
    };

    const onRoomJoined = (data: { roomId: string }) => {
      setRoomId(data.roomId);
      setIsCreator(false);
    };

    const onPlayerJoined = (data: { players: Player[] }) => {
      setPlayers(data.players || []);
    };

    const onGameStarted = (d: {
      drawerId: string;
      wordHint: string;
      timeLeft: number;
      round?: number;
      maxRounds?: number;
    }) => {
      setGameStarted(true);
      setCurrentWord(undefined);
      setWordHint(d.wordHint);
      setTimeLeft(d.timeLeft ?? 60);
      setRound(d.round ?? 1);
      setMaxRounds(d.maxRounds ?? 3);
      setIAmDrawer(socket.id === d.drawerId);
      // Mark drawer flag on our local list (optional)
      setPlayers((prev) =>
        prev.map((p) => ({ ...p, isDrawer: p.id === d.drawerId }))
      );
    };

    const onYourWord = ({ word }: { word: string }) => {
      setCurrentWord(word);
    };

    const onTick = ({ timeLeft }: { timeLeft: number }) => {
      setTimeLeft(timeLeft);
    };

    const onCorrectGuess = (p: {
      playerId: string;
      name: string;
      points: number;
      total: number;
    }) => {
      // brief feed line
      setChat((c) => [
        ...c,
        { id: p.playerId, name: p.name, msg: `guessed it! (+${p.points})` },
      ]);
      // update that player's score locally
      setPlayers((prev) =>
        prev.map((pl) =>
          pl.id === p.playerId ? { ...pl, score: p.total } : pl
        )
      );
    };

    const onTurnEnded = (d: {
      word: string;
      correctGuessers: string[];
      drawerBonus: number;
    }) => {
      setChat((c) => [
        ...c,
        { id: 'server', name: 'Game', msg: `Word was: ${d.word}` },
      ]);
      setCurrentWord(undefined);
      setWordHint('');
      setIAmDrawer(false);
    };

    const onGameOver = (d: { players: Player[] }) => {
      // sort and show quick summary in chat (minimal UI, we will add a modal later)
      const sorted = [...d.players].sort((a, b) => b.score - a.score);
      setChat((c) => [
        ...c,
        { id: 'server', name: 'Game', msg: 'Game over! Final leaderboard:' },
        ...sorted.map((p, i) => ({
          id: `rank-${i}`,
          name: `${i + 1}. ${p.name}`,
          msg: `Score ${p.score}`,
        })),
      ]);
      setGameStarted(false);
      setCurrentWord(undefined);
      setWordHint('');
      setTimeLeft(0);
      setRound(1);
    };

    const onChat = ({ id, name, msg }: ChatItem) => {
      setChat((c) => [...c, { id, name, msg }]);
    };

    const onError = (data: { message: string }) => {
      setChat((c) => [
        ...c,
        { id: 'error', name: 'Error', msg: data.message },
      ]);
    };

    // subscribe
    socket.on('roomCreated', onRoomCreated);
    socket.on('roomJoined', onRoomJoined);
    socket.on('playerJoined', onPlayerJoined);
    socket.on('gameStarted', onGameStarted);
    socket.on('yourWord', onYourWord);
    socket.on('tick', onTick);
    socket.on('correctGuess', onCorrectGuess);
    socket.on('turnEnded', onTurnEnded);
    socket.on('gameOver', onGameOver);
    socket.on('chat', onChat);
    socket.on('error', onError);

    return () => {
      socket.off('roomCreated', onRoomCreated);
      socket.off('roomJoined', onRoomJoined);
      socket.off('playerJoined', onPlayerJoined);
      socket.off('gameStarted', onGameStarted);
      socket.off('yourWord', onYourWord);
      socket.off('tick', onTick);
      socket.off('correctGuess', onCorrectGuess);
      socket.off('turnEnded', onTurnEnded);
      socket.off('gameOver', onGameOver);
      socket.off('chat', onChat);
      socket.off('error', onError);
    };
  }, []);

  useEffect(() => {
    // autoscroll chat
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chat]);

  // ----- client emits -----
  const onCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!createForm.playerName.trim()) return;
    setCreating(true);
    socket.emit('createRoom', { playerName: createForm.playerName.trim() });
    setTimeout(() => setCreating(false), 300);
  };

  const onJoin = (e: React.FormEvent) => {
    e.preventDefault();
    const rid = joinForm.roomId.trim().toUpperCase();
    const name = joinForm.playerName.trim();
    if (!rid || !name) return;
    setJoining(true);
    socket.emit('joinRoom', { roomId: rid, playerName: name });
    setTimeout(() => setJoining(false), 300);
  };

  const startGame = () => {
    if (!roomId) return;
    socket.emit('startGame', { roomId });
  };

  const sendGuess = () => {
    const g = guess.trim();
    if (!g || !roomId) return;
    // Always emit as "guess"; server will echo wrong ones as chat
    socket.emit('guess', { roomId, guess: g, name: me?.name || 'Me' });
    setGuess('');
  };

  const sendChat = (msg: string) => {
    if (!msg.trim() || !roomId) return;
    socket.emit('chat', { roomId, msg: msg.trim(), name: me?.name || 'Me' });
  };

  if (!mounted) {
    return (
      <div className="min-h-screen relative overflow-hidden bg-zinc-950 flex items-center justify-center">
        <div className="text-white/80 text-xl inline-flex items-center gap-2">
          <Loader2 className="h-5 w-5 animate-spin" />
          Loading
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden bg-zinc-950 text-white">
      {/* background accents */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-32 -left-24 h-80 w-80 rounded-full bg-fuchsia-500/25 blur-3xl" />
        <div className="absolute top-1/3 -right-24 h-72 w-72 rounded-full bg-cyan-500/20 blur-3xl" />
        <div className="absolute -bottom-28 left-1/4 h-64 w-64 rounded-full bg-indigo-500/25 blur-3xl" />
      </div>

      <main className="relative z-10 max-w-6xl mx-auto px-4 py-10">
        <header className="mb-8">
          <h1 className="text-2xl font-bold">Drawzzl</h1>
          <p className="text-white/60 text-sm">Real-time drawing & guessing</p>
        </header>

        {roomId && !gameStarted ? (
          // ======= LOBBY VIEW =======
          <div className="grid lg:grid-cols-3 gap-6">
            {/* room card */}
            <section className="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-[0_0_0_1px_rgba(255,255,255,0.04)]">
              <div className="mb-4">
                <div className="text-white/70 text-xs">Room</div>
                <div className="mt-1 flex items-center justify-between gap-3">
                  <span className="text-lg font-semibold tracking-wider">{roomId}</span>
                  <button
                    onClick={() => navigator.clipboard.writeText(roomId)}
                    className="px-3 py-1 rounded-md border border-white/10 bg-white/10 text-xs"
                  >
                    Copy
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                {players.map((p) => (
                  <div
                    key={p.id}
                    className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-white/80"
                  >
                    <div className="flex items-center gap-3">
                      <div className="grid h-8 w-8 place-items-center rounded-md bg-gradient-to-b from-white/20 to-white/0 border border-white/10 text-white/90">
                        <Users className="h-4 w-4" />
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{p.name}</span>
                        {p.isDrawer && (
                          <span className="inline-flex items-center gap-1 rounded-md border border-amber-400/30 bg-amber-400/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-amber-100">
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

              {isCreator && players.length >= 2 && (
                <button
                  onClick={startGame}
                  className="w-full mt-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold rounded-xl hover:scale-105 transition transform active:scale-95 shadow-lg"
                >
                  Start Game
                </button>
              )}
            </section>

            {/* lightweight chat even in lobby */}
            <section className="lg:col-span-2 rounded-2xl border border-white/10 bg-white/5 p-6">
              <h3 className="text-lg font-semibold mb-3">Chat</h3>
              <div className="h-64 overflow-y-auto rounded-md border border-white/10 bg-black/20 p-3">
                {chat.map((m, idx) => (
                  <div key={idx} className="text-sm mb-1">
                    <span className="text-white/60 mr-1">{m.name}:</span>
                    <span>{m.msg}</span>
                  </div>
                ))}
                <div ref={chatEndRef} />
              </div>
              <div className="mt-3 flex gap-2">
                <input
                  placeholder="Type a message"
                  className="flex-1 rounded-md border border-white/10 bg-white/10 px-3 py-2 outline-none"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      sendChat((e.target as HTMLInputElement).value);
                      (e.target as HTMLInputElement).value = '';
                    }
                  }}
                />
                <button
                  onClick={() => {
                    const el = document.querySelector<HTMLInputElement>('input[placeholder="Type a message"]');
                    if (el?.value) {
                      sendChat(el.value);
                      el.value = '';
                    }
                  }}
                  className="px-3 py-2 rounded-md border border-white/10 bg-white/10"
                >
                  <Send className="h-4 w-4" />
                </button>
              </div>
            </section>
          </div>
        ) : roomId && gameStarted ? (
          // ======= GAME VIEW =======
          <section className="grid lg:grid-cols-3 gap-6">
            {/* left: canvas */}
            <div className="lg:col-span-2 rounded-2xl border border-white/10 bg-white/5 p-6 shadow-[0_0_0_1px_rgba(255,255,255,0.04)] backdrop-blur">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-white/90">Canvas</h3>
                <div className="flex items-center gap-2">
                  <div className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-1 text-sm">
                    <Clock className="h-4 w-4" />
                    <span className="tabular-nums">{timeLeft}s</span>
                    <span className="text-white/40">•</span>
                    <span>Round {round}/{maxRounds}</span>
                  </div>
                  {iAmDrawer ? (
                    <div className="rounded-lg border border-amber-400/30 bg-amber-400/10 px-3 py-1 text-sm font-medium text-amber-100">
                      Draw: <span className="underline underline-offset-2">{currentWord}</span>
                    </div>
                  ) : (
                    <div className="rounded-lg border border-cyan-400/30 bg-cyan-400/10 px-3 py-1 text-sm font-medium text-cyan-100">
                      {wordHint || 'Guess the word!'}
                    </div>
                  )}
                </div>
              </div>

              <div className="overflow-x-auto">
                <Canvas
                  roomId={roomId}
                  isDrawer={iAmDrawer}
                  currentWord={iAmDrawer ? currentWord : undefined}
                />
              </div>
            </div>

            {/* right: chat / guess + players */}
            <div className="space-y-6">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
                <h3 className="text-lg font-semibold mb-3">{iAmDrawer ? 'Chat' : 'Guess / Chat'}</h3>
                <div className="h-80 overflow-y-auto rounded-md border border-white/10 bg-black/20 p-3">
                  {chat.map((m, idx) => (
                    <div key={idx} className="text-sm mb-1">
                      <span className="text-white/60 mr-1">{m.name}:</span>
                      <span>{m.msg}</span>
                    </div>
                  ))}
                  <div ref={chatEndRef} />
                </div>

                {!iAmDrawer && (
                  <div className="mt-3 flex gap-2">
                    <input
                      value={guess}
                      onChange={(e) => setGuess(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') sendGuess();
                      }}
                      placeholder="Type your guess…"
                      className="flex-1 rounded-md border border-white/10 bg-white/10 px-3 py-2 outline-none"
                    />
                    <button
                      onClick={sendGuess}
                      className="px-3 py-2 rounded-md border border-white/10 bg-white/10"
                      aria-label="Send guess"
                    >
                      <Send className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
                <h3 className="text-lg font-semibold mb-3">Players</h3>
                <div className="space-y-2">
                  {players.map((p) => (
                    <div
                      key={p.id}
                      className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-white/80"
                    >
                      <div className="flex items-center gap-3">
                        <div className="grid h-8 w-8 place-items-center rounded-md bg-gradient-to-b from-white/20 to-white/0 border border-white/10 text-white/90">
                          <Users className="h-4 w-4" />
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{p.name}</span>
                          {p.isDrawer && (
                            <span className="inline-flex items-center gap-1 rounded-md border border-amber-400/30 bg-amber-400/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-amber-100">
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
              </div>
            </div>
          </section>
        ) : (
          // ======= CREATE / JOIN =======
          <section className="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-[0_0_0_1px_rgba(255,255,255,0.04)] backdrop-blur max-w-2xl mx-auto">
            <div className="mb-6 grid grid-cols-2 rounded-xl border border-white/10 bg-white/5 p-1">
              <button
                onClick={() => setMode('create')}
                className={`w-full rounded-lg px-4 py-2.5 text-sm font-medium transition ${
                  mode === 'create'
                    ? 'bg-gradient-to-r from-fuchsia-500/30 to-cyan-500/30 text-white shadow-inner'
                    : 'text-white/70 hover:text-white'
                } focus:outline-none`}
                aria-pressed={mode === 'create'}
              >
                Create room
              </button>
              <button
                onClick={() => setMode('join')}
                className={`w-full rounded-lg px-4 py-2.5 text-sm font-medium transition ${
                  mode === 'join'
                    ? 'bg-gradient-to-r from-fuchsia-500/30 to-cyan-500/30 text-white shadow-inner'
                    : 'text-white/70 hover:text-white'
                } focus:outline-none`}
                aria-pressed={mode === 'join'}
              >
                Join room
              </button>
            </div>

            {mode === 'create' ? (
              <form onSubmit={onCreate} className="space-y-4 group relative">
                <div>
                  <label className="block text-sm text-white/70 mb-1">Your name</label>
                  <input
                    value={createForm.playerName}
                    onChange={(e) => setCreateForm({ playerName: e.target.value })}
                    placeholder="e.g., Kumar"
                    className="w-full rounded-md border border-white/10 bg-white/10 px-3 py-2 outline-none"
                  />
                </div>
                <button
                  type="submit"
                  disabled={creating}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-fuchsia-500 to-cyan-500 text-white font-semibold shadow-lg active:scale-95 transition"
                >
                  {creating ? 'Creating…' : 'Create room'}
                </button>
              </form>
            ) : (
              <form onSubmit={onJoin} className="space-y-4 group relative">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-white/70 mb-1">Room code</label>
                    <input
                      value={joinForm.roomId}
                      onChange={(e) => setJoinForm((s) => ({ ...s, roomId: e.target.value }))}
                      placeholder="e.g., 8NZ3QK"
                      className="w-full rounded-md border border-white/10 bg-white/10 px-3 py-2 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-white/70 mb-1">Your name</label>
                    <input
                      value={joinForm.playerName}
                      onChange={(e) => setJoinForm((s) => ({ ...s, playerName: e.target.value }))}
                      placeholder="e.g., Kumar"
                      className="w-full rounded-md border border-white/10 bg-white/10 px-3 py-2 outline-none"
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={joining}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-blue-500 text-white font-semibold shadow-lg active:scale-95 transition group relative"
                >
                  {joining ? 'Joining' : 'Join room'}
                </button>
              </form>
            )}
          </section>
        )}
      </main>
    </div>
  );
}
