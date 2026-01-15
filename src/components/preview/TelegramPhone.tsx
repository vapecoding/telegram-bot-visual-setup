import { useState } from 'react';
import { ChatListItem } from './ChatListItem';
import { BotProfile } from './BotProfile';
import { ChatStart } from './ChatStart';
import { FirstMessage } from './FirstMessage';

interface TelegramPhoneProps {
  botName: string;
  shortDescription: string;
  description: string;
  about: string;
  privacyPolicyUrl?: string;
  avatar?: string;
  firstMessage?: {
    text: string;
    inlineButton?: {
      text: string;
      response: string;
    };
  };
}

type PreviewMode = 'chatlist' | 'profile' | 'chatstart' | 'firstmessage';

export function TelegramPhone({
  botName,
  shortDescription,
  description,
  about,
  privacyPolicyUrl,
  avatar,
  firstMessage
}: TelegramPhoneProps) {
  const [mode, setMode] = useState<PreviewMode>('chatlist');

  return (
    <div>
      {/* Mode Switcher */}
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setMode('chatlist')}
          className={`flex-1 px-4 py-2 text-sm rounded-lg transition-colors whitespace-nowrap ${
            mode === 'chatlist'
              ? 'bg-blue-600 text-white'
              : 'bg-white text-gray-700 hover:bg-gray-100'
          }`}
        >
          📋 Chat List
        </button>
        <button
          onClick={() => setMode('profile')}
          className={`flex-1 px-4 py-2 text-sm rounded-lg transition-colors whitespace-nowrap ${
            mode === 'profile'
              ? 'bg-blue-600 text-white'
              : 'bg-white text-gray-700 hover:bg-gray-100'
          }`}
        >
          👤 Profile
        </button>
        <button
          onClick={() => setMode('chatstart')}
          className={`flex-1 px-4 py-2 text-sm rounded-lg transition-colors whitespace-nowrap ${
            mode === 'chatstart'
              ? 'bg-blue-600 text-white'
              : 'bg-white text-gray-700 hover:bg-gray-100'
          }`}
        >
          💬 Chat Start
        </button>
        <button
          onClick={() => setMode('firstmessage')}
          className={`flex-1 px-4 py-2 text-sm rounded-lg transition-colors whitespace-nowrap ${
            mode === 'firstmessage'
              ? 'bg-blue-600 text-white'
              : 'bg-white text-gray-700 hover:bg-gray-100'
          }`}
        >
          ✉️ First Message
        </button>
      </div>

      {/* Phone Frame */}
      <div className="flex justify-center">
        <div
          className="bg-gray-900 rounded-[3rem] p-4 shadow-2xl"
          style={{
            height: 'min(900px, calc(100vh - 10rem))',
            aspectRatio: '9 / 19.5'
          }}
        >
          <div className="bg-white rounded-[2.5rem] overflow-hidden h-full">
            {/* Content */}
          {mode === 'chatlist' && (
            <ChatListItem
              botName={botName}
              shortDescription={shortDescription}
              avatar={avatar}
            />
          )}

          {mode === 'profile' && (
            <BotProfile
              botName={botName}
              about={about}
              privacyPolicyUrl={privacyPolicyUrl}
              avatar={avatar}
            />
          )}

          {mode === 'chatstart' && (
            <ChatStart
              botName={botName}
              description={description}
              avatar={avatar}
            />
          )}

          {mode === 'firstmessage' && (
            <FirstMessage
              botName={botName}
              text={firstMessage?.text || ''}
              inlineButton={firstMessage?.inlineButton}
              avatar={avatar}
            />
          )}
          </div>
        </div>
      </div>

      {/* Hint */}
      <p className="text-xs text-gray-400 mt-3 text-center">
        ⚠️ Схематичное отображение. Реальные шрифты и отступы зависят от устройства пользователя (iOS/Android).
      </p>
    </div>
  );
}
