'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { socket } from '@/lib/socket';
import Canvas from './Canvas';
import LandingPage from './LandingPage';
import GameSettings, { GameSettingsData } from './GameSettings';
import PointsIndicator from './PointsIndicator';
import RoundResults from './RoundResults';
import FinalResults from './FinalResults';
import { AvatarDisplay } from './AvatarCreator';
import { Crown, Loader2, Users, Send, Clock, Settings, Share2, Check } from 'lucide-react';

type Mode = 'create' | 'join';

interface Player {
  id: string;
  name: string;
  score: number;
  isDrawer?: boolean;
  avatar?: number[];
}

interface ChatItem {
  id: string;
  name: string;
  msg: string;
}

function Lobby() {
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
  const [joinForm, setJoinForm] = useState({ roomId: '', playerName: '' });
  const [joining, setJoining] = useState(false);
  const [creating, setCreating] = useState(false);

  // settings
  const [showSettings, setShowSettings] = useState(false);
  const [gameSettings, setGameSettings] = useState<GameSettingsData>({
    rounds: 3,
    drawTime: 60,
    wordCount: 3,
    customWords: '',
    customWordProbability: 0,
    maxPlayers: 8,
  });

  // word selection
  const [wordChoices, setWordChoices] = useState<string[]>([]);
  const [selectingWord, setSelectingWord] = useState(false);
  const [wordSelectionTime, setWordSelectionTime] = useState(5);
  const [wordSelectionScores, setWordSelectionScores] = useState<Array<{ name: string; score: number; avatar?: number[] }>>([]);

  // round results
  const [showRoundResults, setShowRoundResults] = useState(false);
  const [roundResultsData, setRoundResultsData] = useState<{
    word: string;
    players: Array<{ id: string; name: string; score: number; avatar?: number[]; roundPoints?: number }>;
    correctGuessers: string[];
  } | null>(null);

  // final results
  const [showFinalResults, setShowFinalResults] = useState(false);
  const [gameEnded, setGameEnded] = useState(false);

  // copy animation
  const [copied, setCopied] = useState(false);

  // derived
  const me = useMemo(
    () => players.find((p) => p.id === socket.id),
    [players]
  );

  // Check if current user is creator (first player)
  const amICreator = useMemo(
    () => players.length > 0 && players[0]?.id === socket.id,
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
      // Clear word selection state
      setSelectingWord(false);
      setWordChoices([]);
      setWordSelectionScores([]);
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
      // Show in chat that player guessed correctly
      setChat((c) => [
        ...c,
        { id: 'system', name: 'System', msg: `${p.name} guessed the word!` },
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
      players: Array<{ id: string; name: string; score: number; avatar?: number[]; roundPoints?: number }>;
    }) => {
      // Show word in chat
      setChat((c) => [
        ...c,
        { id: 'system', name: 'System', msg: `The word was: ${d.word}` },
      ]);

      // Show round results screen
      setRoundResultsData({
        word: d.word,
        players: d.players,
        correctGuessers: d.correctGuessers,
      });
      setShowRoundResults(true);

      // Update player scores
      setPlayers(d.players);

      // Hide round results after 5 seconds
      setTimeout(() => {
        setShowRoundResults(false);
        setRoundResultsData(null);
      }, 5000);

      setCurrentWord(undefined);
      setWordHint('');
      setIAmDrawer(false);
    };

    const onGameOver = (d: { players: Player[] }) => {
      // Update players and show final results
      setPlayers(d.players);
      setGameStarted(false);
      setGameEnded(true);
      setShowFinalResults(true);
      setCurrentWord(undefined);
      setWordHint('');
      setTimeLeft(0);
      setRound(1);
    };

    const onChat = ({ id, name, msg }: ChatItem) => {
      setChat((c) => [...c, { id, name, msg }]);
    };

    const onCloseGuess = ({ message }: { message: string }) => {
      setChat((c) => [
        ...c,
        { id: 'hint', name: '💡 Hint', msg: message },
      ]);
    };

    const onHintUpdate = ({ wordHint }: { wordHint: string }) => {
      setWordHint(wordHint);
      // Don't show hint messages in chat anymore
    };

    const onError = (data: { message: string }) => {
      setChat((c) => [
        ...c,
        { id: 'error', name: 'Error', msg: data.message },
      ]);
    };

    const onSettingsUpdated = (settings: any) => {
      setGameSettings({
        rounds: settings.rounds,
        drawTime: settings.drawTime,
        wordCount: settings.wordCount,
        customWords: settings.customWords,
        customWordProbability: settings.customWordProbability,
        maxPlayers: settings.maxPlayers,
      });
      setChat((c) => [
        ...c,
        { id: 'system', name: 'System', msg: 'Game settings updated' },
      ]);
    };

    const onSelectWord = ({ words, timeLimit, scores }: { words: string[]; timeLimit: number; scores: Array<{ name: string; score: number; avatar?: number[] }> }) => {
      setWordChoices(words);
      setSelectingWord(true);
      setWordSelectionTime(timeLimit);
      setWordSelectionScores(scores || []);
    };

    const onDrawerSelecting = ({ scores }: { scores: Array<{ name: string; score: number; avatar?: number[] }> }) => {
      setSelectingWord(true);
      setWordSelectionScores(scores || []);
      setChat((c) => [
        ...c,
        { id: 'system', name: 'System', msg: 'Drawer is selecting a word...' },
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
    socket.on('closeGuess', onCloseGuess);
    socket.on('hintUpdate', onHintUpdate);
    socket.on('settingsUpdated', onSettingsUpdated);
    socket.on('selectWord', onSelectWord);
    socket.on('drawerSelecting', onDrawerSelecting);
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
      socket.off('closeGuess', onCloseGuess);
      socket.off('hintUpdate', onHintUpdate);
      socket.off('settingsUpdated', onSettingsUpdated);
      socket.off('selectWord', onSelectWord);
      socket.off('drawerSelecting', onDrawerSelecting);
      socket.off('error', onError);
    };
  }, []);

  useEffect(() => {
    // autoscroll chat
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chat]);

  // ----- client emits -----
  const handleCreateRoom = (playerName: string, avatar: number[]) => {
    // Check if socket is connected
    if (!socket.connected) {
      setChat((c) => [
        ...c,
        { id: 'error', name: 'Error', msg: 'Not connected to server. Please refresh.' },
      ]);
      return;
    }
    
    setCreating(true);
    socket.emit('createRoom', { playerName, avatar });
    setTimeout(() => setCreating(false), 300);
  };

  const handleJoinRoom = (playerName: string, avatar: number[], roomCode: string) => {
    // Check if socket is connected
    if (!socket.connected) {
      setChat((c) => [
        ...c,
        { id: 'error', name: 'Error', msg: 'Not connected to server. Please refresh.' },
      ]);
      return;
    }
    
    setJoining(true);
    socket.emit('joinRoom', { roomId: roomCode, playerName, avatar });
    setTimeout(() => setJoining(false), 300);
  };



  const startGame = () => {
    if (!roomId) return;
    socket.emit('startGame', { roomId });
  };

  const handleSaveSettings = (settings: GameSettingsData) => {
    if (!roomId) return;
    socket.emit('updateSettings', { roomId, settings });
    setGameSettings(settings);
  };

  const selectWord = (word: string) => {
    if (!roomId) return;
    socket.emit('wordSelected', { roomId, word });
    setSelectingWord(false);
    setWordChoices([]);
    setWordSelectionScores([]);
  };

  const handleReturnToLobby = () => {
    setShowFinalResults(false);
    setGameEnded(false);
    setPlayers((prev) => prev.map((p) => ({ ...p, score: 0 })));
    setChat([]);
  };

  const handleQuit = () => {
    // Emit leave event and disconnect
    if (roomId) {
      socket.emit('leaveRoom', { roomId });
    }
    socket.disconnect();
    // Reload to go back to landing page
    setTimeout(() => {
      window.location.reload();
    }, 100);
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(roomId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShareLink = () => {
    const shareUrl = `${window.location.origin}?room=${roomId}`;
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const sendGuess = () => {
    const g = guess.trim();
    if (!g || !roomId) return;
    // Always emit as "guess"; server will echo wrong ones as chat
    socket.emit('guess', { roomId, guess: g, name: me?.name || 'Me' });
    setGuess('');
  };

  const sendChat = (msg: string) => {
    const trimmed = msg.trim();
    if (!trimmed || !roomId) return;
    
    // Check for basic profanity on client side too (quick feedback)
    const hasProfanity = /fuck|shit|bitch|ass|damn|crap|dick|pussy|cunt|bastard|whore|slut|fag|nigger|retard|rape|porn/i.test(trimmed);
    if (hasProfanity) {
      setChat((c) => [
        ...c,
        { id: 'error', name: 'Error', msg: 'Message blocked: inappropriate language' },
      ]);
      return;
    }
    
    socket.emit('chat', { roomId, msg: trimmed, name: me?.name || 'Me' });
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
        <header className="mb-8 flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold">Drawzzl</h1>
            <p className="text-white/60 text-sm">Real-time drawing & guessing</p>
          </div>
          <img 
            src="/logo dark bg.png" 
            alt="Company Logo" 
            className="h-10 md:h-12 w-auto opacity-80 hover:opacity-100 transition-opacity"
          />
        </header>

        {roomId && !gameStarted ? (
          // ======= LOBBY VIEW =======
          <div className="grid lg:grid-cols-3 gap-4 md:gap-6 animate-fadeIn">
            {/* room card */}
            <section className="rounded-2xl border border-white/10 bg-white/5 p-4 md:p-6 shadow-[0_0_0_1px_rgba(255,255,255,0.04)] transition-all hover:border-white/20 hover:shadow-lg">
              <div className="mb-4">
                <div className="text-white/70 text-xs mb-2">Room Code</div>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-semibold tracking-wider flex-1 bg-white/5 px-3 py-2 rounded-lg border border-white/10">
                    {roomId}
                  </span>
                  <button
                    onClick={handleCopyCode}
                    className={`px-3 py-2 rounded-lg border text-xs font-medium transition-all flex items-center gap-1 ${
                      copied 
                        ? 'border-green-400 bg-green-400/20 text-green-300 scale-105' 
                        : 'border-white/10 bg-white/10 text-white hover:bg-white/20'
                    }`}
                  >
                    {copied ? (
                      <>
                        <Check className="w-3 h-3" />
                        Copied!
                      </>
                    ) : (
                      'Copy'
                    )}
                  </button>
                  <button
                    onClick={handleShareLink}
                    className="px-3 py-2 rounded-lg border border-cyan-400/30 bg-cyan-400/10 text-cyan-300 text-xs font-medium hover:bg-cyan-400/20 transition-all hover:scale-105 flex items-center gap-1"
                    title="Copy share link"
                  >
                    <Share2 className="w-3 h-3" />
                    Share
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                {players.map((p, idx) => (
                  <div
                    key={p.id}
                    className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-white/80 transition-all hover:bg-white/10 hover:scale-[1.01]"
                  >
                    <div className="flex items-center gap-3">
                      <AvatarDisplay avatar={p.avatar || [0, 0, 0, 0]} size={32} />
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{p.name}</span>
                        {idx === 0 && (
                          <span className="inline-flex items-center gap-1 rounded-md border border-fuchsia-400/30 bg-fuchsia-400/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-fuchsia-100">
                            <Crown className="h-3 w-3" />
                            Host
                          </span>
                        )}
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

              {amICreator && (
                <>
                  <button
                    onClick={() => setShowSettings(true)}
                    className="w-full mt-4 py-2.5 flex items-center justify-center gap-2 border border-white/10 bg-white/5 text-white font-medium rounded-xl hover:bg-white/10 transition"
                  >
                    <Settings className="w-4 h-4" />
                    Game Settings
                  </button>
                  {players.length >= 2 && (
                    <button
                      onClick={startGame}
                      className="w-full mt-3 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold rounded-xl hover:scale-105 transition-transform active:scale-95 shadow-lg"
                    >
                      Start Game
                    </button>
                  )}
                </>
              )}
            </section>

            {/* lightweight chat even in lobby */}
            <section className="lg:col-span-2 rounded-2xl border border-white/10 bg-white/5 p-4 md:p-6 transition-all hover:border-white/20">
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
          <section className="grid lg:grid-cols-3 gap-4 md:gap-6 animate-fadeIn">
            {/* left: canvas */}
            <div className="lg:col-span-2 rounded-2xl border border-white/10 bg-white/5 p-4 md:p-6 shadow-[0_0_0_1px_rgba(255,255,255,0.04)] backdrop-blur transition-all hover:border-white/20">
              <div className="mb-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <h3 className="text-lg font-semibold text-white/90">Canvas</h3>
                <div className="flex flex-wrap items-center gap-2">
                  <div className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-1 text-sm">
                    <Clock className="h-4 w-4" />
                    <span className="tabular-nums">{timeLeft}s</span>
                    <span className="text-white/40">•</span>
                    <span>Round {round}/{maxRounds}</span>
                  </div>
                  {!iAmDrawer && <PointsIndicator timeLeft={timeLeft} maxTime={gameSettings.drawTime} />}
                  {iAmDrawer ? (
                    <div className="rounded-lg border border-amber-400/30 bg-amber-400/10 px-3 py-1 text-sm font-medium text-amber-100">
                      Draw: <span className="underline underline-offset-2">{currentWord}</span>
                    </div>
                  ) : (
                    <div className="rounded-lg border border-cyan-400/30 bg-cyan-400/10 px-4 py-2 text-lg font-bold text-cyan-100 tracking-wider font-mono">
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
            <div className="space-y-4 md:space-y-6">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4 md:p-6 transition-all hover:border-white/20">
                <h3 className="text-lg font-semibold mb-3">{iAmDrawer ? 'Chat' : 'Guess / Chat'}</h3>
                <div className="h-64 md:h-80 overflow-y-auto rounded-lg border border-white/10 bg-black/30 p-3">
                  {chat.map((m, idx) => {
                    const isHint = m.id === 'hint';
                    const isError = m.id === 'error';
                    const isSystem = m.id === 'system' || m.id === 'server';
                    
                    if (isSystem || isHint || isError) {
                      return (
                        <div key={idx} className={`text-sm mb-2 text-center py-1 px-2 rounded ${
                          isHint ? 'text-yellow-300 bg-yellow-500/10' :
                          isError ? 'text-red-300 bg-red-500/10' :
                          'text-blue-300 bg-blue-500/10'
                        }`}>
                          {m.msg}
                        </div>
                      );
                    }
                    
                    return (
                      <div key={idx} className="text-sm mb-1.5">
                        <span className="text-cyan-400 font-medium mr-1.5">{m.name}:</span>
                        <span className="text-white/90">{m.msg}</span>
                      </div>
                    );
                  })}
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
                      className="flex-1 rounded-lg border border-white/10 bg-white/10 px-3 py-2 outline-none focus:border-cyan-400 transition-colors placeholder:text-white/40 text-white"
                    />
                    <button
                      onClick={sendGuess}
                      className="px-3 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-600 transition-colors"
                      aria-label="Send guess"
                    >
                      <Send className="h-4 w-4 text-white" />
                    </button>
                  </div>
                )}
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/5 p-4 md:p-6 transition-all hover:border-white/20">
                <h3 className="text-lg font-semibold mb-3">Players</h3>
                <div className="space-y-2">
                  {players.map((p, idx) => (
                    <div
                      key={p.id}
                      className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-white/80 transition-all hover:bg-white/10 hover:scale-[1.01]"
                    >
                      <div className="flex items-center gap-3">
                        <AvatarDisplay avatar={p.avatar || [0, 0, 0, 0]} size={32} />
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{p.name}</span>
                          {idx === 0 && (
                            <span className="inline-flex items-center gap-1 rounded-md border border-fuchsia-400/30 bg-fuchsia-400/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-fuchsia-100">
                              <Crown className="h-3 w-3" />
                              Host
                            </span>
                          )}
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
        ) : roomId ? (
          // ======= LOBBY VIEW (already handled above) =======
          null
        ) : (
          // ======= LANDING PAGE =======
          <LandingPage onJoin={handleJoinRoom} onCreateRoom={handleCreateRoom} />
        )}

        {/* Final Results Screen */}
        {showFinalResults && (
          <FinalResults
            players={players}
            onReturnToLobby={handleReturnToLobby}
            onQuit={handleQuit}
          />
        )}

        {/* Round Results Modal */}
        {showRoundResults && roundResultsData && !showFinalResults && (
          <RoundResults
            word={roundResultsData.word}
            players={roundResultsData.players}
            correctGuessers={roundResultsData.correctGuessers}
          />
        )}

        {/* Word Selection Modal */}
        {selectingWord && (
          <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4 animate-fadeIn">
            <div className="bg-zinc-900 rounded-2xl border border-white/10 p-4 md:p-6 max-w-2xl w-full shadow-2xl animate-scaleIn max-h-[90vh] overflow-y-auto">
              {/* Current Scores */}
              {wordSelectionScores.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-white mb-3 text-center">Current Scores</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-32 overflow-y-auto">
                    {wordSelectionScores.map((player, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between rounded-lg border border-white/10 bg-white/5 px-3 py-2 transition-colors hover:bg-white/10"
                      >
                        <div className="flex items-center gap-2">
                          <AvatarDisplay avatar={player.avatar || [0, 0, 0, 0]} size={24} />
                          <span className="text-white text-sm font-medium">{player.name}</span>
                        </div>
                        <span className="text-white/80 text-sm font-bold">{player.score}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Word Selection (only for drawer) */}
              {wordChoices.length > 0 ? (
                <>
                  <h2 className="text-xl md:text-2xl font-bold text-white mb-2 text-center">Choose a Word</h2>
                  <p className="text-white/60 text-center mb-6 text-sm md:text-base">You have {wordSelectionTime} seconds to choose</p>
                  <div className="space-y-3">
                    {wordChoices.map((word, idx) => (
                      <button
                        key={idx}
                        onClick={() => selectWord(word)}
                        className="w-full py-4 rounded-xl bg-gradient-to-r from-fuchsia-500/20 to-cyan-500/20 border border-white/20 text-white font-semibold text-base md:text-lg hover:scale-105 active:scale-95 transition-transform"
                      >
                        {word}
                      </button>
                    ))}
                  </div>
                </>
              ) : (
                <>
                  <h2 className="text-2xl font-bold text-white mb-2 text-center">Drawer is Selecting...</h2>
                  <p className="text-white/60 text-center">Please wait while the drawer chooses a word</p>
                </>
              )}
            </div>
          </div>
        )}

        {/* Game Settings Modal */}
        <GameSettings
          isOpen={showSettings}
          onClose={() => setShowSettings(false)}
          onSave={handleSaveSettings}
          initialSettings={gameSettings}
        />
      </main>
    </div>
  );
}


export default Lobby;
