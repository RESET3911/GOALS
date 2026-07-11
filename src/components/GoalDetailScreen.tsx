import { localDateStr } from '../shared/date';
import { useState, useCallback } from 'react';
import type { Goal, Milestone } from '../types';
import {
  CATEGORY_ICONS, CATEGORY_LABELS, fmt,
  calcRemainingDays, calcRemainingMonths,
} from '../types';
import ProgressCircle from './ProgressCircle';

interface Props {
  goal: Goal;
  savingsBalance: number;
  onBack: () => void;
  onUpdate: (goal: Goal) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onEdit: () => void;
}

export default function GoalDetailScreen({
  goal, savingsBalance, onBack, onUpdate, onDelete, onEdit,
}: Props) {
  const [showSavingsModal, setShowSavingsModal] = useState(false);
  const [savingsInput, setSavingsInput] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const current = goal.linkedCashflow ? savingsBalance : goal.currentAmount;
  const target = goal.targetAmount ?? 0;
  const pct = target > 0 ? Math.min(100, Math.round(current / target * 100)) : 0;
  const remaining = Math.max(0, target - current);
  const days = calcRemainingDays(goal.targetDate);
  const months = calcRemainingMonths(goal.targetDate);
  const monthlyNeeded = months && months > 0 && remaining > 0
    ? Math.ceil(remaining / months)
    : null;

  const toggleMilestone = useCallback(async (ms: Milestone) => {
    const updated: Goal = {
      ...goal,
      milestones: goal.milestones.map(m =>
        m.id === ms.id
          ? { ...m, achievedAt: m.achievedAt ? null : localDateStr() }
          : m
      ),
      updatedAt: Date.now(),
    };
    await onUpdate(updated);
  }, [goal, onUpdate]);

  const handleAddSavings = useCallback(async () => {
    const n = parseInt(savingsInput.replace(/,/g, ''), 10);
    if (isNaN(n) || n <= 0) return;
    const updated: Goal = {
      ...goal,
      currentAmount: goal.currentAmount + n,
      updatedAt: Date.now(),
    };
    await onUpdate(updated);
    setSavingsInput('');
    setShowSavingsModal(false);
  }, [goal, onUpdate, savingsInput]);

  const handleToggleCashflow = useCallback(async () => {
    const updated: Goal = {
      ...goal,
      linkedCashflow: !goal.linkedCashflow,
      updatedAt: Date.now(),
    };
    await onUpdate(updated);
  }, [goal, onUpdate]);

  const handleMarkAchieved = useCallback(async () => {
    const updated: Goal = {
      ...goal,
      status: goal.status === 'achieved' ? 'active' : 'achieved',
      updatedAt: Date.now(),
    };
    await onUpdate(updated);
  }, [goal, onUpdate]);

  const handleDelete = useCallback(async () => {
    await onDelete(goal.id);
    onBack();
  }, [goal.id, onDelete, onBack]);

  return (
    <div className="flex flex-col min-h-dvh">
      {/* Header */}
      <header className="flex items-center justify-between px-4 pt-3 pb-2 bg-white/70 backdrop-blur-sm sticky top-0 z-30 border-b border-gray-100">
        <button onClick={onBack} className="flex items-center gap-1 text-emerald-600 text-sm font-medium">
          ← 戻る
        </button>
        <span className="font-bold text-gray-900 text-sm truncate max-w-[160px]">{goal.title}</span>
        <button
          onClick={onEdit}
          className="text-sm text-gray-400 font-medium px-2 py-1 rounded-lg"
        >編集</button>
      </header>

      <div className="flex-1 px-4 pt-5 pb-32 flex flex-col gap-4">
        {/* Category & Status */}
        <div className="flex items-center gap-2">
          <span className="text-3xl">{CATEGORY_ICONS[goal.category]}</span>
          <span className="text-sm font-semibold text-gray-500">{CATEGORY_LABELS[goal.category]}</span>
          {goal.status === 'achieved' && (
            <span className="ml-auto text-xs bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full font-bold">🏆 達成</span>
          )}
          {goal.status === 'paused' && (
            <span className="ml-auto text-xs bg-amber-100 text-amber-700 px-2 py-1 rounded-full font-bold">⏸ 一時停止</span>
          )}
        </div>

        {/* Progress Circle */}
        <div className="bg-white rounded-2xl p-5 shadow-sm flex flex-col items-center gap-4">
          <ProgressCircle
            pct={pct}
            size={180}
            strokeWidth={14}
            label={`${pct}%`}
            sublabel={goal.status === 'achieved' ? '🏆 達成！' : target > 0 ? `目標の${pct}%` : '金額未設定'}
            color={goal.status === 'achieved' ? '#f59e0b' : '#059669'}
          />

          {/* Stats */}
          <div className="w-full grid grid-cols-2 gap-3">
            {target > 0 && (
              <>
                <div className="bg-emerald-50 rounded-xl px-3 py-3 text-center">
                  <div className="text-xs text-emerald-600 font-medium mb-1">現在の積立額</div>
                  <div className="font-bold text-emerald-800">{fmt(current)}</div>
                </div>
                <div className="bg-gray-50 rounded-xl px-3 py-3 text-center">
                  <div className="text-xs text-gray-500 font-medium mb-1">目標金額</div>
                  <div className="font-bold text-gray-800">{fmt(target)}</div>
                </div>
                {remaining > 0 && (
                  <div className="bg-rose-50 rounded-xl px-3 py-3 text-center">
                    <div className="text-xs text-rose-600 font-medium mb-1">残り</div>
                    <div className="font-bold text-rose-700">{fmt(remaining)}</div>
                  </div>
                )}
                {monthlyNeeded && (
                  <div className="bg-teal-50 rounded-xl px-3 py-3 text-center">
                    <div className="text-xs text-teal-600 font-medium mb-1">月次必要額</div>
                    <div className="font-bold text-teal-800">{fmt(monthlyNeeded)}</div>
                  </div>
                )}
              </>
            )}
            {days !== null && (
              <div className={`rounded-xl px-3 py-3 text-center col-span-${target ? 1 : 2} ${
                days <= 0 ? 'bg-red-50' : days <= 30 ? 'bg-rose-50' : 'bg-amber-50'
              }`}>
                <div className={`text-xs font-medium mb-1 ${
                  days <= 0 ? 'text-red-600' : days <= 30 ? 'text-rose-600' : 'text-amber-600'
                }`}>目標期限</div>
                <div className={`font-bold ${
                  days <= 0 ? 'text-red-700' : days <= 30 ? 'text-rose-700' : 'text-amber-700'
                }`}>
                  {days > 0 ? `あと${days}日` : days === 0 ? '今日' : `${Math.abs(days)}日超過`}
                </div>
                <div className="text-xs text-gray-400 mt-0.5">{goal.targetDate}</div>
              </div>
            )}
          </div>
        </div>

        {/* Description */}
        {goal.description && (
          <div className="bg-white rounded-2xl px-4 py-3 shadow-sm">
            <p className="text-sm text-gray-600 leading-relaxed">{goal.description}</p>
          </div>
        )}

        {/* CASHFLOW Link */}
        <div className="bg-white rounded-2xl px-4 py-3 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-semibold text-gray-800">CASHFLOWと連動</div>
              <div className="text-xs text-gray-400 mt-0.5">
                {goal.linkedCashflow
                  ? `貯蓄残高 ${fmt(savingsBalance)} を現在額として使用中`
                  : '手動で積立額を管理'}
              </div>
            </div>
            <button
              onClick={handleToggleCashflow}
              className={`relative w-12 h-6 rounded-full transition-colors ${
                goal.linkedCashflow ? 'bg-emerald-500' : 'bg-gray-200'
              }`}
            >
              <span className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white shadow transition-transform ${
                goal.linkedCashflow ? 'translate-x-6' : ''
              }`} />
            </button>
          </div>
        </div>

        {/* Milestones */}
        {goal.milestones.length > 0 && (
          <div className="bg-white rounded-2xl px-4 py-3 shadow-sm">
            <div className="text-sm font-semibold text-gray-800 mb-3">マイルストーン</div>
            <div className="flex flex-col gap-2">
              {goal.milestones.map(ms => {
                const msReached = current >= ms.targetAmount;
                const isAchieved = !!ms.achievedAt;
                return (
                  <button
                    key={ms.id}
                    onClick={() => toggleMilestone(ms)}
                    className={`flex items-center gap-3 text-left p-2 rounded-xl transition-colors ${
                      isAchieved ? 'bg-emerald-50' : msReached ? 'bg-amber-50' : 'bg-gray-50'
                    }`}
                  >
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                      isAchieved ? 'border-emerald-500 bg-emerald-500' : 'border-gray-300'
                    }`}>
                      {isAchieved && <span className="text-white text-xs">✓</span>}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className={`text-sm font-medium ${isAchieved ? 'text-emerald-700 line-through' : 'text-gray-800'}`}>
                        {ms.title}
                      </div>
                      <div className="text-xs text-gray-400">{fmt(ms.targetAmount)}</div>
                    </div>
                    {msReached && !isAchieved && (
                      <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-medium">達成可能</span>
                    )}
                    {isAchieved && ms.achievedAt && (
                      <span className="text-xs text-emerald-500">{ms.achievedAt}</span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-col gap-2">
          {!goal.linkedCashflow && goal.status === 'active' && (
            <button
              onClick={() => { setSavingsInput(''); setShowSavingsModal(true); }}
              className="w-full bg-emerald-500 text-white font-bold py-3.5 rounded-2xl text-sm shadow-sm active:scale-[0.98] transition-transform"
            >
              💰 積立を記録する
            </button>
          )}

          <button
            onClick={handleMarkAchieved}
            className={`w-full font-bold py-3 rounded-2xl text-sm active:scale-[0.98] transition-transform ${
              goal.status === 'achieved'
                ? 'bg-gray-100 text-gray-600'
                : 'bg-amber-50 text-amber-700 border border-amber-200'
            }`}
          >
            {goal.status === 'achieved' ? '⬅ 進行中に戻す' : '🏆 達成済みにする'}
          </button>

          {/* RINGI link for large purchase goals */}
          {goal.status === 'achieved' && goal.category === 'purchase' && goal.targetAmount && goal.targetAmount >= 100000 && (
            <a
              href="https://RESET3911.github.io/RINGI/"
              className="w-full bg-violet-50 text-violet-700 border border-violet-200 font-bold py-3 rounded-2xl text-sm active:scale-[0.98] transition-transform flex items-center justify-center gap-2"
            >
              📝 これをRINGIに申請する
            </a>
          )}

          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="w-full text-red-400 text-sm py-2"
          >
            削除する
          </button>
        </div>
      </div>

      {/* Savings Input Modal */}
      {showSavingsModal && (
        <div className="fixed inset-0 z-50 flex items-end bg-black/40 backdrop-blur-sm" onClick={() => setShowSavingsModal(false)}>
          <div className="w-full bg-white rounded-t-3xl px-5 pt-5 pb-8" onClick={e => e.stopPropagation()}>
            <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto mb-5" />
            <h2 className="text-base font-bold text-gray-900 mb-4">積立を記録</h2>
            <div className="text-xs text-gray-400 mb-2">現在の積立額: {fmt(goal.currentAmount)}</div>
            <div className="relative mb-4">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">¥</span>
              <input
                type="number"
                value={savingsInput}
                onChange={e => setSavingsInput(e.target.value)}
                className="w-full rounded-xl border border-emerald-300 pl-7 pr-3 py-3 text-sm focus:outline-none focus:border-emerald-500"
                placeholder="積立額を入力"
                autoFocus
                inputMode="numeric"
              />
            </div>
            <button
              onClick={handleAddSavings}
              disabled={!savingsInput || parseInt(savingsInput) <= 0}
              className="w-full bg-emerald-500 text-white font-bold py-3 rounded-xl text-sm disabled:opacity-40"
            >
              記録する
            </button>
          </div>
        </div>
      )}

      {/* Delete Confirm */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-6">
          <div className="w-full max-w-xs bg-white rounded-2xl px-5 py-6 shadow-xl">
            <h3 className="text-base font-bold text-gray-900 mb-2">削除しますか？</h3>
            <p className="text-sm text-gray-500 mb-5">「{goal.title}」を削除します。この操作は元に戻せません。</p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 bg-gray-100 text-gray-700 font-semibold py-3 rounded-xl text-sm"
              >キャンセル</button>
              <button
                onClick={handleDelete}
                className="flex-1 bg-red-500 text-white font-semibold py-3 rounded-xl text-sm"
              >削除</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
