'use client';

import { useEffect, useMemo, useState } from 'react';
import { socket } from '@/lib/socket';
import LandingPage from './LandingPage';
import GameSettings, { GameSettingsData } from './GameSettings';
import RoundResults from './RoundResults';
import FinalResults from './FinalResults';
import ErrorBoundary from './ErrorBoundary';
import GameView from './GameView';
import LobbyView from './LobbyView';
import WordSelectionModal from './WordSelectionModal';
import Navbar from './Navbar';
import { useSocketEvents } from '@/hooks/useSocketEvents';
import { Loader2 } from 'lucide-react';
import { generateSessionId, saveSession, getSession, clearSession } from '@/lib/session';



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
  }, []);

  // Socket event handlers
  useSocketEvents({
    setRoomId,
    setIsCreator,
    setSessionId,
    setIsReconnecting,
    setPlayers,
    setGameStarted,
    setCurrentWord,
    setWordHint,
    setTimeLeft,
    setRound,
    setMaxRounds,
    setIAmDrawer,
    setSelectingWord,
    setWordChoices,
    setWordSelectionScores,
    setChat,
    setShowRoundResults,
    setRoundResultsData,
    setShowFinalResults,
    setGameEnded,
    setGameSettings,
    setWordSelectionTime,
    setCurrentDrawing,
    setConnected,
    setReconnecting,
  });



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
      socket.emit('leaveRoom', { roomId }, () => {
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
          <Navbar 
            connected={false} 
            reconnecting={false} 
            onLeaveGame={handleStartFresh} 
          />
          
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
          <Navbar 
            connected={connected} 
            reconnecting={reconnecting} 
            onLeaveGame={handleStartFresh} 
          />
          
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
        <Navbar 
          connected={connected} 
          reconnecting={reconnecting} 
          roomId={roomId}
          onLeaveGame={handleStartFresh} 
        />

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
          <LobbyView
            roomId={roomId}
            players={players}
            isCreator={isCreator}
            chat={chat}
            lobbyChatInput={lobbyChatInput}
            onLobbyChatInputChange={setLobbyChatInput}
            onSendChat={sendChat}
            onShowSettings={() => setShowSettings(true)}
            onStartGame={startGame}
            onLeaveGame={handleStartFresh}
            copied={copied}
            onCopyCode={handleCopyCode}
            onShareLink={handleShareLink}
          />
        ) : roomId && gameStarted ? (
          // ======= GAME VIEW =======
          <GameView
            roomId={roomId}
            players={players}
            chat={chat}
            guess={guess}
            onGuessChange={setGuess}
            onSendGuess={sendGuess}
            iAmDrawer={iAmDrawer}
            currentWord={currentWord}
            wordHint={wordHint}
            timeLeft={timeLeft}
            round={round}
            maxRounds={maxRounds}
            gameSettings={gameSettings}
            currentDrawing={currentDrawing}
            onLeaveGame={handleStartFresh}
          />
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
        <WordSelectionModal
          isOpen={selectingWord}
          wordChoices={wordChoices}
          wordSelectionTime={wordSelectionTime}
          wordSelectionScores={wordSelectionScores}
          onSelectWord={selectWord}
        />

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
