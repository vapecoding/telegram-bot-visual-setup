import { useState } from 'react';

interface FirstMessageProps {
  botName: string;
  description: string;
  text: string;
  inlineButton?: {
    text: string;
    response: string;
  };
  avatar?: string;
  botPic?: string;
}

export function FirstMessage({ botName, description, text, inlineButton, avatar, botPic }: FirstMessageProps) {
  const [buttonClicked, setButtonClicked] = useState(false);

  // Сегодняшняя дата
  const today = new Date();
  const dateStr = today.toLocaleDateString('ru-RU', { month: 'long', day: 'numeric' });

  return (
    <div className="bg-white rounded-lg overflow-hidden shadow-sm h-full flex flex-col">
      {/* Chat Header */}
      <div className="bg-[#5288c1] text-white px-4 py-3 flex items-center gap-3 overflow-hidden">
        <button className="text-xl opacity-40">←</button>
        <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center text-sm overflow-hidden flex-shrink-0">
          {avatar ? (
            <img src={avatar} alt={botName} className="w-full h-full object-cover" />
          ) : (
            botName.charAt(0).toUpperCase() || 'B'
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-medium truncate">{botName || 'Имя бота'}</h3>
          <p className="text-xs text-white/60">бот</p>
        </div>
        <button className="text-lg opacity-40">⋮</button>
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
        {/* Description Picture (приветственная картинка) - ИДЕНТИЧНО ChatStart */}
        {botPic && (
          <div className="max-w-sm mx-auto mb-4">
            <div className="relative rounded-xl overflow-hidden shadow-sm" style={{ aspectRatio: '16 / 9' }}>
              <img
                src={botPic}
                alt="Description Picture"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        )}

        {/* Welcome Card - ИДЕНТИЧНО ChatStart */}
        <div className="bg-white rounded-xl shadow-sm p-4 max-w-sm mx-auto mb-4">
          {/* Profile Photo - скрываем если есть Description Picture */}
          {!botPic && (
            <div className="flex justify-center mb-3">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-bold text-3xl overflow-hidden">
                {avatar ? (
                  <img src={avatar} alt={botName} className="w-full h-full object-cover" />
                ) : (
                  botName.charAt(0).toUpperCase() || 'B'
                )}
              </div>
            </div>
          )}

          {/* "Что умеет этот бот?" */}
          <h3 className="text-center font-semibold text-gray-900 mb-3">
            Что умеет этот бот?
          </h3>

          {/* Description */}
          <div className="text-sm text-gray-700 whitespace-pre-wrap break-words mb-4">
            {description || 'Здравствуйте! Я ваш цифровой помощник...'}
          </div>
        </div>

        {/* Date separator - НА МЕСТЕ кнопки START */}
        <div className="flex justify-center mb-4">
          <span className="bg-black/20 text-white text-xs px-3 py-1 rounded-full">
            {dateStr}
          </span>
        </div>

        {/* User's /start command (outgoing message - right side, in bubble) */}
        <div className="flex justify-end mb-3">
          <div className="bg-[#EEFFDE] rounded-2xl shadow-sm px-3 py-1.5">
            <span className="text-sm text-gray-900">/start</span>
            <span className="text-[10px] text-gray-500 ml-2">
              {today.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}
            </span>
            <span className="text-[10px] text-green-600 ml-0.5">✓✓</span>
          </div>
        </div>

        {/* Bot's welcome message (incoming - left side) */}
        {text && (
          <div className="flex gap-2 mb-3">
            {/* Bot avatar */}
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-xs flex-shrink-0 overflow-hidden">
              {avatar ? (
                <img src={avatar} alt={botName} className="w-full h-full object-cover" />
              ) : (
                botName.charAt(0).toUpperCase() || 'B'
              )}
            </div>
            <div className="bg-white rounded-2xl shadow-sm p-3 max-w-[75%]">
              <div className="text-sm text-gray-900 whitespace-pre-wrap break-words">
                {text}
              </div>

              {/* Inline Button (if enabled) */}
              {inlineButton && inlineButton.text && (
                <div className="mt-2">
                  <button
                    onClick={() => setButtonClicked(true)}
                    className={`w-full border rounded-lg py-2 px-3 font-medium transition-colors text-center text-sm ${
                      buttonClicked
                        ? 'bg-blue-50 border-blue-300 text-blue-700'
                        : 'bg-white border-gray-300 text-blue-600 hover:bg-gray-50 cursor-pointer active:scale-95'
                    }`}
                  >
                    {inlineButton.text}
                  </button>
                </div>
              )}

              <div className="flex justify-end mt-1">
                <span className="text-[10px] text-gray-500">
                  {today.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Response to inline button click */}
        {buttonClicked && inlineButton && inlineButton.response && (
          <div className="flex gap-2 mb-3">
            {/* Bot avatar */}
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-xs flex-shrink-0 overflow-hidden">
              {avatar ? (
                <img src={avatar} alt={botName} className="w-full h-full object-cover" />
              ) : (
                botName.charAt(0).toUpperCase() || 'B'
              )}
            </div>
            <div className="bg-white rounded-2xl shadow-sm p-3 max-w-[75%]">
              <div className="text-sm text-gray-900 whitespace-pre-wrap break-words">
                {inlineButton.response}
              </div>
              <div className="flex justify-end mt-1">
                <span className="text-[10px] text-gray-500">
                  {today.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
