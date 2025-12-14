// Session management for persistent player identity

export interface PlayerSession {
  sessionId: string;
  roomId: string;
  playerName: string;
  avatar: number[];
  createdAt: number;
  gameEnded?: boolean;
}

const SESSION_KEY = 'drawzzl_session';
const SESSION_TIMEOUT = 15 * 60 * 1000; // 15 minutes total (simple single timeout)

export function generateSessionId(): string {
  return 'session_' + Math.random().toString(36).substring(2, 15) + Date.now().toString(36);
}

export function saveSession(session: PlayerSession): void {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    console.log(`[SESSION] Session saved: ${session.sessionId}`);
  } catch (error) {
    console.error('[SESSION] Failed to save session:', error);
  }
}

export function getSession(): PlayerSession | null {
  if (typeof window === 'undefined') return null;
  
  try {
    const stored = localStorage.getItem(SESSION_KEY);
    if (!stored) return null;

    const session: PlayerSession = JSON.parse(stored);
    const age = Date.now() - session.createdAt;
    
    // Simple timeout check - 15 minutes total
    if (age > SESSION_TIMEOUT) {
      console.log('[SESSION] Session expired after 15 minutes');
      clearSession();
      return null;
    }

    // Check if game already ended
    if (session.gameEnded) {
      console.log('[SESSION] Game ended, clearing session');
      clearSession();
      return null;
    }

    return session;
  } catch (error) {
    console.error('[SESSION] Failed to load session:', error);
    clearSession();
    return null;
  }
}

export function clearSession(): void {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.removeItem(SESSION_KEY);
    console.log('[SESSION] Session cleared');
  } catch (error) {
    console.error('[SESSION] Failed to clear session:', error);
  }
}

export function updateSessionRoom(roomId: string): void {
  const session = getSession();
  if (session) {
    session.roomId = roomId;
    saveSession(session);
  }
}

export function markGameEnded(): void {
  const session = getSession();
  if (session) {
    session.gameEnded = true;
    saveSession(session);
    console.log('[SESSION] Game marked as ended');
  }
}