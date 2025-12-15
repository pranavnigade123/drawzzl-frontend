'use client';

import { Send } from 'lucide-react';
import { useRef, useEffect } from 'react';

interface ChatItem {
  id: string;
  name: string;
  msg: string;
}

interface ChatSectionProps {
  // Chat data
  chat: ChatItem[];
  
  // Input handling
  inputValue: string;
  onInputChange: (value: string) => void;
  onSendMessage: () => void;
  
  // Configuration
  title: string;
  placeholder: string;
  isGameMode?: boolean;
  showInput?: boolean;
  
  // Styling
  containerClassName?: string;
  chatHeight?: string;
  inputButtonColor?: string;
}

export default function ChatSection({
  chat,
  inputValue,
  onInputChange,
  onSendMessage,
  title,
  placeholder,
  isGameMode = false,
  showInput = true,
  containerClassName = "rounded-2xl border border-white/10 bg-white/5 p-4 md:p-6 transition-all hover:border-white/20",
  chatHeight = "h-64",
  inputButtonColor = "bg-white/10 hover:bg-white/20"
}: ChatSectionProps) {
  const chatEndRef = useRef<HTMLDivElement | null>(null);

  // Auto-scroll chat when new messages arrive
  useEffect(() => {
    if (chatEndRef.current) {
      const chatContainer = chatEndRef.current.closest('.overflow-y-auto');
      if (chatContainer) {
        chatContainer.scrollTop = chatContainer.scrollHeight;
      }
    }
  }, [chat]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      onSendMessage();
    }
  };

  const renderChatMessage = (m: ChatItem, idx: number) => {
    if (isGameMode) {
      // Game mode - enhanced message styling
      const isHint = m.id === 'hint';
      const isError = m.id === 'error';
      const isSystem = m.id === 'system' || m.id === 'server';
      
      if (isSystem || isHint || isError) {
        return (
          <div key={idx} className={`text-sm mb-2 text-center py-1 px-2 rounded ${
            isHint ? 'text-yellow-300 bg-yellow-500/10' :
            isError ? 'text-red-300 bg-red-500/10' :
            'text-blue-300 bg-blue-500/10'
          }`}>
            {m.msg}
          </div>
        );
      }
      
      return (
        <div key={idx} className="text-sm mb-1.5">
          <span className="text-cyan-400 font-medium mr-1.5">{m.name}:</span>
          <span className="text-white/90">{m.msg}</span>
        </div>
      );
    } else {
      // Lobby mode - simple message styling
      return (
        <div key={idx} className="text-sm mb-1">
          <span className="text-white/60 mr-1">{m.name}:</span>
          <span>{m.msg}</span>
        </div>
      );
    }
  };

  return (
    <div className={containerClassName}>
      <h3 className="text-lg font-semibold mb-3">{title}</h3>
      
      {/* Chat Messages */}
      <div className={`${chatHeight} ${isGameMode ? 'md:h-80' : ''} overflow-y-auto rounded-${isGameMode ? 'lg' : 'md'} border border-white/10 bg-${isGameMode ? 'black/30' : 'black/20'} p-3`}>
        {chat.map((m, idx) => renderChatMessage(m, idx))}
        <div ref={chatEndRef} />
      </div>

      {/* Input Section */}
      {showInput && (
        <div className="mt-3 flex gap-2">
          <input
            value={inputValue}
            onChange={(e) => onInputChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            className={`flex-1 rounded-${isGameMode ? 'lg' : 'md'} border border-white/10 bg-white/10 px-3 py-2 outline-none focus:border-cyan-400 transition-colors placeholder:text-white/40 text-white`}
          />
          <button
            onClick={onSendMessage}
            className={`px-3 py-2 rounded-${isGameMode ? 'lg' : 'md'} border border-white/10 ${inputButtonColor} transition-colors`}
            aria-label="Send message"
          >
            <Send className="h-4 w-4 text-white" />
          </button>
        </div>
      )}
    </div>
  );
}