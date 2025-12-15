'use client';

import React from 'react';
import Canvas from './Canvas';
import ChatSection from './ChatSection';
import PointsIndicator from './PointsIndicator';
import { AvatarDisplay } from './AvatarCreator';
import { Crown, Clock } from 'lucide-react';

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

interface GameViewProps {
  roomId: string;
  players: Player[];
  chat: ChatItem[];
  guess: string;
  onGuessChange: (value: string) => void;
  onSendGuess: () => void;
  iAmDrawer: boolean;
  currentWord?: string;
  wordHint: string;
  timeLeft: number;
  round: number;
  maxRounds: number;
  gameSettings: {
    drawTime: number;
  };
  currentDrawing: any[];
  onLeaveGame: () => void;
}

export default function GameView({
  roomId,
  players,
  chat,
  guess,
  onGuessChange,
  onSendGuess,
  iAmDrawer,
  currentWord,
  wordHint,
  timeLeft,
  round,
  maxRounds,
  gameSettings,
  currentDrawing,
  onLeaveGame,
}: GameViewProps) {
  return (
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
            initialDrawing={currentDrawing}
          />
        </div>
      </div>

      {/* right: chat / guess + players */}
      <div className="space-y-4 md:space-y-6">
        <ChatSection
          chat={chat}
          inputValue={guess}
          onInputChange={onGuessChange}
          onSendMessage={onSendGuess}
          title={iAmDrawer ? 'Chat' : 'Guess / Chat'}
          placeholder="Type your guess…"
          isGameMode={true}
          showInput={!iAmDrawer}
          containerClassName="rounded-2xl border border-white/10 bg-white/5 p-4 md:p-6 transition-all hover:border-white/20"
          chatHeight="h-64"
          inputButtonColor="bg-cyan-500 hover:bg-cyan-600"
        />

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
          
          {/* Leave Game button in game view */}
          <button
            onClick={onLeaveGame}
            className="w-full mt-4 py-2.5 flex items-center justify-center gap-2 border border-red-400/50 bg-red-500/20 text-red-300 font-medium rounded-xl hover:bg-red-500/30 hover:scale-105 transition-all"
          >
            🚪 Leave Game
          </button>
        </div>
      </div>
    </section>
  );
}