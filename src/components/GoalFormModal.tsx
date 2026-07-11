import { useState, useCallback } from 'react';
import { v4 as uuid } from 'uuid';
import type { Goal, GoalCategory, Milestone } from '../types';
import { CATEGORY_LABELS, CATEGORY_ICONS } from '../types';

interface Props {
  goal?: Goal | null;
  onSave: (goal: Goal) => Promise<void>;
  onClose: () => void;
}

const CATEGORIES: GoalCategory[] = ['travel', 'housing', 'purchase', 'saving', 'event', 'other'];

export default function GoalFormModal({ goal, onSave, onClose }: Props) {
  const isEdit = !!goal;
  const [title, setTitle] = useState(goal?.title ?? '');
  const [category, setCategory] = useState<GoalCategory>(goal?.category ?? 'travel');
  const [targetAmountStr, setTargetAmountStr] = useState(
    goal?.targetAmount != null ? String(goal.targetAmount) : ''
  );
  const [targetDate, setTargetDate] = useState(goal?.targetDate ?? '');
  const [description, setDescription] = useState(goal?.description ?? '');
  const [milestones, setMilestones] = useState<Milestone[]>(goal?.milestones ?? []);
  const [msTitle, setMsTitle] = useState('');
  const [msAmount, setMsAmount] = useState('');
  const [saving, setSaving] = useState(false);

  const addMilestone = useCallback(() => {
    const amount = parseInt(msAmount.replace(/,/g, ''), 10);
    if (!msTitle.trim() || isNaN(amount) || amount <= 0) return;
    setMilestones(prev => [...prev, {
      id: uuid(),
      title: msTitle.trim(),
      targetAmount: amount,
      achievedAt: null,
    }]);
    setMsTitle('');
    setMsAmount('');
  }, [msTitle, msAmount]);

  const removeMilestone = useCallback((id: string) => {
    setMilestones(prev => prev.filter(m => m.id !== id));
  }, []);

  const handleSave = useCallback(async () => {
    if (!title.trim()) return;
    setSaving(true);
    const now = Date.now();
    const targetAmount = targetAmountStr ? parseInt(targetAmountStr.replace(/,/g, ''), 10) : null;
    const saved: Goal = {
      id: goal?.id ?? uuid(),
      title: title.trim(),
      description: description.trim() || null,
      category,
      targetAmount: targetAmount && !isNaN(targetAmount) ? targetAmount : null,
      targetDate: targetDate || null,
      currentAmount: goal?.currentAmount ?? 0,
      linkedCashflow: goal?.linkedCashflow ?? false,
      milestones,
      status: goal?.status ?? 'active',
      createdBy: goal?.createdBy ?? 'shared',
      sharedWith: goal?.sharedWith ?? ['kenshin', 'rena'],
      createdAt: goal?.createdAt ?? now,
      updatedAt: now,
    };
    await onSave(saved);
    setSaving(false);
  }, [title, description, category, targetAmountStr, targetDate, milestones, goal, onSave]);

  return (
    <div className="fixed inset-0 z-50 flex items-end bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <div
        className="w-full bg-white rounded-t-3xl max-h-[92dvh] flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {/* Handle */}
        <div className="flex-shrink-0 pt-3 pb-1 px-5">
          <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto mb-4" />
          <h2 className="text-base font-bold text-gray-900">
            {isEdit ? 'ゴールを編集' : 'ゴールを追加'}
          </h2>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto px-5 py-3 space-y-4 pb-6">
          {/* Title */}
          <div>
            <label className="text-xs font-semibold text-gray-500 mb-1 block">タイトル *</label>
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="例: 北海道旅行"
              className="w-full rounded-xl border border-gray-200 px-3 py-3 text-sm focus:outline-none focus:border-emerald-400"
              autoFocus
            />
          </div>

          {/* Category */}
          <div>
            <label className="text-xs font-semibold text-gray-500 mb-2 block">カテゴリ</label>
            <div className="grid grid-cols-3 gap-2">
              {CATEGORIES.map(c => (
                <button
                  key={c}
                  onClick={() => setCategory(c)}
                  className={`flex flex-col items-center gap-1 py-2 rounded-xl border text-xs font-medium transition-colors ${
                    category === c
                      ? 'border-emerald-400 bg-emerald-50 text-emerald-700'
                      : 'border-gray-100 bg-gray-50 text-gray-500'
                  }`}
                >
                  <span className="text-xl">{CATEGORY_ICONS[c]}</span>
                  {CATEGORY_LABELS[c]}
                </button>
              ))}
            </div>
          </div>

          {/* Target Amount */}
          <div>
            <label className="text-xs font-semibold text-gray-500 mb-1 block">目標金額</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">¥</span>
              <input
                type="number"
                value={targetAmountStr}
                onChange={e => setTargetAmountStr(e.target.value)}
                placeholder="省略可"
                className="w-full rounded-xl border border-gray-200 pl-7 pr-3 py-3 text-sm focus:outline-none focus:border-emerald-400"
                inputMode="numeric"
              />
            </div>
          </div>

          {/* Target Date */}
          <div>
            <label className="text-xs font-semibold text-gray-500 mb-1 block">達成期限</label>
            <input
              type="date"
              value={targetDate}
              onChange={e => setTargetDate(e.target.value)}
              className="w-full rounded-xl border border-gray-200 px-3 py-3 text-sm focus:outline-none focus:border-emerald-400"
            />
          </div>

          {/* Description */}
          <div>
            <label className="text-xs font-semibold text-gray-500 mb-1 block">メモ</label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="ゴールの詳細・メモ（省略可）"
              rows={2}
              className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:outline-none focus:border-emerald-400 resize-none"
            />
          </div>

          {/* Milestones */}
          <div>
            <label className="text-xs font-semibold text-gray-500 mb-2 block">マイルストーン</label>
            {milestones.length > 0 && (
              <div className="flex flex-col gap-2 mb-3">
                {milestones.map(ms => (
                  <div key={ms.id} className="flex items-center gap-2 bg-gray-50 rounded-xl px-3 py-2">
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-gray-800 truncate">{ms.title}</div>
                      <div className="text-xs text-gray-400">¥{ms.targetAmount.toLocaleString('ja-JP')}</div>
                    </div>
                    <button
                      onClick={() => removeMilestone(ms.id)}
                      className="text-gray-300 text-lg leading-none flex-shrink-0"
                    >×</button>
                  </div>
                ))}
              </div>
            )}
            <div className="flex gap-2">
              <input
                type="text"
                value={msTitle}
                onChange={e => setMsTitle(e.target.value)}
                placeholder="例: 半分達成したら"
                className="flex-1 rounded-xl border border-gray-200 px-3 py-2 text-xs focus:outline-none focus:border-emerald-400"
              />
              <div className="relative">
                <span className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400 text-xs">¥</span>
                <input
                  type="number"
                  value={msAmount}
                  onChange={e => setMsAmount(e.target.value)}
                  placeholder="金額"
                  className="w-24 rounded-xl border border-gray-200 pl-5 pr-2 py-2 text-xs focus:outline-none focus:border-emerald-400"
                  inputMode="numeric"
                />
              </div>
              <button
                onClick={addMilestone}
                disabled={!msTitle.trim() || !msAmount}
                className="px-3 py-2 bg-emerald-500 text-white rounded-xl text-xs font-bold disabled:opacity-40"
              >追加</button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex-shrink-0 px-5 py-4 border-t border-gray-100 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 bg-gray-100 text-gray-600 font-semibold py-3 rounded-xl text-sm"
          >キャンセル</button>
          <button
            onClick={handleSave}
            disabled={!title.trim() || saving}
            className="flex-1 bg-emerald-500 text-white font-bold py-3 rounded-xl text-sm disabled:opacity-40"
          >
            {saving ? '保存中...' : isEdit ? '更新する' : '追加する'}
          </button>
        </div>
      </div>
    </div>
  );
}
