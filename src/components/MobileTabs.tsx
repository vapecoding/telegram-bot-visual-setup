interface MobileTabsProps {
  activeTab: 'form' | 'preview';
  onTabChange: (tab: 'form' | 'preview') => void;
}

export function MobileTabs({ activeTab, onTabChange }: MobileTabsProps) {
  return (
    <div className="sticky top-0 z-30 bg-white border-b border-gray-200 flex shadow-sm">
      <button
        onClick={() => onTabChange('form')}
        className={`flex-1 py-3 text-center font-medium transition-colors ${
          activeTab === 'form'
            ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50/50'
            : 'text-gray-500'
        }`}
      >
        <span className="mr-1.5">📝</span>
        Форма
      </button>
      <button
        onClick={() => onTabChange('preview')}
        className={`flex-1 py-3 text-center font-medium transition-colors ${
          activeTab === 'preview'
            ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50/50'
            : 'text-gray-500'
        }`}
      >
        <span className="mr-1.5">📱</span>
        Превью
      </button>
    </div>
  );
}
