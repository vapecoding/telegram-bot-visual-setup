export type PreviewMode = 'chatlist' | 'profile' | 'dialog';

interface MobilePreviewSwitcherProps {
  mode: PreviewMode;
  onModeChange: (mode: PreviewMode) => void;
}

export function MobilePreviewSwitcher({ mode, onModeChange }: MobilePreviewSwitcherProps) {
  return (
    <div className="flex justify-center gap-1 p-2 bg-white/90 backdrop-blur-sm rounded-xl shadow-sm mx-4 mb-3">
      <button
        onClick={() => onModeChange('chatlist')}
        className={`px-3 py-2 text-sm rounded-lg transition-all ${
          mode === 'chatlist'
            ? 'bg-blue-600 text-white shadow-sm'
            : 'text-gray-600 hover:bg-gray-100'
        }`}
      >
        📋 Список
      </button>
      <button
        onClick={() => onModeChange('profile')}
        className={`px-3 py-2 text-sm rounded-lg transition-all ${
          mode === 'profile'
            ? 'bg-blue-600 text-white shadow-sm'
            : 'text-gray-600 hover:bg-gray-100'
        }`}
      >
        👤 Профиль
      </button>
      <button
        onClick={() => onModeChange('dialog')}
        className={`px-3 py-2 text-sm rounded-lg transition-all ${
          mode === 'dialog'
            ? 'bg-blue-600 text-white shadow-sm'
            : 'text-gray-600 hover:bg-gray-100'
        }`}
      >
        💬 Диалог
      </button>
    </div>
  );
}
