import { create } from 'zustand';
import { socket } from '@/lib/socket';

export interface Player {
  id: string;
  name: string;
  score: number;
  isDrawer?: boolean;
}

export interface ChatItem {
  id: string;
  name: string;
  msg: string;
}

export interface GameState {
  // Room
  roomId: string | null;
  isCreator: boolean;
  players: Player[];
  gameStarted: boolean;
  gameEnded: boolean;

  // Turn
  currentWord: string | undefined;
  wordHint: string;
  timeLeft: number;
  round: number;
  maxRounds: number;
  
  // Hangman
  wrongGuesses: number;
  maxWrongGuesses: number;

  // Chat
  chat: ChatItem[];

  // UI
  confetti: boolean;
  errorMessage: string | null;
  
  // Word Selection
  wordChoices: string[];
  showWordSelection: boolean;

  // Actions
  setRoomId: (id: string | null) => void;
  setIsCreator: (is: boolean) => void;
  setPlayers: (players: Player[]) => void;
  setGameStarted: (started: boolean) => void;
  setGameEnded: (ended: boolean) => void;
  setCurrentWord: (word: string | undefined) => void;
  setWordHint: (hint: string) => void;
  setTimeLeft: (time: number) => void;
  setRound: (round: number) => void;
  setMaxRounds: (rounds: number) => void;
  setWrongGuesses: (count: number) => void;
  setMaxWrongGuesses: (count: number) => void;
  addChat: (item: ChatItem) => void;
  clearChat: () => void;
  setConfetti: (show: boolean) => void;
  setErrorMessage: (msg: string | null) => void;
  setWordChoices: (words: string[]) => void;
  setShowWordSelection: (show: boolean) => void;
  reset: () => void;
}

export const useGameStore = create<GameState>((set) => ({
  roomId: null,
  isCreator: false,
  players: [],
  gameStarted: false,
  gameEnded: false,
  currentWord: undefined,
  wordHint: '',
  timeLeft: 0,
  round: 1,
  maxRounds: 3,
  wrongGuesses: 0,
  maxWrongGuesses: 6,
  chat: [],
  confetti: false,
  errorMessage: null,
  wordChoices: [],
  showWordSelection: false,

  setRoomId: (id) => set({ roomId: id }),
  setIsCreator: (is) => set({ isCreator: is }),
  setPlayers: (players) => set({ players }),
  setGameStarted: (started) => set({ gameStarted: started }),
  setGameEnded: (ended) => set({ gameEnded: ended }),
  setCurrentWord: (word) => set({ currentWord: word }),
  setWordHint: (hint) => set({ wordHint: hint }),
  setTimeLeft: (time) => set({ timeLeft: time }),
  setRound: (round) => set({ round }),
  setMaxRounds: (rounds) => set({ maxRounds: rounds }),
  setWrongGuesses: (count) => set({ wrongGuesses: count }),
  setMaxWrongGuesses: (count) => set({ maxWrongGuesses: count }),
  addChat: (item) => set((state) => ({ chat: [...state.chat, item] })),
  clearChat: () => set({ chat: [] }),
  setConfetti: (show) => set({ confetti: show }),
  setErrorMessage: (msg) => set({ errorMessage: msg }),
  setWordChoices: (words) => set({ wordChoices: words }),
  setShowWordSelection: (show) => set({ showWordSelection: show }),
  reset: () =>
    set({
      roomId: null,
      isCreator: false,
      players: [],
      gameStarted: false,
      gameEnded: false,
      currentWord: undefined,
      wordHint: '',
      timeLeft: 0,
      round: 1,
      maxRounds: 3,
      wrongGuesses: 0,
      maxWrongGuesses: 6,
      chat: [],
      confetti: false,
      errorMessage: null,
      wordChoices: [],
      showWordSelection: false,
    }),
}));