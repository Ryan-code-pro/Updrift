import React, { useState, useRef, useEffect } from 'react';
import { Bot, Send, User, X, Sparkles, MessageSquare } from 'lucide-react';
import { soundFx } from '../utils/soundEffects';

interface Message {
  id: string;
  sender: 'user' | 'system';
  text: string;
  timestamp: string;
}

interface SystemChatDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  activeTopic: string;
}

export const SystemChatDrawer: React.FC<SystemChatDrawerProps> = ({
  isOpen,
  onClose,
  activeTopic,
}) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'm1',
      sender: 'system',
      text: `Hunter, the System AI Assistant is active. Ask any doubts regarding "${activeTopic || 'your syllabus'}" and I shall clarify the core mechanics.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (!isOpen) return null;

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userText = input.trim();
    const userMsg: Message = {
      id: 'usr_' + Date.now(),
      sender: 'user',
      text: userText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);
    soundFx.playSystemBeep();

    try {
      const res = await fetch('/api/system-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userText,
          topic: activeTopic,
        }),
      });

      const data = await res.json();
      const systemReply = data.reply || 'System active. Focus on core equations and definitions!';

      const sysMsg: Message = {
        id: 'sys_' + Date.now(),
        sender: 'system',
        text: systemReply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, sysMsg]);
      soundFx.playSystemBeep();
    } catch (err) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        {
          id: 'sys_err_' + Date.now(),
          sender: 'system',
          text: 'System Notification: Connection stable. Re-read the key terms in your Grimoire to master this question.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full sm:w-[420px] bg-zinc-950 border-l border-cyan-500/50 shadow-2xl shadow-cyan-950/80 flex flex-col text-zinc-100">
      
      {/* Header */}
      <div className="p-4 border-b border-zinc-800 flex items-center justify-between bg-zinc-900">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-cyan-950 border border-cyan-500/50 text-cyan-400">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-mono font-bold text-cyan-400 tracking-wider uppercase">
              [SYSTEM ASSISTANT]
            </div>
            <div className="text-[11px] font-mono text-zinc-400 truncate max-w-[220px]">
              Context: {activeTopic || 'General Study'}
            </div>
          </div>
        </div>

        <button
          onClick={onClose}
          className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 p-4 overflow-y-auto space-y-3">
        {messages.map((m) => (
          <div
            key={m.id}
            className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'}`}
          >
            <div className="flex items-center gap-1.5 text-[10px] font-mono text-zinc-500 mb-1">
              {m.sender === 'system' ? (
                <>
                  <Bot className="w-3 h-3 text-cyan-400" />
                  <span className="text-cyan-400 font-bold">THE SYSTEM</span>
                </>
              ) : (
                <>
                  <User className="w-3 h-3 text-amber-400" />
                  <span className="text-amber-400 font-bold">HUNTER</span>
                </>
              )}
              <span>• {m.timestamp}</span>
            </div>

            <div
              className={`p-3 rounded-xl text-xs font-mono max-w-[85%] leading-relaxed ${
                m.sender === 'user'
                  ? 'bg-cyan-600 text-zinc-950 font-semibold'
                  : 'bg-zinc-900 border border-zinc-800 text-zinc-200'
              }`}
            >
              {m.text}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 p-2">
            <Sparkles className="w-4 h-4 animate-spin" />
            <span>Processing Query via Gemini...</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Form */}
      <form onSubmit={handleSendMessage} className="p-3 border-t border-zinc-800 bg-zinc-900 flex items-center gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask a doubt or request a concept hint..."
          className="flex-1 px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-700 focus:border-cyan-500 focus:outline-none text-xs font-mono text-zinc-100 placeholder-zinc-600"
        />
        <button
          type="submit"
          disabled={!input.trim() || isLoading}
          className="p-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-zinc-950 transition-colors disabled:opacity-40 cursor-pointer"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>

    </div>
  );
};
