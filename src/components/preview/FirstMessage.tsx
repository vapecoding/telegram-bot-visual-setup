interface FirstMessageProps {
  botName: string;
  text: string;
  inlineButton?: {
    text: string;
    response: string;
  };
  avatar?: string;
}

export function FirstMessage({ botName, text, inlineButton, avatar }: FirstMessageProps) {
  return (
    <div className="bg-white rounded-lg overflow-hidden shadow-sm h-full flex flex-col">
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

      {/* Chat Background - Telegram default pattern */}
      <div
        className="flex-1 p-4 relative overflow-auto"
        style={{
          backgroundImage: 'url(/telegram-bg.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}
      >
        {/* First Message from Bot */}
        <div className="bg-white rounded-2xl shadow-sm p-4 max-w-sm mr-auto mb-4">
          {/* Message Text */}
          <div className="text-sm text-gray-900 whitespace-pre-wrap break-words">
            {text || 'Добро пожаловать! Выберите интересующий раздел:'}
          </div>

          {/* Inline Button (if enabled) */}
          {inlineButton && inlineButton.text && (
            <div className="mt-3">
              <button className="w-full bg-white border border-gray-300 rounded-lg py-2.5 px-4 text-blue-600 font-medium hover:bg-gray-50 transition-colors text-center relative">
                {inlineButton.text}
                <span className="absolute top-1 right-1 text-[9px] bg-yellow-200 text-yellow-800 px-1.5 py-0.5 rounded">
                  Требует разработки
                </span>
              </button>
            </div>
          )}
        </div>

        {/* Inline Button Response Preview (if provided) */}
        {inlineButton && inlineButton.response && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 max-w-sm">
            <p className="text-xs text-gray-600 mb-1">
              ⚡ Preview ответа на кнопку "{inlineButton.text}":
            </p>
            <p className="text-sm text-gray-700 whitespace-pre-wrap break-words">
              {inlineButton.response}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
