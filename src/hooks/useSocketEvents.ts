'use client';

import { useEffect } from 'react';
import { socket } from '@/lib/socket';
import { updateSessionRoom, markGameEnded, clearSession } from '@/lib/session';

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

interface UseSocketEventsProps {
  setRoomId: (roomId: string) => void;
  setIsCreator: (isCreator: boolean) => void;
  setSessionId: (sessionId: string) => void;
  setIsReconnecting: (isReconnecting: boolean) => void;
  setPlayers: (players: Player[] | ((prev: Player[]) => Player[])) => void;
  setGameStarted: (gameStarted: boolean) => void;
  setCurrentWord: (word: string | undefined) => void;
  setWordHint: (hint: string) => void;
  setTimeLeft: (time: number) => void;
  setRound: (round: number) => void;
  setMaxRounds: (maxRounds: number) => void;
  setIAmDrawer: (isDrawer: boolean) => void;
  setSelectingWord: (selecting: boolean) => void;
  setWordChoices: (choices: string[]) => void;
  setWordSelectionScores: (scores: Array<{ name: string; score: number; avatar?: number[] }>) => void;
  setChat: (chat: ChatItem[] | ((prev: ChatItem[]) => ChatItem[])) => void;
  setShowRoundResults: (show: boolean) => void;
  setRoundResultsData: (data: any) => void;
  setShowFinalResults: (show: boolean) => void;
  setGameEnded: (ended: boolean) => void;
  setGameSettings: (settings: GameSettingsData) => void;
  setWordSelectionTime: (time: number) => void;
  setCurrentDrawing: (drawing: any[]) => void;
  setConnected: (connected: boolean) => void;
  setReconnecting: (reconnecting: boolean) => void;
}

export function useSocketEvents({
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
}: UseSocketEventsProps) {
  useEffect(() => {
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

    // Canvas sync handlers
    const onDraw = (data: { lines: any[] }) => {
      setCurrentDrawing(data.lines);
    };
    const onClearCanvas = () => {
      setCurrentDrawing([]);
    };

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
    socket.on('draw', onDraw);
    socket.on('clearCanvas', onClearCanvas);
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
  }, [
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
  ]);
}