
import React, { useState } from 'react';
import { Issue, User, Mood } from '../types';
import { Mail, CheckCircle, ShieldCheck, ToggleLeft, ToggleRight, Lock, Angry, Frown, AlertCircle, HeartCrack, Meh } from 'lucide-react';

interface DashboardProps {
  incomingIssues: Issue[];
  currentUser: User;
  onToggleReady: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ incomingIssues, currentUser, onToggleReady }) => {
  const [readIssues, setReadIssues] = useState<Set<string>>(new Set());
  const [activeIssueId, setActiveIssueId] = useState<string | null>(null);

  const unreadCount = incomingIssues.filter(i => !readIssues.has(i.id)).length;

  const handleRead = (id: string) => {
    if (!currentUser.isReadyToReceive) return; // Prevent reading if not ready
    setActiveIssueId(activeIssueId === id ? null : id);
    if (!readIssues.has(id)) {
      setReadIssues(prev => new Set(prev).add(id));
    }
  };

  const getMoodIcon = (mood?: Mood) => {
    switch(mood) {
        case 'ANGRY': return <Angry size={14} className="text-red-400" />;
        case 'FRUSTRATED': return <Frown size={14} className="text-orange-400" />;
        case 'SAD': return <Meh size={14} className="text-blue-400" />;
        case 'ANXIOUS': return <AlertCircle size={14} className="text-purple-400" />;
        case 'HURT': return <HeartCrack size={14} className="text-rose-400" />;
        default: return null;
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 min-h-screen pb-24">
       <header className="bg-white/80 backdrop-blur-md sticky top-0 z-10 border-b border-slate-200 px-6 py-6">
        <div className="flex justify-between items-start">
            <div>
                <h1 className="text-2xl font-bold text-deep-slate">Hi, {currentUser.name.split(' ')[0]}.</h1>
                <p className="text-slate-500 text-sm mt-1">
                {unreadCount > 0 
                    ? `You have ${unreadCount} topic${unreadCount === 1 ? '' : 's'} waiting.` 
                    : "You're all caught up."}
                </p>
            </div>
            
            <button 
                onClick={onToggleReady}
                className={`flex flex-col items-end transition-colors ${currentUser.isReadyToReceive ? 'text-calm-teal' : 'text-slate-400'}`}
            >
                {currentUser.isReadyToReceive ? <ToggleRight size={40} className="fill-current" /> : <ToggleLeft size={40} />}
                <span className="text-[10px] font-bold uppercase tracking-wide mt-1">
                    {currentUser.isReadyToReceive ? 'Ready to Receive' : 'Not Ready'}
                </span>
            </button>
        </div>
       </header>

       <main className="flex-1 p-4 space-y-6">
          {/* Status Card */}
          <div className={`rounded-2xl p-6 text-white shadow-lg transition-all duration-500 ${
              currentUser.isReadyToReceive 
              ? 'bg-gradient-to-r from-calm-teal to-teal-400 shadow-teal-200' 
              : 'bg-slate-400 shadow-slate-200'
          }`}>
             <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-bold flex items-center gap-2">
                    {currentUser.isReadyToReceive ? <ShieldCheck size={20}/> : <Lock size={20} />} 
                    {currentUser.isReadyToReceive ? 'Open Heart Mode' : 'Protecting Your Peace'}
                  </h3>
                  <p className="text-white/90 text-sm mt-2 leading-relaxed">
                    {currentUser.isReadyToReceive 
                        ? "You are currently open to receiving issues from your partner. Remember to listen with curiosity."
                        : "Incoming issues are hidden until you feel mentally ready to process them. Take your time."}
                  </p>
                </div>
             </div>
          </div>

          <h2 className="text-lg font-bold text-slate-700 px-2 mt-4">Incoming Issues</h2>
          
          {incomingIssues.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-2xl border border-slate-100 border-dashed">
              <Mail className="mx-auto text-slate-300 mb-2" size={32} />
              <p className="text-slate-400 text-sm">No pending issues from your partner.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {incomingIssues.map(issue => {
                const isOpen = activeIssueId === issue.id;
                const isRead = readIssues.has(issue.id);
                const isBlurred = !currentUser.isReadyToReceive;
                const moodIcon = getMoodIcon(issue.mood);

                return (
                  <div 
                    key={issue.id} 
                    className={`bg-white rounded-2xl border transition-all duration-300 overflow-hidden ${
                      isOpen ? 'shadow-lg border-calm-teal ring-1 ring-calm-teal' : 'shadow-sm border-slate-200'
                    } ${isBlurred ? 'opacity-70' : 'opacity-100'}`}
                  >
                    <button 
                      onClick={() => handleRead(issue.id)}
                      disabled={isBlurred}
                      className="w-full text-left p-5 flex items-center justify-between group"
                    >
                      <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                          isRead ? 'bg-slate-100 text-slate-400' : 'bg-teal-100 text-teal-600'
                        }`}>
                          {isBlurred ? <Lock size={18} /> : <Mail size={18} />}
                        </div>
                        <div className="flex-1">
                          <p className={`font-medium ${isRead ? 'text-slate-600' : 'text-slate-900'}`}>
                            {isBlurred ? "Hidden Issue" : "Something on my mind..."}
                          </p>
                          <p className="text-xs text-slate-400 flex items-center gap-2">
                            {new Date(issue.timestamp).toLocaleDateString()}
                            {isBlurred && <span className="text-rose-400 font-medium">• Switch toggle to view</span>}
                            {!isBlurred && issue.mood && (
                                <span className="flex items-center gap-1 bg-slate-50 px-2 py-0.5 rounded-full border border-slate-100 ml-2">
                                    {moodIcon}
                                    <span className="capitalize">{issue.mood.toLowerCase()}</span>
                                </span>
                            )}
                          </p>
                        </div>
                      </div>
                      {!isBlurred && isRead && !isOpen && <CheckCircle size={16} className="text-slate-300" />}
                    </button>

                    {isOpen && !isBlurred && (
                      <div className="px-5 pb-6 pt-0 animate-in slide-in-from-top-2">
                        <hr className="border-slate-100 mb-4" />
                        <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 text-slate-700 leading-relaxed">
                          {issue.contentRefined}
                        </div>
                        <div className="mt-4 flex justify-end">
                           <button 
                            onClick={() => setActiveIssueId(null)}
                            className="text-xs text-slate-400 hover:text-slate-600 font-medium"
                           >
                             Collapse
                           </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
       </main>
    </div>
  );
};
