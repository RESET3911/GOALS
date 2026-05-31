import { useState, useEffect, useCallback } from 'react';
import type { Goal } from './types';
import {
  subscribeGoals, saveGoal, deleteGoal,
  subscribeSavingsBalance,
} from './utils/storage';
import GoalListScreen from './components/GoalListScreen';
import GoalDetailScreen from './components/GoalDetailScreen';
import GoalFormModal from './components/GoalFormModal';
import BottomNav from './components/BottomNav';
import Toast from './components/Toast';

type Tab = 'active' | 'achieved';

export default function App() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [savingsBalance, setSavingsBalance] = useState(0);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<Tab>('active');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'error' | 'success' } | null>(null);

  useEffect(() => {
    let resolved = 0;
    const done = () => { if (++resolved >= 1) setLoading(false); };
    const unsubs = [
      subscribeGoals(items => { setGoals(items); done(); }, done),
      subscribeSavingsBalance(setSavingsBalance),
    ];
    return () => unsubs.forEach(u => u());
  }, []);

  const showError = useCallback((msg: string) => setToast({ message: msg, type: 'error' }), []);
  const showSuccess = useCallback((msg: string) => setToast({ message: msg, type: 'success' }), []);

  const handleSaveGoal = useCallback(async (goal: Goal) => {
    try {
      await saveGoal(goal);
      setShowForm(false);
      setEditingGoal(null);
      showSuccess('保存しました');
    } catch (e) {
      console.error(e);
      showError('保存に失敗しました');
    }
  }, [showError, showSuccess]);

  const handleUpdateGoal = useCallback(async (goal: Goal) => {
    try {
      await saveGoal(goal);
    } catch (e) {
      console.error(e);
      showError('更新に失敗しました');
    }
  }, [showError]);

  const handleDeleteGoal = useCallback(async (id: string) => {
    try {
      await deleteGoal(id);
      showSuccess('削除しました');
    } catch (e) {
      console.error(e);
      showError('削除に失敗しました');
    }
  }, [showError, showSuccess]);

  const handleEdit = useCallback((goal: Goal) => {
    setEditingGoal(goal);
    setShowForm(true);
  }, []);

  const selectedGoal = selectedId ? goals.find(g => g.id === selectedId) ?? null : null;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-dvh">
        <div className="text-gray-400 text-sm">読み込み中...</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-dvh">
      {selectedGoal ? (
        <GoalDetailScreen
          goal={selectedGoal}
          savingsBalance={savingsBalance}
          onBack={() => setSelectedId(null)}
          onUpdate={handleUpdateGoal}
          onDelete={handleDeleteGoal}
          onEdit={() => handleEdit(selectedGoal)}
        />
      ) : (
        <>
          <header className="flex items-center justify-between px-4 pt-3 pb-2 bg-white/70 backdrop-blur-sm sticky top-0 z-30 border-b border-gray-100">
            <span className="font-extrabold text-sm bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent">
              🎯 ST GOALS
            </span>
            <span className="text-xs text-gray-400">
              {goals.filter(g => g.status === 'active').length}件進行中
            </span>
          </header>

          <main className="flex-1">
            <GoalListScreen
              goals={goals}
              tab={tab}
              savingsBalance={savingsBalance}
              onSelect={setSelectedId}
            />
          </main>

          <BottomNav
            current={tab}
            onChange={t => { setTab(t); setSelectedId(null); }}
            onAdd={() => { setEditingGoal(null); setShowForm(true); }}
          />
        </>
      )}

      {showForm && (
        <GoalFormModal
          goal={editingGoal}
          onSave={handleSaveGoal}
          onClose={() => { setShowForm(false); setEditingGoal(null); }}
        />
      )}

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}
