'use client';

import { socket } from '@/lib/socket';
import { generateSessionId, saveSession, clearSession } from '@/lib/session';

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

interface GameSettingsData {
  rounds: number;
  drawTime: number;
  wordCount: number;
  customWords: string;
  customWordProbability: number;
  maxPlayers: number;
}

interface UseGameActionsProps {
  roomId: string;
  sessionId: string;
  setSessionId: (id: string) => void;
  setCreating: (creating: boolean) => void;
  setJoining: (joining: boolean) => void;
  setChat: (chat: ChatItem[] | ((prev: ChatItem[]) => ChatItem[])) => void;
  setGameSettings: (settings: GameSettingsData) => void;
  setSelectingWord: (selecting: boolean) => void;
  setWordChoices: (choices: string[]) => void;
  setWordSelectionScores: (scores: Array<{ name: string; score: number; avatar?: number[] }>) => void;
  setShowFinalResults: (show: boolean) => void;
  setGameEnded: (ended: boolean) => void;
  setPlayers: (players: Player[] | ((prev: Player[]) => Player[])) => void;
  me?: Player;
}

export function useGameActions({
  roomId,
  sessionId,
  setSessionId,
  setCreating,
  setJoining,
  setChat,
  setGameSettings,
  setSelectingWord,
  setWordChoices,
  setWordSelectionScores,
  setShowFinalResults,
  setGameEnded,
  setPlayers,
  me,
}: UseGameActionsProps) {
  
  const handleCreateRoom = (playerName: string, avatar: number[]) => {
    if (!socket.connected) {
      setChat((c) => [
        ...c,
        { id: 'error', name: 'Error', msg: 'Not connected to server. Please refresh.' },
      ]);
      return;
    }
    
    setCreating(true);
    
    let currentSessionId = sessionId;
    if (!currentSessionId) {
      currentSessionId = generateSessionId();
      setSessionId(currentSessionId);
    }
    
    saveSession({
      sessionId: currentSessionId,
      roomId: '',
      playerName,
      avatar,
      createdAt: Date.now(),
      gameEnded: false
    });
    
    socket.emit('createRoom', { playerName, avatar, sessionId: currentSessionId });
    
    const timeout = setTimeout(() => {
      setCreating(false);
      setChat((c) => [
        ...c,
        { id: 'error', name: 'Error', msg: 'Failed to create room. Please try again.' },
      ]);
    }, 10000);
    
    return () => clearTimeout(timeout);
  };

  const handleJoinRoom = (playerName: string, avatar: number[], roomCode: string) => {
    if (!socket.connected) {
      setChat((c) => [
        ...c,
        { id: 'error', name: 'Error', msg: 'Not connected to server. Please refresh.' },
      ]);
      return;
    }
    
    setJoining(true);
    
    let currentSessionId = sessionId;
    if (!currentSessionId) {
      currentSessionId = generateSessionId();
      setSessionId(currentSessionId);
    }
    
    saveSession({
      sessionId: currentSessionId,
      roomId: roomCode,
      playerName,
      avatar,
      createdAt: Date.now(),
      gameEnded: false
    });
    
    socket.emit('joinRoom', { roomId: roomCode, playerName, avatar, sessionId: currentSessionId });
    
    const timeout = setTimeout(() => {
      setJoining(false);
      setChat((c) => [
        ...c,
        { id: 'error', name: 'Error', msg: 'Failed to join room. Please check the code and try again.' },
      ]);
    }, 10000);
    
    return () => clearTimeout(timeout);
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
  };

  const handleQuit = () => {
    console.log('[SESSION] User quit - clearing session immediately');
    
    clearSession();
    localStorage.removeItem('drawzzl_roomId');
    localStorage.removeItem('drawzzl_sessionId');
    
    if (roomId) {
      socket.emit('leaveRoom', { roomId }, () => {
        socket.disconnect();
        window.location.reload();
      });
      
      setTimeout(() => {
        socket.disconnect();
        window.location.reload();
      }, 500);
    } else {
      socket.disconnect();
      window.location.reload();
    }
  };

  const handleStartFresh = () => {
    const confirmed = window.confirm(
      'Are you sure you want to leave this game?\n\n' +
      'This will:\n' +
      '• Remove you from the current room\n' +
      '• Clear your game progress\n' +
      '• Take you back to the main menu\n\n' +
      'Other players can continue without you.'
    );
    
    if (!confirmed) return;
    
    console.log('[SESSION] Starting fresh - clearing everything');
    
    clearSession();
    localStorage.removeItem('drawzzl_roomId');
    localStorage.removeItem('drawzzl_sessionId');
    
    if (socket.connected && roomId) {
      socket.emit('leaveRoom', { roomId });
    }
    
    window.location.reload();
  };

  const sendGuess = (guess: string) => {
    const g = guess.trim();
    if (!g || !roomId) return;
    socket.emit('guess', { roomId, guess: g, name: me?.name || 'Me' });
  };

  const sendChat = (msg: string) => {
    const trimmed = msg.trim();
    if (!trimmed || !roomId) return;
    
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

  const handleCopyCode = (setCopied: (copied: boolean) => void) => {
    navigator.clipboard.writeText(roomId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShareLink = (setCopied: (copied: boolean) => void) => {
    const shareUrl = `${window.location.origin}?room=${roomId}`;
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return {
    handleCreateRoom,
    handleJoinRoom,
    startGame,
    handleSaveSettings,
    selectWord,
    handleReturnToLobby,
    handleQuit,
    handleStartFresh,
    sendGuess,
    sendChat,
    handleCopyCode,
    handleShareLink,
  };
}