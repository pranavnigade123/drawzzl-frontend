// src/components/lobby/LobbyContainer.tsx
'use client';

import { useEffect, useState } from 'react';
import ClientOnlyLobby from './ClientOnlyLobby';
import RoomCard from './RoomCard';
import Canvas from '@/components/Canvas';
import ChatBox from '@/components/game/ChatBox';
import Timer from '@/components/game/Timer';
import WordHint from '@/components/game/WordHint';
import ConfettiEffect from '@/components/game/ConfettiEffect';
import FinalLeaderboard from '@/components/game/FinalLeaderboard';
import ErrorToast from '@/components/ui/ErrorToast';
import WordSelection from '@/components/game/WordSelection';
import { useGameStore } from '@/store/useGameStore';
import { socket } from '@/lib/socket';

export default function LobbyContainer() {
  const [mounted, setMounted] = useState(false);
  
  const {
    roomId,
    gameStarted,
    players,
    currentWord,
    timeLeft,
    setGameStarted,
    setCurrentWord,
    setWordHint,
    setTimeLeft,
    setRound,
    setMaxRounds,
    setPlayers,
    addChat,
    setConfetti,
    setGameEnded,
    setErrorMessage,
    wordChoices,
    showWordSelection,
    setWordChoices,
    setShowWordSelection
  } = useGameStore();

  const me = players.find(p => p.id === socket.id);
  const isDrawer = me?.isDrawer || false;

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const handlers = {
      roomCreated: (data: { roomId: string }) => {
        useGameStore.getState().setRoomId(data.roomId);
        useGameStore.getState().setIsCreator(true);
        useGameStore.getState().setGameEnded(false); 
      },
      roomJoined: (data: { roomId: string }) => {
        useGameStore.getState().setRoomId(data.roomId);
        useGameStore.getState().setIsCreator(false);
        useGameStore.getState().setGameEnded(false);
      },
      playerJoined: (data: { players: any[] }) => {
        setPlayers(data.players || []);
      },
      gameStarted: (d: any) => {
        setGameStarted(true);
        setCurrentWord(undefined);
        setWordHint(d.wordHint);
        setTimeLeft(d.timeLeft ?? 60);
        setRound(d.round ?? 1);
        setMaxRounds(d.maxRounds ?? 3);

        const currentPlayers = useGameStore.getState().players;
        setPlayers(
          currentPlayers.map(p => ({ ...p, isDrawer: p.id === d.drawerId }))
        );
      },
      yourWord: ({ word }: { word: string }) => {
        setCurrentWord(word);
      },
      tick: ({ timeLeft, wordHint, wrongGuesses, maxWrongGuesses }: { 
        timeLeft: number; 
        wordHint?: string;
        wrongGuesses?: number;
        maxWrongGuesses?: number;
      }) => {
        setTimeLeft(timeLeft);
        if (wordHint) {
          setWordHint(wordHint);
        }
        if (typeof wrongGuesses === 'number') {
          useGameStore.getState().setWrongGuesses(wrongGuesses);
        }
        if (typeof maxWrongGuesses === 'number') {
          useGameStore.getState().setMaxWrongGuesses(maxWrongGuesses);
        }
      },
      correctGuess: (p: any) => {
        addChat({ id: p.playerId, name: p.name, msg: `guessed it! (+${p.points})` });

        const currentPlayers = useGameStore.getState().players;
        setPlayers(
          currentPlayers.map(pl =>
            pl.id === p.playerId ? { ...pl, score: p.total } : pl
          )
        );

        if (p.playerId === socket.id) {
          setConfetti(true);
          setTimeout(() => setConfetti(false), 3000);
        }
      },
      turnEnded: (d: any) => {
        addChat({ id: 'server', name: 'Game', msg: `Word was: ${d.word}` });
        setCurrentWord(undefined);
        setWordHint('');
        // Clear canvas between rounds
        socket.emit('clearCanvas', { roomId });
      },
      gameOver: (d: { players: any[] }) => {
        const sorted = [...d.players].sort((a: any, b: any) => b.score - a.score);
        addChat({ id: 'server', name: 'Game', msg: 'Game over! Final leaderboard:' });
        sorted.forEach((p: any, i: number) => {
          addChat({ id: `rank-${i}`, name: `${i + 1}. ${p.name}`, msg: `Score ${p.score}` });
        });

        setGameStarted(false);
        setGameEnded(true); // ← Now triggers modal
        setCurrentWord(undefined);
        setWordHint('');
        setTimeLeft(0);
        setRound(1);
      },
      chat: (item: any) => {
        addChat(item);
      },
      error: (data: { message: string }) => {
        setErrorMessage(data.message);
      },
      chooseWord: (data: { words: string[]; timeLimit: number }) => {
        setWordChoices(data.words);
        setShowWordSelection(true);
      },
    };

    Object.entries(handlers).forEach(([event, handler]) => {
      socket.on(event, handler);
    });

    return () => {
      Object.keys(handlers).forEach(event => socket.off(event));
    };
  }, [
    setGameStarted,
    setCurrentWord,
    setWordHint,
    setTimeLeft,
    setRound,
    setMaxRounds,
    setPlayers,
    addChat,
    setConfetti,
    setGameEnded,
    setErrorMessage
  ]);

if (!roomId) {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        <header className="text-center mb-10 animate-fade-in">
          <div className="inline-flex items-center gap-2 mb-4 px-4 py-1.5 rounded-full bg-slate-900 border border-slate-700">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs font-semibold text-slate-300 tracking-wide">
              Online party drawing game
            </span>
          </div>
          <h1 className="text-5xl font-black mb-3 text-slate-50 tracking-tight">
            Drawzzl
          </h1>
          <p className="text-slate-400 text-sm">
            Create a room, invite friends, draw fast, guess faster.
          </p>
        </header>
        {mounted && <ClientOnlyLobby />}
      </div>
    </div>
  );
}


  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-purple-950/10 to-zinc-950 text-white p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <header className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
              Drawzzl
            </h1>
            {gameStarted && (
              <div className="flex items-center gap-2">
                <Timer />
                <WordHint />
              </div>
            )}
          </div>
        </header>

        {/* Content */}
        {!gameStarted ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-5xl mx-auto">
            <RoomCard />
            <ChatBox />
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-4">
              <Canvas
                roomId={roomId}
                isDrawer={isDrawer}
                currentWord={currentWord}
                timeLeft={timeLeft}
              />
            </div>
            <div className="space-y-4">
              <RoomCard />
              <ChatBox />
            </div>
          </div>
        )}
      </div>

      <ConfettiEffect />
      <FinalLeaderboard />
      <ErrorToast />
      
      {/* Word Selection Modal */}
      {showWordSelection && wordChoices.length > 0 && roomId && (
        <WordSelection
          words={wordChoices}
          timeLimit={10}
          roomId={roomId}
          onSelect={() => setShowWordSelection(false)}
        />
      )}
    </div>
  );
}