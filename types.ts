
export interface User {
  id: string;
  name: string;
  avatar: string;
  color: string;
  isReadyToReceive: boolean; // New toggle state
}

export enum MessageType {
  RAW_VENT = 'RAW_VENT',
  REFINED_ISSUE = 'REFINED_ISSUE',
  APPRECIATION = 'APPRECIATION'
}

export type Mood = 'ANGRY' | 'SAD' | 'ANXIOUS' | 'HURT' | 'FRUSTRATED' | 'NEUTRAL';

export interface Issue {
  id: string;
  authorId: string;
  contentRaw: string;
  contentRefined?: string;
  timestamp: number;
  status: 'DRAFT' | 'PENDING_DELIVERY' | 'DELIVERED' | 'READ';
  isPrivate: boolean; 
  mood?: Mood;
}

export interface Appreciation {
  id: string;
  authorId: string;
  content: string;
  timestamp: number;
  sticker?: string;
}

export interface MediatorMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: number;
}

export type MemoryType = 'DATE' | 'TRIP' | 'MILESTONE' | 'ACTIVITY';

export interface Memory {
  id: string;
  authorId: string; // Who logged it
  type: MemoryType;
  title: string;
  description?: string;
  date: number; // When it happened
  location?: string;
}

export interface AppState {
  currentUser: User;
  partner: User;
  issues: Issue[];
  appreciations: Appreciation[];
  memories: Memory[];
}
