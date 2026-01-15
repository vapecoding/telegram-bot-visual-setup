interface ChatStartProps {
  botName: string;
  description: string;
  avatar?: string;
}

export function ChatStart({ botName, description, avatar }: ChatStartProps) {
  return (
    <div className="bg-white rounded-lg overflow-hidden shadow-sm">
      {/* Chat Header */}
      <div className="bg-[#5288c1] text-white px-4 py-3 flex items-center gap-3">
        <button className="text-xl">←</button>
        <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center text-sm overflow-hidden flex-shrink-0">
          {avatar ? (
            <img src={avatar} alt={botName} className="w-full h-full object-cover" />
          ) : (
            botName.charAt(0).toUpperCase() || 'B'
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-medium truncate">{botName || 'Bot Name'}</h3>
          <p className="text-xs text-white/80">bot</p>
        </div>
        <button className="text-lg">⋮</button>
      </div>

      {/* Chat Background */}
      <div
        className="min-h-[600px] p-4 relative"
        style={{
          background: 'linear-gradient(135deg, #e8f5e9 0%, #fff9c4 100%)',
          backgroundImage: `
            repeating-linear-gradient(
              45deg,
              transparent,
              transparent 10px,
              rgba(255,255,255,.03) 10px,
              rgba(255,255,255,.03) 20px
            )
          `
        }}
      >
        {/* Welcome Card */}
        <div className="bg-white rounded-xl shadow-sm p-4 max-w-sm mx-auto mb-4">
          {/* Bot Avatar in card */}
          <div className="flex justify-center mb-3">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-bold text-3xl overflow-hidden">
              {avatar ? (
                <img src={avatar} alt={botName} className="w-full h-full object-cover" />
              ) : (
                botName.charAt(0).toUpperCase() || 'B'
              )}
            </div>
          </div>

          {/* "What can this bot do?" */}
          <h3 className="text-center font-semibold text-gray-900 mb-3">
            What can this bot do?
          </h3>

          {/* Description */}
          <div className="text-sm text-gray-700 whitespace-pre-wrap break-words mb-4">
            {description || 'Здравствуйте! Я ваш цифровой помощник...'}
          </div>
        </div>

        {/* START button */}
        <div className="flex justify-center">
          <button className="bg-[#5288c1] text-white px-12 py-3 rounded-full font-medium shadow-lg hover:bg-[#4a7db0] transition-colors">
            START
          </button>
        </div>
      </div>

      {/* Bottom hint */}
      <div className="px-4 py-2 bg-green-50 border-t border-green-200">
        <p className="text-xs text-gray-700">
          ℹ️ Description отображается на стартовом экране ДО нажатия START
        </p>
      </div>
    </div>
  );
}
