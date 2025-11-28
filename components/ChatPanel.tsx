import React, { useState, useEffect, useRef } from 'react';
import { CircuitState, SimulationResult } from '../types';
import { getChatResponse } from '../services/geminiService';

interface ChatPanelProps {
  circuit: CircuitState;
  result: SimulationResult | null;
}

interface Message {
  role: 'user' | 'model';
  text: string;
}

const ChatPanel: React.FC<ChatPanelProps> = ({ circuit, result }) => {
  const [messages, setMessages] = useState<Message[]>([
    { 
      role: 'model', 
      text: "Hello! I'm your Quantum Tutor. I can help you design circuits, explain what specific gates do, or interpret your simulation results. Try running a 'Bell State' to see entanglement in action!" 
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  
  // Track the last result ID/Time to prevent duplicate explanations
  const lastExplainedResultRef = useRef<string | null>(null);

  // Auto-explain results when they arrive
  useEffect(() => {
    const explainResults = async () => {
      if (result && result.executionTime && result.executionTime !== lastExplainedResultRef.current) {
        lastExplainedResultRef.current = result.executionTime;
        setLoading(true);
        
        // We add a "System Prompt" effectively by sending a message on behalf of the user but hiding it? 
        // No, cleaner is to just ask the AI to explain the new context.
        // We will call the service with a specific prompt but NOT add it to the visible message history as a user message.
        
        try {
          const prompt = "The user just ran a new simulation. Briefly explain the results shown in the 'probabilities' and 'stateVector' to a beginner. Explain WHY the quantum state ended up this way based on the gates used. Suggest one cool thing to try next.";
          const response = await getChatResponse(prompt, messages, circuit, result);
          setMessages(prev => [...prev, { role: 'model', text: response }]);
        } catch (e) {
          console.error("Auto-explanation failed", e);
        } finally {
          setLoading(false);
        }
      }
    };

    explainResults();
  }, [result, circuit, messages]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMessage }]);
    setLoading(true);

    try {
      // We pass the full history plus current context to the service
      const response = await getChatResponse(userMessage, messages, circuit, result);
      setMessages(prev => [...prev, { role: 'model', text: response }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'model', text: "I'm having trouble connecting to the quantum realm right now. Please try again." }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-900 border-t border-slate-700 lg:border-t-0 lg:border-l lg:rounded-b-xl overflow-hidden">
      <div className="bg-slate-800/80 p-3 border-b border-slate-700 flex justify-between items-center backdrop-blur">
        <h3 className="text-sm font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-2">
          <i className="fas fa-robot"></i> Quantum Tutor
        </h3>
        <span className="text-[10px] text-slate-500 bg-slate-800 px-2 py-0.5 rounded border border-slate-700">AI Powered</span>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar bg-slate-900/50" ref={scrollRef}>
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div 
              className={`
                max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-md
                ${msg.role === 'user' 
                  ? 'bg-gradient-to-br from-cyan-600 to-blue-600 text-white rounded-tr-none' 
                  : 'bg-slate-800 border border-slate-700 text-slate-300 rounded-tl-none'}
              `}
            >
              {msg.role === 'model' && (
                <div className="mb-1 text-[10px] uppercase tracking-wide font-bold text-cyan-500 opacity-70">
                  Assistant
                </div>
              )}
              {/* Render simple markdown-like bolding */}
              <div dangerouslySetInnerHTML={{ 
                  __html: msg.text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\n/g, '<br/>') 
              }} />
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-slate-800 border border-slate-700 rounded-2xl rounded-tl-none px-4 py-3 flex items-center gap-2">
              <div className="w-2 h-2 bg-cyan-500 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-cyan-500 rounded-full animate-bounce delay-100"></div>
              <div className="w-2 h-2 bg-cyan-500 rounded-full animate-bounce delay-200"></div>
            </div>
          </div>
        )}
      </div>

      <div className="p-3 bg-slate-800 border-t border-slate-700">
        <div className="relative">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask about your circuit..."
            className="w-full bg-slate-900 text-slate-200 placeholder-slate-500 rounded-lg pl-4 pr-12 py-3 border border-slate-700 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 focus:outline-none text-sm transition-all"
          />
          <button
            onClick={handleSend}
            disabled={loading || !input.trim()}
            className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center bg-cyan-600 hover:bg-cyan-500 text-white rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <i className="fas fa-paper-plane text-xs"></i>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatPanel;