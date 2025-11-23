
import React, { useState } from 'react';
import { Memory, MemoryType, Issue, Appreciation } from '../types';
import { Map, Plane, Calendar, Trophy, Activity, Plus, X, MapPin, Star, Award } from 'lucide-react';

interface GrowthMapProps {
  memories: Memory[];
  issues: Issue[];
  appreciations: Appreciation[];
  onAddMemory: (memory: Omit<Memory, 'id' | 'authorId'>) => void;
}

const XP_VALUES = {
  MEMORY: 50,
  APPRECIATION: 10,
  RESOLVED_ISSUE: 30, // Assuming Sent/Read issues are "resolved" steps
};

const LEVELS = [
  { min: 0, title: "New Sparks", color: "from-blue-400 to-blue-600" },
  { min: 200, title: "Building Foundations", color: "from-teal-400 to-teal-600" },
  { min: 500, title: "Growing Together", color: "from-emerald-400 to-emerald-600" },
  { min: 1000, title: "Deep Connectors", color: "from-indigo-400 to-indigo-600" },
  { min: 2000, title: "Unshakeable Bond", color: "from-purple-400 to-purple-600" },
  { min: 5000, title: "Soulmates", color: "from-rose-400 to-rose-600" },
];

export const GrowthMap: React.FC<GrowthMapProps> = ({ memories, issues, appreciations, onAddMemory }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [newMemory, setNewMemory] = useState<{ title: string; type: MemoryType; date: string; location: string; description: string }>({
    title: '',
    type: 'DATE',
    date: new Date().toISOString().split('T')[0],
    location: '',
    description: ''
  });

  // --- GAMIFICATION LOGIC ---
  const sentIssuesCount = issues.filter(i => !i.isPrivate).length;
  const totalXP = 
    (memories.length * XP_VALUES.MEMORY) +
    (appreciations.length * XP_VALUES.APPRECIATION) +
    (sentIssuesCount * XP_VALUES.RESOLVED_ISSUE);

  const currentLevelIndex = LEVELS.findIndex((lvl, idx) => {
    const nextLvl = LEVELS[idx + 1];
    return totalXP >= lvl.min && (!nextLvl || totalXP < nextLvl.min);
  });
  const currentLevel = LEVELS[currentLevelIndex];
  const nextLevel = LEVELS[currentLevelIndex + 1];
  
  const progressToNext = nextLevel 
    ? ((totalXP - currentLevel.min) / (nextLevel.min - currentLevel.min)) * 100
    : 100;

  // --- RENDER HELPERS ---
  const getIcon = (type: MemoryType) => {
    switch (type) {
      case 'TRIP': return <Plane size={18} />;
      case 'MILESTONE': return <Trophy size={18} />;
      case 'ACTIVITY': return <Activity size={18} />;
      default: return <Calendar size={18} />;
    }
  };

  const getColor = (type: MemoryType) => {
    switch (type) {
      case 'TRIP': return 'bg-sky-100 text-sky-600 border-sky-200';
      case 'MILESTONE': return 'bg-amber-100 text-amber-600 border-amber-200';
      case 'ACTIVITY': return 'bg-emerald-100 text-emerald-600 border-emerald-200';
      default: return 'bg-rose-100 text-rose-600 border-rose-200';
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMemory.title) return;
    onAddMemory({
      type: newMemory.type,
      title: newMemory.title,
      description: newMemory.description,
      date: new Date(newMemory.date).getTime(),
      location: newMemory.location
    });
    setIsAdding(false);
    setNewMemory({ title: '', type: 'DATE', date: new Date().toISOString().split('T')[0], location: '', description: '' });
  };

  // Sort chronologically descending
  const sortedMemories = [...memories].sort((a, b) => b.date - a.date);

  return (
    <div className="flex flex-col h-full bg-slate-50 min-h-screen pb-24">
      {/* --- LEVEL HEADER --- */}
      <div className={`bg-gradient-to-br ${currentLevel.color} text-white p-6 rounded-b-3xl shadow-xl z-10 relative overflow-hidden`}>
        <div className="absolute top-0 right-0 p-4 opacity-10">
          <Award size={120} />
        </div>
        
        <div className="relative z-10">
          <div className="flex justify-between items-start mb-2">
            <div>
              <p className="text-white/80 text-xs font-bold uppercase tracking-widest mb-1">Relationship Status</p>
              <h1 className="text-3xl font-bold">{currentLevel.title}</h1>
            </div>
            <div className="bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold border border-white/30">
              Lvl {currentLevelIndex + 1}
            </div>
          </div>
          
          <div className="mt-6">
            <div className="flex justify-between text-xs font-medium mb-2 text-white/90">
              <span>{totalXP} XP</span>
              <span>{nextLevel ? `${nextLevel.min} XP` : 'Max Level'}</span>
            </div>
            <div className="h-3 bg-black/20 rounded-full overflow-hidden backdrop-blur-sm">
              <div 
                className="h-full bg-white/90 rounded-full transition-all duration-1000 ease-out shadow-[0_0_10px_rgba(255,255,255,0.5)]"
                style={{ width: `${progressToNext}%` }}
              />
            </div>
            <p className="text-[10px] text-white/70 mt-2 text-center">
              {nextLevel 
                ? `${nextLevel.min - totalXP} XP to next level (Add memories or appreciations!)` 
                : "You've reached the top together!"}
            </p>
          </div>
        </div>
      </div>

      {/* --- STATS ROW --- */}
      <div className="grid grid-cols-3 gap-2 px-4 -mt-4 relative z-20">
        <StatCard label="Dates" value={memories.filter(m => m.type === 'DATE').length} />
        <StatCard label="Trips" value={memories.filter(m => m.type === 'TRIP').length} />
        <StatCard label="Milestones" value={memories.filter(m => m.type === 'MILESTONE').length} />
      </div>

      {/* --- MEMORY TIMELINE --- */}
      <main className="flex-1 p-4 pt-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-bold text-slate-700 flex items-center gap-2">
            <Map size={20} className="text-slate-400" /> Memory Atlas
          </h2>
          <button 
            onClick={() => setIsAdding(true)}
            className="bg-deep-slate text-white p-2 rounded-full shadow-lg hover:scale-110 transition-transform"
          >
            <Plus size={20} />
          </button>
        </div>

        <div className="space-y-0 relative pl-4">
           {/* Vertical Line */}
           <div className="absolute left-[27px] top-4 bottom-0 w-0.5 bg-slate-200" />

           {sortedMemories.map((memory, index) => (
             <div key={memory.id} className="relative pl-8 pb-8 last:pb-0 group">
                {/* Node Dot */}
                <div className={`absolute left-0 w-14 h-14 rounded-full border-4 border-slate-50 flex items-center justify-center z-10 transition-transform group-hover:scale-110 ${getColor(memory.type)}`}>
                  {getIcon(memory.type)}
                </div>
                
                {/* Card */}
                <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm ml-4 hover:shadow-md transition-shadow">
                   <div className="flex justify-between items-start mb-1">
                      <h3 className="font-bold text-slate-800">{memory.title}</h3>
                      <span className="text-[10px] font-bold text-slate-400 bg-slate-50 px-2 py-1 rounded-full">
                        {new Date(memory.date).toLocaleDateString()}
                      </span>
                   </div>
                   {memory.location && (
                     <div className="flex items-center gap-1 text-xs text-slate-500 mb-2">
                        <MapPin size={12} /> {memory.location}
                     </div>
                   )}
                   {memory.description && (
                     <p className="text-sm text-slate-600 leading-relaxed">{memory.description}</p>
                   )}
                </div>
             </div>
           ))}
        </div>
      </main>

      {/* --- ADD MODAL --- */}
      {isAdding && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white w-full max-w-md rounded-2xl p-6 shadow-2xl animate-in slide-in-from-bottom-10">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-slate-800">Log Memory</h3>
              <button onClick={() => setIsAdding(false)} className="p-1 bg-slate-100 rounded-full hover:bg-slate-200">
                <X size={20} className="text-slate-500" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Title</label>
                <input 
                  required
                  value={newMemory.title}
                  onChange={e => setNewMemory({...newMemory, title: e.target.value})}
                  placeholder="e.g. First Coffee Date"
                  className="w-full p-3 rounded-xl bg-slate-50 border-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Date</label>
                  <input 
                    type="date"
                    required
                    value={newMemory.date}
                    onChange={e => setNewMemory({...newMemory, date: e.target.value})}
                    className="w-full p-3 rounded-xl bg-slate-50 border-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
                <div>
                   <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Type</label>
                   <select 
                      value={newMemory.type}
                      onChange={e => setNewMemory({...newMemory, type: e.target.value as MemoryType})}
                      className="w-full p-3 rounded-xl bg-slate-50 border-none focus:ring-2 focus:ring-teal-500 appearance-none"
                   >
                      <option value="DATE">Date Night</option>
                      <option value="TRIP">Trip</option>
                      <option value="MILESTONE">Milestone</option>
                      <option value="ACTIVITY">Activity</option>
                   </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Location (Optional)</label>
                <input 
                  value={newMemory.location}
                  onChange={e => setNewMemory({...newMemory, location: e.target.value})}
                  placeholder="e.g. Paris, France"
                  className="w-full p-3 rounded-xl bg-slate-50 border-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Description (Optional)</label>
                <textarea 
                  value={newMemory.description}
                  onChange={e => setNewMemory({...newMemory, description: e.target.value})}
                  placeholder="What made this special?"
                  rows={2}
                  className="w-full p-3 rounded-xl bg-slate-50 border-none focus:ring-2 focus:ring-teal-500 resize-none"
                />
              </div>

              <button type="submit" className="w-full bg-deep-slate text-white py-3 rounded-xl font-bold hover:bg-slate-700 transition-colors">
                Add to Atlas (+50 XP)
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

const StatCard = ({ label, value }: { label: string, value: number }) => (
  <div className="bg-white p-3 rounded-2xl shadow-md border border-slate-100 text-center">
    <p className="text-2xl font-bold text-slate-800">{value}</p>
    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">{label}</p>
  </div>
);
