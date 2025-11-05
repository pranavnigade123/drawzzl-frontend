// src/components/lobby/LobbyContainer.tsx
'use client';

import { useEffect, useState } from 'react';
import CreateRoom from './CreateRoom';
import JoinRoom from './JoinRoom';
import RoomCard from './RoomCard';
import Canvas from '@/components/Canvas';
import ChatBox from '@/components/game/ChatBox';
import Timer from '@/components/game/Timer';
import WordHint from '@/components/game/WordHint';
import { useGameStore } from '@/store/useGameStore';
import { socket } from '@/lib/socket';
import ClientOnlyLobby from './ClientOnlyLobby';

type Mode = 'create' | 'join';

export default function LobbyContainer() {
  const {
    roomId,
    gameStarted,
    players,
    currentWord,
    setGameStarted,
    setCurrentWord,
    setWordHint,
    setTimeLeft,
    setRound,
    setMaxRounds,
    setPlayers,
    addChat,
    reset
  } = useGameStore();

  const [mode, setMode] = useState<Mode>('create');

  // Find current player
  const me = players.find(p => p.id === socket.id);
  const isDrawer = me?.isDrawer || false;

  useEffect(() => {
    const handlers = {
      roomCreated: (data: { roomId: string }) => {
        useGameStore.getState().setRoomId(data.roomId);
        useGameStore.getState().setIsCreator(true);
      },
      roomJoined: (data: { roomId: string }) => {
        useGameStore.getState().setRoomId(data.roomId);
        useGameStore.getState().setIsCreator(false);
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
      tick: ({ timeLeft }: { timeLeft: number }) => {
        setTimeLeft(timeLeft);
      },
      correctGuess: (p: any) => {
        addChat({ id: p.playerId, name: p.name, msg: `guessed it! (+${p.points})` });

        const currentPlayers = useGameStore.getState().players;
        setPlayers(
          currentPlayers.map(pl =>
            pl.id === p.playerId ? { ...pl, score: p.total } : pl
          )
        );
      },
      turnEnded: (d: any) => {
        addChat({ id: 'server', name: 'Game', msg: `Word was: ${d.word}` });
        setCurrentWord(undefined);
        setWordHint('');
      },
      gameOver: (d: { players: any[] }) => {
        const sorted = [...d.players].sort((a: any, b: any) => b.score - a.score);
        addChat({ id: 'server', name: 'Game', msg: 'Game over! Final leaderboard:' });
        sorted.forEach((p: any, i: number) => {
          addChat({ id: `rank-${i}`, name: `${i + 1}. ${p.name}`, msg: `Score ${p.score}` });
        });
        setGameStarted(false);
        setCurrentWord(undefined);
        setWordHint('');
        setTimeLeft(0);
        setRound(1);
      },
      chat: (item: any) => {
        addChat(item);
      },
      error: (data: { message: string }) => {
        addChat({ id: 'error', name: 'Error', msg: data.message });
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
    addChat
  ]);

  const handleCreate = (name: string) => {
    socket.emit('createRoom', { playerName: name });
  };

  const handleJoin = (roomId: string, name: string) => {
    socket.emit('joinRoom', { roomId, playerName: name });
  };

  // Replace the entire lobby section (when !roomId)
if (!roomId) {
  return (
    <div className="min-h-screen bg-zinc-950 text-white flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        <header className="text-center mb-8">
          <h1 className="text-3xl font-bold">Drawzzl</h1>
          <p className="text-white/60 text-sm">Real-time drawing & guessing</p>
        </header>

        <ClientOnlyLobby />
      </div>
    </div>
  );
}

  return (
    <div className="min-h-screen bg-zinc-950 text-white p-4">
      <div className="max-w-6xl mx-auto">
        {!gameStarted ? (
          <div className="grid lg:grid-cols-3 gap-6">
            <RoomCard />
            <ChatBox />
          </div>
        ) : (
          <section className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-semibold">Canvas</h3>
                <div className="flex items-center gap-3">
                  <Timer />
                  <WordHint />
                </div>
              </div>
              <div className="bg-white rounded-2xl shadow-2xl p-4">
                <Canvas
                  roomId={roomId}
                  isDrawer={isDrawer}
                  currentWord={currentWord}
                />
              </div>
            </div>
            <div className="space-y-6">
              <ChatBox />
              <RoomCard />
            </div>
          </section>
        )}
      </div>
    </div>
  );
}