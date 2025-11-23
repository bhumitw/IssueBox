import React, { useState, useRef, useEffect } from 'react';
import { User, MediatorMessage, Issue, Appreciation } from '../types';
import { Bot, Send, User as UserIcon, Loader2, Sparkles } from 'lucide-react';
import { getMediatorResponse } from '../services/geminiService';

interface MediatorProps {
  currentUser: User;
  partner: User;
  issues: Issue[];
  appreciations: Appreciation[];
}

export const Mediator: React.FC<MediatorProps> = ({ currentUser, partner, issues, appreciations }) => {
  const [messages, setMessages] = useState<MediatorMessage[]>([
    {
      id: 'welcome',
      role: 'model',
      text: `Hello ${currentUser.name.split(' ')[0]}. I'm your shared AI mediator. I have access to your communication history and appreciation log to help give context-aware advice. I'm neutral, safe, and here to help you understand each other better. What's on your mind?`,
      timestamp: Date.now()
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || isLoading) return;

    const userMsg: MediatorMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: inputText,
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setIsLoading(true);

    const context = { currentUser, partner, issues, appreciations };
    // Convert current messages to history format
    const history = messages.map(m => ({ role: m.role, text: m.text }));

    const responseText = await getMediatorResponse(userMsg.text, history, context);

    const botMsg: MediatorMessage = {
      id: (Date.now() + 1).toString(),
      role: 'model',
      text: responseText,
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, botMsg]);
    setIsLoading(false);
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 min-h-screen pb-24">
      <header className="bg-white/80 backdrop-blur-md sticky top-0 z-10 border-b border-indigo-100 px-6 py-4 flex items-center gap-3">
        <div className="bg-indigo-100 p-2 rounded-lg">
           <Bot className="text-indigo-600" size={24} />
        </div>
        <div>
           <h1 className="text-xl font-bold text-slate-800">AI Mediator</h1>
           <p className="text-xs text-indigo-500 font-medium">Unbiased • Context-Aware • Safe</p>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto p-4" ref={scrollRef}>
        <div className="space-y-6 max-w-2xl mx-auto">
           {/* Disclaimer */}
           <div className="text-[10px] text-center text-slate-400 bg-slate-100 py-2 rounded-lg mx-8">
              AI cannot replace professional therapy. In crisis, please seek professional help.
           </div>

           {messages.map((msg) => (
             <div 
               key={msg.id} 
               className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
             >
               <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center ${
                 msg.role === 'user' ? `bg-${currentUser.color}-100 text-${currentUser.color}-600` : 'bg-indigo-600 text-white'
               }`}>
                 {msg.role === 'user' ? <UserIcon size={14} /> : <Sparkles size={14} />}
               </div>
               
               <div className={`max-w-[80%] rounded-2xl p-4 shadow-sm text-sm leading-relaxed ${
                 msg.role === 'user' 
                  ? 'bg-white text-slate-800 rounded-tr-none border border-slate-100' 
                  : 'bg-indigo-600 text-indigo-50 rounded-tl-none'
               }`}>
                 {msg.text.split('\n').map((line, i) => (
                   <p key={i} className={line ? "mb-2 last:mb-0" : ""}>{line}</p>
                 ))}
                 <span className={`text-[10px] block mt-2 opacity-60 ${msg.role === 'model' ? 'text-indigo-200' : 'text-slate-400'}`}>
                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                 </span>
               </div>
             </div>
           ))}

           {isLoading && (
             <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white">
                    <Loader2 size={14} className="animate-spin" />
                </div>
                <div className="bg-indigo-50 rounded-2xl rounded-tl-none p-4 text-indigo-800 text-xs font-medium flex items-center gap-2">
                   Thinking and analyzing context...
                </div>
             </div>
           )}
        </div>
      </main>

      <div className="fixed bottom-[80px] left-0 right-0 max-w-md mx-auto px-4 z-20">
        <form onSubmit={handleSendMessage} className="bg-white p-2 rounded-2xl shadow-xl border border-slate-200 flex gap-2 items-center">
            <input
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Ask for advice or perspective..."
              className="flex-1 bg-transparent px-4 py-2 focus:outline-none text-slate-700 placeholder:text-slate-400"
            />
            <button 
              disabled={!inputText.trim() || isLoading}
              type="submit"
              className="bg-indigo-600 hover:bg-indigo-700 text-white p-3 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send size={18} />
            </button>
        </form>
      </div>
    </div>
  );
};