export interface Badge {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  isEarned: boolean;
  earnedAt?: string; // ISO datetime
}

export interface Milestone {
  id: string;
  name: string;
  xpThreshold: number;
  badgeId: string;
}

export interface XPEvent {
  id: string;
  amount: number;
  source: 'VIDEO_COMPLETE' | 'QUIZ_PASS' | 'QUIZ_PASS_REMEDIATION';
  timestamp: string;
}

export interface GamificationState {
  totalXP: number;
  currentMilestone: Milestone | null;
  nextMilestone: Milestone | null;
  badges: Badge[];
  recentXPEvents: XPEvent[];
}
