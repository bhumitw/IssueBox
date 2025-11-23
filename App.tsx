
import React, { useState, useEffect } from 'react';
import { User, Issue, Appreciation, AppState, Memory, Mood } from './types';
import { Navigation } from './components/Navigation';
import { AppreciationBox } from './components/AppreciationBox';
import { IssueBox } from './components/IssueBox';
import { Dashboard } from './components/Dashboard';
import { Mediator } from './components/Mediator';
import { GrowthMap } from './components/GrowthMap';

// --- MOCK DATA GENERATION ---
const USER_A: User = { id: 'user_1', name: 'Alex', avatar: 'A', color: 'blue', isReadyToReceive: true };
const USER_B: User = { id: 'user_2', name: 'Sam', avatar: 'S', color: 'emerald', isReadyToReceive: false };

const generateMockData = () => {
  const issues: Issue[] = [];
  const appreciations: Appreciation[] = [];
  const memories: Memory[] = [];
  const now = Date.now();
  const day = 86400000;

  // Helper to go back in time
  const timeAgo = (days: number) => now - (days * day);

  // 1. Initial Honeymoon Phase (6 months ago)
  memories.push({
    id: 'mem_1', authorId: USER_A.id, type: 'DATE', 
    title: 'First Coffee Date', description: 'The one where we talked for 4 hours.', 
    date: timeAgo(180), location: 'Bean & Leaf Cafe'
  });
  memories.push({
    id: 'mem_2', authorId: USER_B.id, type: 'MILESTONE',
    title: 'First "I Love You"', date: timeAgo(160), location: 'Central Park'
  });

  appreciations.push({
    id: 'app_1', authorId: USER_A.id, content: "Thanks for cooking dinner tonight, it was amazing!", timestamp: timeAgo(175)
  });
  appreciations.push({
    id: 'app_2', authorId: USER_B.id, content: "I love how you listen to me.", timestamp: timeAgo(170)
  });

  // 2. First Conflict (5 months ago) - Chores
  issues.push({
    id: 'issue_1', authorId: USER_A.id, 
    contentRaw: "I hate that I always do the dishes.", 
    contentRefined: "I feel overwhelmed when I do the dishes alone every night. I have a need for support and shared responsibility.",
    timestamp: timeAgo(150), status: 'READ', isPrivate: false, mood: 'FRUSTRATED'
  });
  
  // 3. Middle Phase (3 months ago) - Quality Time
  memories.push({
    id: 'mem_3', authorId: USER_A.id, type: 'TRIP',
    title: 'Weekend in Cabin', description: 'No internet, just us and the fireplace.',
    date: timeAgo(100), location: 'Upstate'
  });
  
  issues.push({
    id: 'issue_2', authorId: USER_B.id,
    contentRaw: "You are always on your phone.",
    contentRefined: "I feel lonely when we are together but you are on your phone. I value our connection and quality time.",
    timestamp: timeAgo(90), status: 'READ', isPrivate: false, mood: 'SAD'
  });
  appreciations.push({
    id: 'app_3', authorId: USER_A.id, content: "Thank you for planning that weekend trip.", timestamp: timeAgo(88)
  });

  // 4. Recent Past (2 weeks ago) - Private Vents
  memories.push({
    id: 'mem_4', authorId: USER_B.id, type: 'ACTIVITY',
    title: 'Pottery Class', description: 'We made terrible bowls but laughed a lot.',
    date: timeAgo(20), location: 'Art Studio'
  });

  issues.push({
    id: 'issue_3', authorId: USER_A.id,
    contentRaw: "I'm frustrated about the budget but I don't know how to bring it up without a fight.",
    contentRefined: "I feel anxious about our finances and need reassurance that we are on the same page.",
    timestamp: timeAgo(14), status: 'DRAFT', isPrivate: true, mood: 'ANXIOUS'
  });

  // 5. Current (Today)
  issues.push({
    id: 'issue_4', authorId: USER_B.id,
    contentRaw: "Why didn't you text me back?",
    contentRefined: "I felt worried when I didn't hear back from you. I need to know you're safe.",
    timestamp: now - 3600000, status: 'PENDING_DELIVERY', isPrivate: false, mood: 'ANXIOUS'
  });

  return { issues, appreciations, memories };
};

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User>(USER_A);
  const [partnerUser, setPartnerUser] = useState<User>(USER_B);
  const [activeTab, setActiveTab] = useState('dashboard');

  // Application Data (Simulating Database)
  const [issues, setIssues] = useState<Issue[]>([]);
  const [appreciations, setAppreciations] = useState<Appreciation[]>([]);
  const [memories, setMemories] = useState<Memory[]>([]);

  // Load Mock Data once
  useEffect(() => {
    const data = generateMockData();
    setIssues(data.issues);
    setAppreciations(data.appreciations);
    setMemories(data.memories);
  }, []);

  const handleSwitchUser = () => {
    // Swap current and partner reference
    const newCurrent = partnerUser;
    const newPartner = currentUser;
    setCurrentUser(newCurrent);
    setPartnerUser(newPartner);
    setActiveTab('dashboard');
  };

  const handleToggleReady = () => {
    setCurrentUser(prev => ({ ...prev, isReadyToReceive: !prev.isReadyToReceive }));
  };

  const handleAddAppreciation = (content: string) => {
    const newAppreciation: Appreciation = {
      id: Date.now().toString(),
      authorId: currentUser.id,
      content,
      timestamp: Date.now(),
    };
    setAppreciations(prev => [...prev, newAppreciation]);
  };

  const handleAddMemory = (memory: Omit<Memory, 'id' | 'authorId'>) => {
    const newMemory: Memory = {
      id: Date.now().toString(),
      authorId: currentUser.id,
      ...memory
    };
    setMemories(prev => [...prev, newMemory]);
  };

  const handleSaveIssue = (id: string | null, contentRaw: string, contentRefined: string | undefined, isPrivate: boolean, mood?: Mood) => {
    if (id) {
        // Update existing (e.g., from draft to sent, or updating draft)
        setIssues(prev => prev.map(issue => 
            issue.id === id 
            ? { 
                ...issue, 
                contentRaw, 
                contentRefined, 
                isPrivate, 
                status: isPrivate ? 'DRAFT' : 'PENDING_DELIVERY',
                timestamp: Date.now(), // Update timestamp on edit
                mood: mood || issue.mood
              } 
            : issue
        ));
    } else {
        // Create new
        const newIssue: Issue = {
            id: Date.now().toString(),
            authorId: currentUser.id,
            contentRaw,
            contentRefined,
            timestamp: Date.now(),
            status: isPrivate ? 'DRAFT' : 'PENDING_DELIVERY',
            isPrivate,
            mood
        };
        setIssues(prev => [...prev, newIssue]);
    }
  };

  const handleDeleteIssue = (id: string) => {
    setIssues(prev => prev.filter(i => i.id !== id));
  };

  // Incoming issues are those written by partner, shared (not private)
  const incomingIssues = issues.filter(i => i.authorId !== currentUser.id && !i.isPrivate);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-teal-100">
      
      {/* Content Area */}
      <div className="max-w-md mx-auto bg-white min-h-screen shadow-2xl relative">
        
        {activeTab === 'dashboard' && (
          <Dashboard 
            currentUser={currentUser} 
            incomingIssues={incomingIssues}
            onToggleReady={handleToggleReady}
          />
        )}
        
        {activeTab === 'issue-box' && (
          <IssueBox 
            issues={issues}
            currentUser={currentUser}
            onSaveIssue={handleSaveIssue}
            onDeleteIssue={handleDeleteIssue}
          />
        )}

        {activeTab === 'mediator' && (
          <Mediator 
            currentUser={currentUser}
            partner={partnerUser}
            issues={issues}
            appreciations={appreciations}
          />
        )}

        {activeTab === 'growth' && (
          <GrowthMap 
            memories={memories}
            issues={issues}
            appreciations={appreciations}
            onAddMemory={handleAddMemory}
          />
        )}
        
        {activeTab === 'appreciation' && (
          <AppreciationBox 
            appreciations={appreciations}
            currentUser={currentUser}
            onAddAppreciation={handleAddAppreciation}
          />
        )}

        <Navigation 
          activeTab={activeTab} 
          onTabChange={setActiveTab}
          onSwitchUser={handleSwitchUser}
          currentUser={currentUser}
        />
      </div>
    </div>
  );
};

export default App;
