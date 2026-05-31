import type { Goal } from '../types';
import { CATEGORY_ICONS, CATEGORY_LABELS, CATEGORY_COLORS, fmt, calcRemainingDays } from '../types';

interface Props {
  goals: Goal[];
  tab: 'active' | 'achieved';
  savingsBalance: number;
  onSelect: (id: string) => void;
}

function GoalCard({ goal, savingsBalance, onSelect }: { goal: Goal; savingsBalance: number; onSelect: () => void }) {
  const current = goal.linkedCashflow ? savingsBalance : goal.currentAmount;
  const target = goal.targetAmount ?? 0;
  const pct = target > 0 ? Math.min(100, Math.round(current / target * 100)) : 0;
  const days = calcRemainingDays(goal.targetDate);

  return (
    <button
      onClick={onSelect}
      className="w-full text-left bg-white rounded-2xl p-4 shadow-sm border border-gray-100 active:scale-[0.98] transition-transform"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-2xl leading-none flex-shrink-0">{CATEGORY_ICONS[goal.category]}</span>
          <div className="min-w-0">
            <div className="font-bold text-gray-900 text-sm leading-tight truncate">{goal.title}</div>
            <span className={`inline-block text-xs px-2 py-0.5 rounded-full mt-1 font-medium ${CATEGORY_COLORS[goal.category]}`}>
              {CATEGORY_LABELS[goal.category]}
            </span>
          </div>
        </div>
        <div className="text-right flex-shrink-0 ml-3">
          <div className="text-lg font-extrabold text-emerald-600 leading-none">{pct}%</div>
          {days !== null && (
            <div className={`text-xs mt-1 font-medium ${days <= 30 ? 'text-rose-500' : days <= 90 ? 'text-amber-500' : 'text-gray-400'}`}>
              {days > 0 ? `あと${days}日` : days === 0 ? '今日まで' : `${Math.abs(days)}日超過`}
            </div>
          )}
        </div>
      </div>

      {/* Progress bar */}
      <div className="mb-2">
        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-teal-500 transition-all"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      <div className="flex justify-between text-xs text-gray-400">
        <span>{fmt(current)}</span>
        {target > 0 && <span>目標 {fmt(target)}</span>}
      </div>

      {goal.linkedCashflow && (
        <div className="mt-2 text-xs text-emerald-600 font-medium flex items-center gap-1">
          <span>🔗</span><span>CASHFLOW連動中</span>
        </div>
      )}
    </button>
  );
}

export default function GoalListScreen({ goals, tab, savingsBalance, onSelect }: Props) {
  const filtered = goals.filter(g =>
    tab === 'active'
      ? g.status === 'active' || g.status === 'paused'
      : g.status === 'achieved' || g.status === 'cancelled'
  );

  if (filtered.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center pt-20 px-8 text-center">
        <div className="text-5xl mb-4">{tab === 'active' ? '🎯' : '🏆'}</div>
        <p className="text-gray-400 text-sm">
          {tab === 'active' ? 'まだゴールがありません。\n右下の＋から追加しましょう！' : '達成済みゴールはありません'}
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3 px-4 pt-4 pb-28">
      {filtered.map(goal => (
        <GoalCard
          key={goal.id}
          goal={goal}
          savingsBalance={savingsBalance}
          onSelect={() => onSelect(goal.id)}
        />
      ))}
    </div>
  );
}
