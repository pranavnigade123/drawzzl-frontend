'use client';

import React from 'react';
import PlayersList from './PlayersList';
import ChatSection from './ChatSection';
import { Check, Share2 } from 'lucide-react';

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

interface LobbyViewProps {
  roomId: string;
  players: Player[];
  isCreator: boolean;
  chat: ChatItem[];
  lobbyChatInput: string;
  onLobbyChatInputChange: (value: string) => void;
  onSendChat: (message: string) => void;
  onShowSettings: () => void;
  onStartGame: () => void;
  onLeaveGame: () => void;
  copied: boolean;
  onCopyCode: () => void;
  onShareLink: () => void;
}

export default function LobbyView({
  roomId,
  players,
  isCreator,
  chat,
  lobbyChatInput,
  onLobbyChatInputChange,
  onSendChat,
  onShowSettings,
  onStartGame,
  onLeaveGame,
  copied,
  onCopyCode,
  onShareLink,
}: LobbyViewProps) {
  return (
    <div className="grid lg:grid-cols-3 gap-4 md:gap-6 animate-fadeIn">
      {/* room code and players section */}
      <div className="space-y-4">
        {/* room code */}
        <section className="rounded-2xl border border-white/10 bg-white/5 p-4 md:p-6 shadow-[0_0_0_1px_rgba(255,255,255,0.04)] transition-all hover:border-white/20 hover:shadow-lg">
          <div className="mb-4">
            <div className="text-white/70 text-xs mb-2">Room Code</div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-semibold tracking-wider flex-1 bg-white/5 px-3 py-2 rounded-lg border border-white/10">
                {roomId}
              </span>
              <button
                onClick={onCopyCode}
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
                onClick={onShareLink}
                className="px-3 py-2 rounded-lg border border-cyan-400/30 bg-cyan-400/10 text-cyan-300 text-xs font-medium hover:bg-cyan-400/20 transition-all hover:scale-105 flex items-center gap-1"
                title="Copy share link"
              >
                <Share2 className="w-3 h-3" />
                Share
              </button>
            </div>
          </div>
        </section>

        {/* players list */}
        <PlayersList
          players={players}
          isCreator={isCreator}
          gameStarted={false}
          onShowSettings={onShowSettings}
          onStartGame={onStartGame}
          onLeaveGame={onLeaveGame}
        />
      </div>

      {/* lightweight chat even in lobby */}
      <ChatSection
        chat={chat}
        inputValue={lobbyChatInput}
        onInputChange={onLobbyChatInputChange}
        onSendMessage={() => {
          onSendChat(lobbyChatInput);
          onLobbyChatInputChange('');
        }}
        title="Chat"
        placeholder="Type a message"
        isGameMode={false}
        containerClassName="lg:col-span-2 rounded-2xl border border-white/10 bg-white/5 p-4 md:p-6 transition-all hover:border-white/20"
        chatHeight="h-64"
      />
    </div>
  );
}