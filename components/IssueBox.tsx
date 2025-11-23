
import React, { useState, useRef } from 'react';
import { Issue, User, Mood } from '../types';
import { Lock, Wand2, ArrowRight, PenLine, Send, Trash2, RefreshCcw, FileText, CheckCircle2, Angry, Frown, AlertCircle, HeartCrack, Meh } from 'lucide-react';
import { softenMessage } from '../services/geminiService';

interface IssueBoxProps {
  issues: Issue[];
  currentUser: User;
  onSaveIssue: (id: string | null, contentRaw: string, contentRefined: string | undefined, isPrivate: boolean, mood?: Mood) => void;
  onDeleteIssue: (id: string) => void;
}

type TabMode = 'compose' | 'drafts' | 'sent';

export const IssueBox: React.FC<IssueBoxProps> = ({ issues, currentUser, onSaveIssue, onDeleteIssue }) => {
  const [activeMode, setActiveMode] = useState<TabMode>('compose');
  
  // Editor State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [rawText, setRawText] = useState('');
  const [selectedMood, setSelectedMood] = useState<Mood | undefined>(undefined);
  const [isProcessing, setIsProcessing] = useState(false);
  const [refinedText, setRefinedText] = useState<string | null>(null);
  
  const analysisRef = useRef<HTMLDivElement>(null);

  const MOODS: { id: Mood; label: string; icon: any; color: string }[] = [
    { id: 'ANGRY', label: 'Angry', icon: Angry, color: 'hover:bg-red-100 text-red-500' },
    { id: 'FRUSTRATED', label: 'Frustrated', icon: Frown, color: 'hover:bg-orange-100 text-orange-500' },
    { id: 'SAD', label: 'Sad', icon: Meh, color: 'hover:bg-blue-100 text-blue-500' },
    { id: 'ANXIOUS', label: 'Anxious', icon: AlertCircle, color: 'hover:bg-purple-100 text-purple-500' },
    { id: 'HURT', label: 'Hurt', icon: HeartCrack, color: 'hover:bg-rose-100 text-rose-500' },
  ];

  // Load a draft into the editor
  const handleEditDraft = (issue: Issue) => {
    setEditingId(issue.id);
    setRawText(issue.contentRaw);
    setRefinedText(issue.contentRefined || null);
    setSelectedMood(issue.mood);
    setActiveMode('compose');
  };

  const handleAiProcess = async () => {
    if (!rawText.trim()) return;
    setIsProcessing(true);
    const result = await softenMessage(rawText);
    setRefinedText(result);
    setIsProcessing(false);
    
    setTimeout(() => {
      analysisRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const handleSavePrivate = () => {
    onSaveIssue(editingId, rawText, refinedText || undefined, true, selectedMood);
    resetForm();
    setActiveMode('drafts');
  };

  const handleSendToPartner = () => {
    if (refinedText) {
      onSaveIssue(editingId, rawText, refinedText, false, selectedMood);
      resetForm();
      setActiveMode('sent');
    }
  };

  const resetForm = () => {
    setRawText('');
    setRefinedText(null);
    setEditingId(null);
    setSelectedMood(undefined);
  };

  // Filter lists
  const myDrafts = issues.filter(i => i.authorId === currentUser.id && i.isPrivate).sort((a, b) => b.timestamp - a.timestamp);
  const mySent = issues.filter(i => i.authorId === currentUser.id && !i.isPrivate).sort((a, b) => b.timestamp - a.timestamp);

  return (
    <div className="flex flex-col h-full bg-slate-50 min-h-screen pb-24">
      <header className="bg-white sticky top-0 z-10 border-b border-slate-200">
        <div className="px-6 py-4">
            <h1 className="text-2xl font-bold text-deep-slate mb-4">Issue Box</h1>
            <div className="flex bg-slate-100 p-1 rounded-xl">
            {(['compose', 'drafts', 'sent'] as TabMode[]).map((mode) => (
                <button
                key={mode}
                onClick={() => {
                    setActiveMode(mode);
                    if (mode === 'compose' && activeMode !== 'compose') resetForm();
                }}
                className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all capitalize ${
                    activeMode === mode 
                    ? 'bg-white text-calm-teal shadow-sm' 
                    : 'text-slate-500 hover:text-slate-700'
                }`}
                >
                {mode}
                </button>
            ))}
            </div>
        </div>
      </header>

      <main className="flex-1 p-4 overflow-y-auto">
        {activeMode === 'compose' && (
          <div className="max-w-2xl mx-auto space-y-6">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="bg-slate-50 px-4 py-3 border-b border-slate-100 flex items-center justify-between">
                <span className="flex items-center gap-2 text-slate-500 text-xs font-semibold uppercase tracking-wider">
                    <PenLine size={14} /> {editingId ? 'Editing Draft' : 'New Issue'}
                </span>
                {editingId && (
                    <button onClick={resetForm} className="text-xs text-rose-500 hover:underline">Cancel Edit</button>
                )}
              </div>
              
              {/* Mood Selector */}
              <div className="px-4 pt-4 pb-2">
                 <p className="text-xs font-bold text-slate-400 uppercase mb-2">How are you feeling?</p>
                 <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                    {MOODS.map(m => {
                        const Icon = m.icon;
                        const isSelected = selectedMood === m.id;
                        return (
                            <button
                                key={m.id}
                                onClick={() => setSelectedMood(m.id)}
                                className={`flex flex-col items-center gap-1 p-2 min-w-[70px] rounded-xl border transition-all ${
                                    isSelected 
                                    ? `bg-slate-800 border-slate-800 text-white shadow-md transform scale-105` 
                                    : `bg-white border-slate-200 text-slate-500 ${m.color}`
                                }`}
                            >
                                <Icon size={20} />
                                <span className="text-[10px] font-medium">{m.label}</span>
                            </button>
                        );
                    })}
                 </div>
              </div>

              {/* Text Area with Dark Background and White Text */}
              <textarea
                value={rawText}
                onChange={(e) => setRawText(e.target.value)}
                placeholder="Type exactly how you feel. Don't worry about being polite here. Get it all out..."
                className="w-full h-48 p-4 resize-none focus:outline-none bg-slate-800 text-white leading-relaxed placeholder:text-slate-500"
              />
              
              <div className="p-3 bg-slate-50 border-t border-slate-100 flex justify-between items-center gap-3">
                <button
                  onClick={handleSavePrivate}
                  disabled={!rawText.trim() || isProcessing}
                  className="flex-1 px-4 py-3 text-slate-600 bg-white border border-slate-200 text-sm font-medium hover:bg-slate-50 rounded-xl transition-colors flex items-center justify-center gap-2 shadow-sm"
                >
                  <Lock size={16} /> Save Draft
                </button>
                <button
                  onClick={handleAiProcess}
                  disabled={!rawText.trim() || isProcessing}
                  className="flex-1 px-4 py-3 bg-deep-slate text-white text-sm font-medium rounded-xl hover:bg-slate-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 shadow-sm"
                >
                  {isProcessing ? <RefreshCcw className="animate-spin" size={16} /> : <Wand2 size={16} />}
                  Refine with AI
                </button>
              </div>
            </div>

            {/* AI Result Area */}
            {refinedText && (
              <div ref={analysisRef} className="animate-in fade-in slide-in-from-bottom-8 duration-500 pb-8">
                <div className="flex justify-center mb-4">
                  <ArrowRight className="text-slate-300 transform rotate-90" size={24} />
                </div>
                <div className="bg-white rounded-2xl shadow-lg border border-teal-100 overflow-hidden relative ring-1 ring-teal-500/20">
                   <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                     <Wand2 size={120} className="text-teal-600" />
                   </div>
                  <div className="bg-gradient-to-r from-calm-teal to-teal-500 px-4 py-3 border-b border-teal-400 flex items-center gap-2 text-white text-xs font-bold uppercase tracking-wider">
                    <Wand2 size={14} /> Partner-Ready Version
                  </div>
                  <div className="p-6 text-slate-800 leading-relaxed text-lg font-medium">
                    {refinedText}
                  </div>
                  <div className="p-4 bg-teal-50 flex justify-end gap-3 border-t border-teal-100">
                     <button
                      onClick={() => setRefinedText(null)}
                      className="px-4 py-2 text-slate-500 text-sm font-medium hover:bg-slate-100 rounded-lg transition-colors"
                    >
                      Edit Raw Text
                    </button>
                    <button
                      onClick={handleSendToPartner}
                      className="px-6 py-2 bg-calm-teal text-white text-sm font-bold rounded-lg hover:bg-teal-600 transition-colors shadow-md flex items-center gap-2 transform active:scale-95"
                    >
                      Send Now <Send size={16} />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {activeMode === 'drafts' && (
            <div className="space-y-4 max-w-2xl mx-auto">
                {myDrafts.length === 0 ? (
                    <EmptyState icon={FileText} message="No drafts saved." subMessage="Save raw thoughts here to refine later." />
                ) : (
                    myDrafts.map(draft => (
                        <div key={draft.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow group">
                            <div className="flex justify-between items-start mb-3">
                                <span className="text-[10px] font-bold bg-slate-100 text-slate-500 px-2 py-1 rounded-full uppercase tracking-wider flex items-center gap-1">
                                    <Lock size={10} /> Private
                                    {draft.mood && <span className="ml-1 px-1 bg-slate-200 rounded-sm text-slate-600">{draft.mood}</span>}
                                </span>
                                <span className="text-xs text-slate-400">{new Date(draft.timestamp).toLocaleDateString()}</span>
                            </div>
                            <p className="text-slate-600 line-clamp-3 mb-4">{draft.contentRaw}</p>
                            <div className="flex justify-end gap-3 pt-3 border-t border-slate-50">
                                <button onClick={() => onDeleteIssue(draft.id)} className="text-slate-400 hover:text-red-500 p-2 transition-colors">
                                    <Trash2 size={16} />
                                </button>
                                <button 
                                    onClick={() => handleEditDraft(draft)}
                                    className="text-calm-teal font-medium text-sm flex items-center gap-2 hover:bg-teal-50 px-3 py-1.5 rounded-lg transition-colors"
                                >
                                    Open & Refine <ArrowRight size={14} />
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        )}

        {activeMode === 'sent' && (
             <div className="space-y-4 max-w-2xl mx-auto">
             {mySent.length === 0 ? (
                 <EmptyState icon={Send} message="No sent issues." subMessage="When you send a refined issue, it appears here." />
             ) : (
                 mySent.map(issue => (
                     <div key={issue.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                         <div className="flex justify-between items-start mb-3">
                             <div className="flex gap-2">
                                <span className="text-[10px] font-bold bg-teal-50 text-teal-600 px-2 py-1 rounded-full uppercase tracking-wider flex items-center gap-1">
                                    <CheckCircle2 size={10} /> Sent
                                </span>
                                {issue.mood && (
                                    <span className="text-[10px] font-bold bg-slate-100 text-slate-500 px-2 py-1 rounded-full uppercase tracking-wider">
                                        {issue.mood}
                                    </span>
                                )}
                             </div>
                             <span className="text-xs text-slate-400">{new Date(issue.timestamp).toLocaleDateString()}</span>
                         </div>
                         <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 mb-3">
                            <p className="text-slate-800 font-medium">{issue.contentRefined}</p>
                         </div>
                         <div className="px-1">
                             <p className="text-[10px] text-slate-400 uppercase font-bold mb-1">Original Vent</p>
                             <p className="text-slate-400 text-xs italic line-clamp-1">{issue.contentRaw}</p>
                         </div>
                     </div>
                 ))
             )}
         </div>
        )}
      </main>
    </div>
  );
};

const EmptyState = ({ icon: Icon, message, subMessage }: { icon: any, message: string, subMessage: string }) => (
    <div className="flex flex-col items-center justify-center py-20 text-center opacity-60">
        <div className="bg-slate-100 p-4 rounded-full mb-4">
            <Icon className="text-slate-400" size={32} />
        </div>
        <p className="text-slate-800 font-medium">{message}</p>
        <p className="text-slate-500 text-sm mt-1">{subMessage}</p>
    </div>
);
