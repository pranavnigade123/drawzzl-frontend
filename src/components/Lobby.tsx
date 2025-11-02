'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { socket } from '@/lib/socket';
import { Copy, Users, AlertCircle, Gamepad2, Crown, Loader2 } from 'lucide-react';
import Canvas from './Canvas';

const createSchema = z.object({
  playerName: z.string().min(2, 'Name too short').max(20, 'Name too long'),
});

const joinSchema = z.object({
  roomId: z.string().length(6, 'Room code must be 6 characters'),
  playerName: z.string().min(2, 'Name too short').max(20, 'Name too long'),
});

type CreateForm = z.infer<typeof createSchema>;
type JoinForm = z.infer<typeof joinSchema>;

export default function Lobby() {
  const [mode, setMode] = useState<'create' | 'join'>('create');
  const [roomId, setRoomId] = useState('');
  const [players, setPlayers] = useState<Array<{ id: string; name: string; score: number; isDrawer?: boolean }>>([]);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [currentWord, setCurrentWord] = useState<string | undefined>();
  const [wordHint, setWordHint] = useState('');
  const [drawerId, setDrawerId] = useState('');
  const [timeLeft, setTimeLeft] = useState(60);

  const isCreator = players[0]?.id === socket.id;
  const iAmDrawer = drawerId === socket.id;

  useEffect(() => setMounted(true), []);

  const createForm = useForm<CreateForm>({
    resolver: zodResolver(createSchema),
    defaultValues: { playerName: '' },
  });

  const joinForm = useForm<JoinForm>({
    resolver: zodResolver(joinSchema),
    defaultValues: { roomId: '', playerName: '' },
  });

  const copyRoomId = useCallback(() => {
    if (!roomId) return;
    navigator.clipboard.writeText(roomId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [roomId]);

  useEffect(() => {
    const onRoomCreated = (data: any) => {
      setRoomId(data.roomId);
      setPlayers([{ id: data.playerId, name: createForm.getValues('playerName'), score: 0, isDrawer: true }]);
      setError('');
    };

    const onRoomJoined = (data: any) => {
      setRoomId(data.roomId);
      setError('');
    };

    const onPlayerJoined = (data: any) => {
      setPlayers(data.players);
    };

    const onGameStarted = (data: { drawerId: string; wordHint: string; timeLeft: number }) => {
      setGameStarted(true);
      setDrawerId(data.drawerId);
      setWordHint(data.wordHint);
      setTimeLeft(data.timeLeft);
    };

    const onYourWord = ({ word }: { word: string }) => {
      setCurrentWord(word);
    };

    const onError = (data: any) => setError(data.message);

    socket.on('roomCreated', onRoomCreated);
    socket.on('roomJoined', onRoomJoined);
    socket.on('playerJoined', onPlayerJoined);
    socket.on('gameStarted', onGameStarted);
    socket.on('yourWord', onYourWord);
    socket.on('error', onError);

    return () => {
      socket.off('roomCreated', onRoomCreated);
      socket.off('roomJoined', onRoomJoined);
      socket.off('playerJoined', onPlayerJoined);
      socket.off('gameStarted', onGameStarted);
      socket.off('yourWord', onYourWord);
      socket.off('error', onError);
    };
  }, [createForm]);

  const onCreate = (data: CreateForm) => socket.emit('createRoom', { playerName: data.playerName });
  const onJoin = (data: JoinForm) =>
    socket.emit('joinRoom', { roomId: data.roomId.toUpperCase(), playerName: data.playerName });

  const startGame = () => {
    socket.emit('startGame', { roomId });
  };

  if (!mounted) {
    return (
      <div className="min-h-screen relative overflow-hidden bg-zinc-950 flex items-center justify-center">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-24 -left-24 h-72 w-72 rounded-full bg-fuchsia-500/20 blur-3xl" />
          <div className="absolute -bottom-24 -right-24 h-72 w-72 rounded-full bg-indigo-500/20 blur-3xl" />
        </div>
        <div className="text-white/80 text-xl inline-flex items-center gap-2">
          <Loader2 className="h-5 w-5 animate-spin" />
          Loading
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden bg-zinc-950">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-32 -left-24 h-80 w-80 rounded-full bg-fuchsia-500/25 blur-3xl" />
        <div className="absolute top-1/3 -right-24 h-72 w-72 rounded-full bg-cyan-500/20 blur-3xl" />
        <div className="absolute -bottom-28 left-1/4 h-64 w-64 rounded-full bg-indigo-500/25 blur-3xl" />
        <div
          className="absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage:
              'linear-gradient(to right, rgba(255,255,255,.15) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,.15) 1px, transparent 1px)',
            backgroundSize: '36px 36px',
          }}
        />
      </div>

      <main className="relative z-10 max-w-5xl mx-auto px-4 pt-16 pb-24">
        <header className="text-center mb-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/70 backdrop-blur">
            <Gamepad2 className="h-3.5 w-3.5" />
            Real time drawing arena
          </div>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight bg-gradient-to-r from-white via-fuchsia-200 to-cyan-200 bg-clip-text text-transparent">
            drawzzl
          </h1>
          <p className="mt-1 text-sm text-white/60">Create a room or join friends and start drawing</p>
        </header>

        {error && (
          <div
            role="alert"
            className="mb-4 flex items-start gap-3 rounded-xl border border-red-400/30 bg-red-400/10 px-4 py-3 text-red-200 backdrop-blur"
          >
            <AlertCircle className="h-5 w-5 shrink-0" />
            <span className="text-sm">{error}</span>
          </div>
        )}

        {/* LOBBY VIEW */}
        {roomId && !gameStarted ? (
          <div className="space-y-6">
            <section className="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-[0_0_0_1px_rgba(255,255,255,0.04)] backdrop-blur">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
                <div>
                  <h2 className="text-sm text-white/60">Room code</h2>
                  <div className="mt-1 inline-flex items-center gap-2">
                    <span className="text-2xl font-mono tracking-[0.35em] text-white/90">{roomId}</span>
                    <button
                      onClick={copyRoomId}
                      className="inline-flex items-center gap-1 rounded-md border border-white/10 bg-white/10 px-3 py-1.5 text-xs text-white/80 hover:bg-white/15 active:scale-[.99] focus:outline-none focus-visible:ring-2 focus-visible:ring-fuchsia-400"
                      aria-label="Copy room code"
                    >
                      <Copy className="h-4 w-4" />
                      {copied ? 'Copied' : 'Copy'}
                    </button>
                  </div>
                </div>
                <div className="rounded-lg border border-fuchsia-400/30 bg-fuchsia-400/10 px-3 py-2 text-xs text-fuchsia-100">
                  Invite friends with the code
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

              {/* START GAME BUTTON */}
              {isCreator && players.length >= 2 && (
                <button
                  onClick={startGame}
                  className="w-full mt-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold rounded-xl hover:scale-105 transition transform active:scale-95 shadow-lg"
                >
                  Start Game
                </button>
              )}
            </section>
          </div>
        ) : roomId && gameStarted ? (
          /* GAME VIEW */
          <section className="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-[0_0_0_1px_rgba(255,255,255,0.04)] backdrop-blur">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-white/90">Canvas</h3>
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

            <div className="overflow-x-auto">
              <Canvas
                roomId={roomId}
                isDrawer={iAmDrawer}
                currentWord={iAmDrawer ? currentWord : undefined}
              />
            </div>
          </section>
        ) : (
          /* CREATE / JOIN FORMS */
          <section className="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-[0_0_0_1px_rgba(255,255,255,0.04)] backdrop-blur max-w-lg mx-auto">
            <div className="mb-6 grid grid-cols-2 rounded-xl border border-white/10 bg-white/5 p-1">
              <button
                onClick={() => setMode('create')}
                className={`w-full rounded-lg px-4 py-2.5 text-sm font-medium transition ${
                  mode === 'create'
                    ? 'bg-gradient-to-r from-fuchsia-500/30 to-cyan-500/30 text-white shadow-inner'
                    : 'text-white/70 hover:text-white'
                } focus:outline-none focus-visible:ring-2 focus-visible:ring-fuchsia-400`}
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
                } focus:outline-none focus-visible:ring-2 focus-visible:ring-fuchsia-400`}
                aria-pressed={mode === 'join'}
              >
                Join room
              </button>
            </div>

            {mode === 'create' ? (
              <form onSubmit={createForm.handleSubmit(onCreate)} className="space-y-4" noValidate>
                <div>
                  <label htmlFor="create-playerName" className="block text-sm font-medium text-white/80">
                    Your name
                  </label>
                  <input
                    id="create-playerName"
                    {...createForm.register('playerName')}
                    placeholder="Enter a display name"
                    className="mt-1 w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-white placeholder:text-white/40 outline-none focus:border-transparent focus:ring-2 focus:ring-fuchsia-400"
                    aria-invalid={!!createForm.formState.errors.playerName}
                    aria-describedby={createForm.formState.errors.playerName ? 'create-playerName-error' : undefined}
                  />
                  {createForm.formState.errors.playerName && (
                    <p id="create-playerName-error" className="mt-1 text-sm text-red-300">
                      {createForm.formState.errors.playerName.message}
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={createForm.formState.isSubmitting}
                  className="group relative w-full overflow-hidden rounded-lg bg-gradient-to-r from-fuchsia-500 to-cyan-500 px-4 py-3 font-semibold text-white shadow-lg transition active:scale-[.99] disabled:opacity-60 focus:outline-none focus-visible:ring-2 focus-visible:ring-fuchsia-300"
                >
                  <span className="relative z-10">
                    {createForm.formState.isSubmitting ? 'Creating' : 'Create room'}
                  </span>
                  <span
                    className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition"
                    style={{
                      background:
                        'radial-gradient(120px 60px at var(--x,50%) var(--y,50%), rgba(255,255,255,.25), transparent 60%)',
                    }}
                  />
                </button>
              </form>
            ) : (
              <form onSubmit={joinForm.handleSubmit(onJoin)} className="space-y-4" noValidate>
                <div>
                  <label htmlFor="join-roomId" className="block text-sm font-medium text-white/80">
                    Room code
                  </label>
                  <input
                    id="join-roomId"
                    {...joinForm.register('roomId')}
                    placeholder="ABC123"
                    maxLength={6}
                    className="mt-1 w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 font-mono text-lg tracking-[0.35em] uppercase text-white placeholder:text-white/30 outline-none focus:border-transparent focus:ring-2 focus:ring-fuchsia-400"
                    aria-invalid={!!joinForm.formState.errors.roomId}
                    aria-describedby={joinForm.formState.errors.roomId ? 'join-roomId-error' : undefined}
                  />
                  {joinForm.formState.errors.roomId && (
                    <p id="join-roomId-error" className="mt-1 text-sm text-red-300">
                      {joinForm.formState.errors.roomId.message}
                    </p>
                  )}
                </div>

                <div>
                  <label htmlFor="join-playerName" className="block text-sm font-medium text-white/80">
                    Your name
                  </label>
                  <input
                    id="join-playerName"
                    {...joinForm.register('playerName')}
                    placeholder="Enter a display name"
                    className="mt-1 w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-white placeholder:text-white/40 outline-none focus:border-transparent focus:ring-2 focus:ring-fuchsia-400"
                    aria-invalid={!!joinForm.formState.errors.playerName}
                    aria-describedby={joinForm.formState.errors.playerName ? 'join-playerName-error' : undefined}
                  />
                  {joinForm.formState.errors.playerName && (
                    <p id="join-playerName-error" className="mt-1 text-sm text-red-300">
                      {joinForm.formState.errors.playerName.message}
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={joinForm.formState.isSubmitting}
                  className="group relative w-full overflow-hidden rounded-lg bg-gradient-to-r from-fuchsia-500 to-cyan-500 px-4 py-3 font-semibold text-white shadow-lg transition active:scale-[.99] disabled:opacity-60 focus:outline-none focus-visible:ring-2 focus-visible:ring-fuchsia-300"
                >
                  <span className="relative z-10">
                    {joinForm.formState.isSubmitting ? 'Joining' : 'Join room'}
                  </span>
                  <span
                    className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition"
                    style={{
                      background:
                        'radial-gradient(120px 60px at var(--x,50%) var(--y,50%), rgba(255,255,255,.25), transparent 60%)',
                    }}
                  />
                </button>
              </form>
            )}
          </section>
        )}
      </main>

      <script
        dangerouslySetInnerHTML={{
          __html: `
            document.addEventListener('pointermove', (e) => {
              document.querySelectorAll('.group').forEach((el) => {
                const rect = el.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                el.style.setProperty('--x', x + 'px');
                el.style.setProperty('--y', y + 'px');
              });
            });
          `,
        }}
      />
    </div>
  );
}