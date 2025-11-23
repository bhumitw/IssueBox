import React, { useState } from 'react';
import { Appreciation, User } from '../types';
import { Heart, Send, Plus, Sparkles } from 'lucide-react';

interface AppreciationBoxProps {
  appreciations: Appreciation[];
  currentUser: User;
  onAddAppreciation: (text: string) => void;
}

export const AppreciationBox: React.FC<AppreciationBoxProps> = ({ appreciations, currentUser, onAddAppreciation }) => {
  const [isComposing, setIsComposing] = useState(false);
  const [text, setText] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    onAddAppreciation(text);
    setText('');
    setIsComposing(false);
  };

  // Sort by newest first
  const sortedAppreciations = [...appreciations].sort((a, b) => b.timestamp - a.timestamp);

  return (
    <div className="flex flex-col h-full bg-rose-50/50 min-h-screen pb-24">
      <header className="bg-white/80 backdrop-blur-md sticky top-0 z-10 border-b border-rose-100 px-6 py-4 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-rose-900 flex items-center gap-2">
            Appreciation Box <Heart className="fill-rose-500 text-rose-500" size={24} />
          </h1>
          <p className="text-sm text-rose-700 opacity-80">Little things matter.</p>
        </div>
        <button 
          onClick={() => setIsComposing(!isComposing)}
          className="bg-rose-500 hover:bg-rose-600 text-white p-2 rounded-full shadow-lg transition-transform active:scale-95"
        >
          <Plus size={24} />
        </button>
      </header>

      <main className="flex-1 p-4 space-y-4 overflow-y-auto">
        {isComposing && (
          <div className="bg-white rounded-2xl p-4 shadow-xl border border-rose-100 animate-in slide-in-from-top-4 duration-300">
            <form onSubmit={handleSubmit}>
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="What did your partner do that made you smile?"
                className="w-full p-3 rounded-xl bg-rose-50 border-none focus:ring-2 focus:ring-rose-300 resize-none text-slate-700 placeholder:text-rose-300"
                rows={3}
                autoFocus
              />
              <div className="flex justify-end mt-2 gap-2">
                <button
                  type="button"
                  onClick={() => setIsComposing(false)}
                  className="px-4 py-2 text-slate-500 text-sm font-medium hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!text.trim()}
                  className="px-4 py-2 bg-rose-500 text-white rounded-lg text-sm font-medium flex items-center gap-2 disabled:opacity-50 hover:bg-rose-600 transition-colors"
                >
                  Send Love <Send size={16} />
                </button>
              </div>
            </form>
          </div>
        )}

        {sortedAppreciations.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center opacity-60">
            <Sparkles className="text-rose-300 mb-4" size={48} />
            <p className="text-rose-800 font-medium">No appreciations yet.</p>
            <p className="text-rose-600 text-sm">Be the first to share some love!</p>
          </div>
        ) : (
          sortedAppreciations.map((item) => (
            <div 
              key={item.id} 
              className={`bg-white rounded-2xl p-5 shadow-sm border border-rose-100 relative overflow-hidden group hover:shadow-md transition-shadow ${
                 item.authorId === currentUser.id ? 'ml-8 rounded-tr-none' : 'mr-8 rounded-tl-none'
              }`}
            >
              <div className="absolute top-0 right-0 p-3 opacity-10">
                <Heart size={80} className="fill-current text-rose-500 transform rotate-12 translate-x-4 -translate-y-4" />
              </div>
              <p className="text-slate-800 relative z-10 leading-relaxed font-medium">
                {item.content}
              </p>
              <div className="flex justify-between items-center mt-3 relative z-10">
                <span className="text-xs text-rose-400 font-medium bg-rose-50 px-2 py-1 rounded-full">
                  {item.authorId === currentUser.id ? 'You' : 'Partner'}
                </span>
                <span className="text-[10px] text-slate-400">
                  {new Date(item.timestamp).toLocaleDateString()}
                </span>
              </div>
            </div>
          ))
        )}
      </main>
    </div>
  );
};