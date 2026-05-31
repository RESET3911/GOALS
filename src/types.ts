export type GoalCategory = 'travel' | 'housing' | 'purchase' | 'saving' | 'event' | 'other';
export type GoalStatus = 'active' | 'achieved' | 'paused' | 'cancelled';

export interface Milestone {
  id: string;
  title: string;
  targetAmount: number;
  achievedAt: string | null;
}

export interface Goal {
  id: string;
  title: string;
  description: string | null;
  category: GoalCategory;
  targetAmount: number | null;
  targetDate: string | null; // YYYY-MM-DD
  currentAmount: number;
  linkedCashflow: boolean;
  milestones: Milestone[];
  status: GoalStatus;
  createdBy: string;
  sharedWith: string[];
  createdAt: number;
  updatedAt: number;
}

export const CATEGORY_LABELS: Record<GoalCategory, string> = {
  travel:   '旅行',
  housing:  '住居',
  purchase: '購入',
  saving:   '貯蓄',
  event:    'イベント',
  other:    'その他',
};

export const CATEGORY_ICONS: Record<GoalCategory, string> = {
  travel:   '✈️',
  housing:  '🏠',
  purchase: '🛍️',
  saving:   '💰',
  event:    '🎉',
  other:    '⭐',
};

export const CATEGORY_COLORS: Record<GoalCategory, string> = {
  travel:   'bg-sky-100 text-sky-700',
  housing:  'bg-amber-100 text-amber-700',
  purchase: 'bg-violet-100 text-violet-700',
  saving:   'bg-emerald-100 text-emerald-700',
  event:    'bg-rose-100 text-rose-700',
  other:    'bg-gray-100 text-gray-600',
};

export const STATUS_LABELS: Record<GoalStatus, string> = {
  active:    '進行中',
  achieved:  '達成',
  paused:    '一時停止',
  cancelled: 'キャンセル',
};

export function fmt(n: number): string {
  return '¥' + Math.round(n).toLocaleString('ja-JP');
}

export function calcRemainingMonths(targetDate: string | null): number | null {
  if (!targetDate) return null;
  const now = new Date();
  const target = new Date(targetDate + 'T00:00:00');
  const months = (target.getFullYear() - now.getFullYear()) * 12 + (target.getMonth() - now.getMonth());
  return Math.max(0, months);
}

export function calcRemainingDays(targetDate: string | null): number | null {
  if (!targetDate) return null;
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const target = new Date(targetDate + 'T00:00:00');
  const diff = Math.ceil((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  return diff;
}
