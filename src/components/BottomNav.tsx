type Tab = 'active' | 'achieved';

interface Props {
  current: Tab;
  onChange: (t: Tab) => void;
  onAdd: () => void;
}

export default function BottomNav({ current, onChange, onAdd }: Props) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 flex items-center z-40 pb-safe">
      {(['active', 'achieved'] as Tab[]).map(t => (
        <button
          key={t}
          onClick={() => onChange(t)}
          className={`flex-1 flex flex-col items-center py-2 gap-0.5 text-xs transition-colors ${
            current === t ? 'text-emerald-600 font-semibold' : 'text-gray-400'
          }`}
        >
          <span className="text-xl leading-none">{t === 'active' ? '🎯' : '🏆'}</span>
          <span>{t === 'active' ? '進行中' : '達成済み'}</span>
        </button>
      ))}
      <button
        onClick={onAdd}
        className="flex-1 flex flex-col items-center py-2 gap-0.5 text-xs text-gray-400"
      >
        <span className="text-xl leading-none w-9 h-9 rounded-full bg-emerald-500 flex items-center justify-center text-white font-bold text-lg -mt-4 shadow-lg">+</span>
        <span className="mt-1">追加</span>
      </button>
    </nav>
  );
}
