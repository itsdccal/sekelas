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

/** Admin milestone type — combines milestone + badge for management */
export interface AdminMilestone {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  xpThreshold: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateMilestoneRequest {
  name: string;
  description: string;
  imageUrl: string;
  xpThreshold: number;
  isActive?: boolean;
}

export interface UpdateMilestoneRequest {
  name?: string;
  description?: string;
  imageUrl?: string;
  xpThreshold?: number;
  isActive?: boolean;
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
