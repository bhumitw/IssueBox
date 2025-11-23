
import React from 'react';
import { Heart, MessageSquareWarning, Home, Bot, Map } from 'lucide-react';

interface NavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  onSwitchUser: () => void;
  currentUser: { name: string; color: string };
}

export const Navigation: React.FC<NavigationProps> = ({ activeTab, onTabChange, onSwitchUser, currentUser }) => {
  const navItems = [
    { id: 'dashboard', label: 'Home', icon: Home },
    { id: 'issue-box', label: 'Issues', icon: MessageSquareWarning },
    { id: 'mediator', label: 'Mediator', icon: Bot },
    { id: 'growth', label: 'Growth', icon: Map },
    { id: 'appreciation', label: 'Love Jar', icon: Heart },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 safe-pb z-50">
      <div className="flex justify-between items-center max-w-md mx-auto px-6 py-3">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`flex flex-col items-center space-y-1 transition-colors ${
                isActive ? 'text-calm-teal font-medium' : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              <Icon size={24} strokeWidth={isActive ? 2.5 : 2} />
              <span className="text-[10px]">{item.label}</span>
            </button>
          );
        })}
        
        {/* User Switcher for Demo Purposes */}
        <button
          onClick={onSwitchUser}
          className="flex flex-col items-center space-y-1 text-slate-400 hover:text-deep-slate"
          title={`Switch from ${currentUser.name}`}
        >
          <div className={`w-6 h-6 rounded-full border-2 border-current flex items-center justify-center overflow-hidden bg-${currentUser.color}-100`}>
             <span className="text-[10px] font-bold uppercase">{currentUser.name[0]}</span>
          </div>
          <span className="text-[10px]">Profile</span>
        </button>
      </div>
    </div>
  );
};
