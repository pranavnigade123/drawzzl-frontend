'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { socket } from '@/lib/socket';
import Canvas from './Canvas';
import LandingPage from './LandingPage';
import GameSettings, { GameSettingsData } from './GameSettings';
import PointsIndicator from './PointsIndicator';
import RoundResults from './RoundResults';
import FinalResults from './FinalResults';
import ErrorBoundary from './ErrorBoundary';
import PlayersList from './PlayersList';
import ChatSection from './ChatSection';
import { AvatarDisplay } from './AvatarCreator';
import { Crown, Loader2, Users, Send, Clock, Settings, Share2, Check } from 'lucide-react';
import { generateSessionId, saveSession, getSession, clearSession, updateSessionRoom, markGameEnded } from '@/lib/session';

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
  const [sessionId, setSessionId] = useState<string>('');
  const [isReconnecting, setIsReconnecting] = useState(false);

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
  const [lobbyChatInput, setLobbyChatInput] = useState('');

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

  // connection state
  const [connected, setConnected] = useState(socket.connected);
  const [reconnecting, setReconnecting] = useState(false);

  // canvas state
  const [currentDrawing, setCurrentDrawing] = useState<any[]>([]);

  // derived
  const me = useMemo(
    () => players.find((p) => p.id === socket.id),
    [players]
  );

  // Use isCreator from backend (tracks original room owner)
  // This is set by roomCreated/roomJoined/hostTransferred events

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+L or Cmd+L to leave game
      if ((e.ctrlKey || e.metaKey) && e.key === 'l' && roomId) {
        e.preventDefault();
        handleStartFresh();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [roomId]);

  useEffect(() => {
    setMounted(true);

    // Check for existing session and attempt reconnection
    const existingSession = getSession();
    if (existingSession && socket.connected) {
      console.log('[SESSION] Found existing session, attempting reconnection');
      setIsReconnecting(true);
      setSessionId(existingSession.sessionId);
      // The socket.ts file will handle the actual reconnection
    }

    // ----- handlers from server -----
    const onRoomCreated = (data: { roomId: string; playerId: string; isHost?: boolean; sessionId?: string }) => {
      setRoomId(data.roomId);
      setIsCreator(data.isHost ?? true);
      if (data.sessionId) {
        setSessionId(data.sessionId);
        updateSessionRoom(data.roomId);
        console.log('[SESSION] Room created with session:', data.sessionId);
      }
    };

    const onRoomJoined = (data: { roomId: string; isHost?: boolean; sessionId?: string }) => {
      setRoomId(data.roomId);
      setIsCreator(data.isHost ?? false);
      if (data.sessionId) {
        setSessionId(data.sessionId);
        updateSessionRoom(data.roomId);
        console.log('[SESSION] Room joined with session:', data.sessionId);
      }
    };

    const onReconnectionSuccess = (data: { 
      roomId: string; 
      sessionId: string;
      isHost: boolean;
      player: any;
      gameState: any;
    }) => {
      console.log('[SESSION] Reconnection successful');
      
      setIsReconnecting(false);
      setRoomId(data.roomId);
      setSessionId(data.sessionId);
      setIsCreator(data.isHost);
      
      // Sync game state
      if (data.gameState) {
        setGameStarted(data.gameState.gameStarted);
        setRound(data.gameState.round);
        setMaxRounds(data.gameState.maxRounds);
        setTimeLeft(data.gameState.timeLeft);
        setWordHint(data.gameState.wordHint);
        setIAmDrawer(data.gameState.isYourTurn);
        setPlayers(data.gameState.players);
        
        // Restore current word for drawer
        if (data.gameState.isYourTurn && data.gameState.currentWord) {
          setCurrentWord(data.gameState.currentWord);
          console.log('[SESSION] Restored current word for drawer:', data.gameState.currentWord);
        }
        
        // Restore chat history
        if (data.gameState.recentChat) {
          setChat(data.gameState.recentChat);
        }

        // Restore canvas drawing
        if (data.gameState.currentDrawing) {
          setCurrentDrawing(data.gameState.currentDrawing);
        }
      }
      

      
      setChat((c) => [
        ...c,
        { id: 'system', name: 'System', msg: 'Reconnected successfully!' },
      ]);
    };

    const onHostTransferred = (data: { isHost: boolean }) => {
      setIsCreator(data.isHost);
      setChat((c) => [
        ...c,
        { id: 'system', name: 'System', msg: 'You are now the host!' },
      ]);
    };

    const onPlayerJoined = (data: { players: Player[] }) => {
      console.log('Players updated:', data.players?.length || 0, 'players');
      setPlayers(data.players || []);
    };

    const onPlayerLeft = (data: { playerName: string; playerId: string }) => {
      console.log(`[SESSION] Player ${data.playerName} left the room`);
      setChat((c) => [
        ...c,
        { id: 'system', name: 'System', msg: `${data.playerName} left the game` },
      ]);
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
      
      // Mark game as ended and auto-clear session after 30 seconds
      markGameEnded();
      setTimeout(() => {
        console.log('[SESSION] Auto-clearing session after game completion');
        clearSession();
      }, 30000); // 30 seconds to view results, then auto-clear
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
      // Clear canvas for new turn
      setCurrentDrawing([]);
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
    socket.on('reconnectionSuccess', onReconnectionSuccess);
    socket.on('hostTransferred', onHostTransferred);
    socket.on('playerJoined', onPlayerJoined);
    socket.on('playerLeft', onPlayerLeft);
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

    // Canvas sync handlers
    const onDraw = (data: { lines: any[] }) => {
      setCurrentDrawing(data.lines);
    };
    const onClearCanvas = () => {
      setCurrentDrawing([]);
    };
    
    socket.on('draw', onDraw);
    socket.on('clearCanvas', onClearCanvas);

    // Connection status handlers
    const onConnect = () => {
      console.log('Socket connected:', socket.id);
      setConnected(true);
      setReconnecting(false);
    };

    const onDisconnect = () => {
      console.log('Socket disconnected');
      setConnected(false);
    };

    const onReconnecting = () => {
      console.log('Socket reconnecting...');
      setReconnecting(true);
    };

    const onReconnectError = () => {
      console.log('Socket reconnection failed');
      setReconnecting(false);
    };

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('reconnecting', onReconnecting);
    socket.on('reconnect_error', onReconnectError);

    return () => {
      socket.off('roomCreated', onRoomCreated);
      socket.off('roomJoined', onRoomJoined);
      socket.off('reconnectionSuccess', onReconnectionSuccess);
      socket.off('hostTransferred', onHostTransferred);
      socket.off('playerJoined', onPlayerJoined);
      socket.off('playerLeft', onPlayerLeft);
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
      socket.off('draw', onDraw);
      socket.off('clearCanvas', onClearCanvas);
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('reconnecting', onReconnecting);
      socket.off('reconnect_error', onReconnectError);
    };
  }, []);



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
    
    // Create or get session
    let currentSessionId = sessionId;
    if (!currentSessionId) {
      currentSessionId = generateSessionId();
      setSessionId(currentSessionId);
    }
    
    // Save session data
    saveSession({
      sessionId: currentSessionId,
      roomId: '', // Will be updated when room is created
      playerName,
      avatar,
      createdAt: Date.now(),
      gameEnded: false
    });
    
    socket.emit('createRoom', { playerName, avatar, sessionId: currentSessionId });
    
    // Add timeout for error handling
    const timeout = setTimeout(() => {
      if (creating && !roomId) {
        setCreating(false);
        setChat((c) => [
          ...c,
          { id: 'error', name: 'Error', msg: 'Failed to create room. Please try again.' },
        ]);
      }
    }, 10000);
    
    // Clear timeout when room is created
    if (roomId) {
      clearTimeout(timeout);
      setCreating(false);
    }
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
    
    // Create or get session
    let currentSessionId = sessionId;
    if (!currentSessionId) {
      currentSessionId = generateSessionId();
      setSessionId(currentSessionId);
    }
    
    // Save session data
    saveSession({
      sessionId: currentSessionId,
      roomId: roomCode,
      playerName,
      avatar,
      createdAt: Date.now(),
      gameEnded: false
    });
    
    socket.emit('joinRoom', { roomId: roomCode, playerName, avatar, sessionId: currentSessionId });
    
    // Add timeout for error handling
    const timeout = setTimeout(() => {
      if (joining && !roomId) {
        setJoining(false);
        setChat((c) => [
          ...c,
          { id: 'error', name: 'Error', msg: 'Failed to join room. Please check the code and try again.' },
        ]);
      }
    }, 10000);
    
    // Clear timeout when room is joined
    if (roomId) {
      clearTimeout(timeout);
      setJoining(false);
    }
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
    console.log('[SESSION] User quit - clearing session immediately');
    
    // Clear our session system
    clearSession();
    
    // Clear any legacy session storage
    localStorage.removeItem('drawzzl_roomId');
    localStorage.removeItem('drawzzl_sessionId');
    
    // Emit leave event with acknowledgment callback
    if (roomId) {
      socket.emit('leaveRoom', { roomId }, (response: any) => {
        // Wait for backend confirmation before disconnecting
        socket.disconnect();
        window.location.reload();
      });
      
      // Fallback timeout in case callback doesn't fire
      setTimeout(() => {
        socket.disconnect();
        window.location.reload();
      }, 500);
    } else {
      socket.disconnect();
      window.location.reload();
    }
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

  const handleStartFresh = () => {
    // Show confirmation dialog
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
    
    // Clear session immediately
    clearSession();
    
    // Clear any legacy storage
    localStorage.removeItem('drawzzl_roomId');
    localStorage.removeItem('drawzzl_sessionId');
    
    // Disconnect from current room if connected
    if (socket.connected && roomId) {
      socket.emit('leaveRoom', { roomId });
    }
    
    // Just reload the page for a clean start
    window.location.reload();
  };

  if (!mounted) {
    return (
      <ErrorBoundary>
        <div className="min-h-screen relative overflow-hidden bg-zinc-950 text-white">
          <header className="fixed top-0 left-0 right-0 z-[9999] bg-zinc-950/95 backdrop-blur-md border-b border-white/20 shadow-lg">
            <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <h1 className="text-xl font-bold">Drawzzl</h1>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full bg-gray-400" />
                  <span className="text-xs text-white/60">Loading...</span>
                </div>
                <p className="text-white/60 text-sm hidden sm:block">Real-time drawing & guessing</p>
              </div>
            </div>
          </header>
          
          <div className="flex items-center justify-center min-h-screen" style={{ marginTop: '80px' }}>
            <div className="text-white/80 text-xl inline-flex items-center gap-2">
              <Loader2 className="h-5 w-5 animate-spin" />
              Loading
            </div>
          </div>
        </div>
      </ErrorBoundary>
    );
  }

  if (isReconnecting) {
    return (
      <ErrorBoundary>
        <div className="min-h-screen relative overflow-hidden bg-zinc-950 text-white">
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
            </div>
          </header>
          
          <div className="flex items-center justify-center min-h-screen" style={{ marginTop: '80px' }}>
            <div className="text-center">
              <div className="text-white/80 text-xl inline-flex items-center gap-2 mb-4">
                <Loader2 className="h-5 w-5 animate-spin" />
                Reconnecting to game...
              </div>
              <p className="text-white/60 text-sm">Please wait while we restore your session</p>
            </div>
          </div>
        </div>
      </ErrorBoundary>
    );
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen relative overflow-hidden bg-zinc-950 text-white">
        {/* Fixed Navbar - Always visible at top */}
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
                onClick={handleStartFresh}
                className="px-3 py-1.5 bg-red-500/30 border border-red-400/60 text-red-200 rounded-lg hover:bg-red-500/50 hover:scale-105 transition-all text-sm font-medium flex items-center gap-2"
                title="Leave current game and start fresh (Ctrl+L)"
              >
                🚪 Leave Game
              </button>
            )}
          </div>
        </header>

        {/* Background accents */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-32 -left-24 h-80 w-80 rounded-full bg-fuchsia-500/25 blur-3xl" />
          <div className="absolute top-1/3 -right-24 h-72 w-72 rounded-full bg-cyan-500/20 blur-3xl" />
          <div className="absolute -bottom-28 left-1/4 h-64 w-64 rounded-full bg-indigo-500/25 blur-3xl" />
        </div>

        {/* Main content with top margin for fixed navbar */}
        <main className="relative z-10 max-w-6xl mx-auto px-4 py-10" style={{ marginTop: '80px' }}>

        {roomId && !gameStarted ? (
          // ======= LOBBY VIEW =======
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
              </section>

              {/* players list */}
              <PlayersList
                players={players}
                isCreator={isCreator}
                gameStarted={gameStarted}
                onShowSettings={() => setShowSettings(true)}
                onStartGame={startGame}
                onLeaveGame={handleStartFresh}
              />
            </div>

            {/* lightweight chat even in lobby */}
            <ChatSection
              chat={chat}
              inputValue={lobbyChatInput}
              onInputChange={setLobbyChatInput}
              onSendMessage={() => {
                sendChat(lobbyChatInput);
                setLobbyChatInput('');
              }}
              title="Chat"
              placeholder="Type a message"
              isGameMode={false}
              containerClassName="lg:col-span-2 rounded-2xl border border-white/10 bg-white/5 p-4 md:p-6 transition-all hover:border-white/20"
              chatHeight="h-64"
            />
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
                  initialDrawing={currentDrawing}
                />
              </div>
            </div>

            {/* right: chat / guess + players */}
            <div className="space-y-4 md:space-y-6">
              <ChatSection
                chat={chat}
                inputValue={guess}
                onInputChange={setGuess}
                onSendMessage={sendGuess}
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
                  onClick={handleStartFresh}
                  className="w-full mt-4 py-2.5 flex items-center justify-center gap-2 border border-red-400/50 bg-red-500/20 text-red-300 font-medium rounded-xl hover:bg-red-500/30 hover:scale-105 transition-all"
                >
                  🚪 Leave Game
                </button>
              </div>
            </div>
          </section>
        ) : roomId ? (
          // ======= LOBBY VIEW (already handled above) =======
          null
        ) : (
          // ======= LANDING PAGE =======
          <LandingPage 
            onJoin={handleJoinRoom} 
            onCreateRoom={handleCreateRoom}
            onStartFresh={handleStartFresh}
            hasExistingSession={!!getSession()}
          />
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
    </ErrorBoundary>
  );
}


export default Lobby;
