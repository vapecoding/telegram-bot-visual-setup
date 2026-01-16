import { useState } from 'react';
import { ChatListItem } from './ChatListItem';
import { BotProfile } from './BotProfile';
import { ChatStart } from './ChatStart';
import { FirstMessage } from './FirstMessage';

interface TelegramPhoneProps {
  username: string;
  botName: string;
  shortDescription: string;
  description: string;
  about: string;
  privacyPolicyUrl?: string;
  avatar?: string;
  botPic?: string;
  firstMessage?: {
    text: string;
    inlineButton?: {
      text: string;
      response: string;
    };
  };
}

type PreviewMode = 'chatlist' | 'profile' | 'dialog';

export function TelegramPhone({
  username,
  botName,
  shortDescription,
  description,
  about,
  privacyPolicyUrl,
  avatar,
  botPic,
  firstMessage
}: TelegramPhoneProps) {
  const [mode, setMode] = useState<PreviewMode>('chatlist');
  const [dialogStarted, setDialogStarted] = useState(false);

  // Сброс состояния диалога при смене режима
  const handleModeChange = (newMode: PreviewMode) => {
    setMode(newMode);
    if (newMode === 'dialog') {
      setDialogStarted(false);
    }
  };

  const handleStartClick = () => {
    setDialogStarted(true);
  };

  return (
    <div className="flex gap-4 items-start">
      {/* Vertical Mode Switcher - Left Side */}
      <div className="flex flex-col gap-3 pt-4">
        <button
          onClick={() => handleModeChange('chatlist')}
          className={`px-5 py-4 text-base rounded-xl transition-colors whitespace-nowrap text-left font-medium ${
            mode === 'chatlist'
              ? 'bg-blue-600 text-white shadow-md'
              : 'bg-white text-gray-700 hover:bg-gray-100 shadow-sm'
          }`}
        >
          📋 Список чатов
        </button>
        <button
          onClick={() => handleModeChange('profile')}
          className={`px-5 py-4 text-base rounded-xl transition-colors whitespace-nowrap text-left font-medium ${
            mode === 'profile'
              ? 'bg-blue-600 text-white shadow-md'
              : 'bg-white text-gray-700 hover:bg-gray-100 shadow-sm'
          }`}
        >
          👤 Профиль
        </button>
        <button
          onClick={() => handleModeChange('dialog')}
          className={`px-5 py-4 text-base rounded-xl transition-colors whitespace-nowrap text-left font-medium ${
            mode === 'dialog'
              ? 'bg-blue-600 text-white shadow-md'
              : 'bg-white text-gray-700 hover:bg-gray-100 shadow-sm'
          }`}
        >
          💬 Диалог
        </button>
      </div>

      {/* Phone Frame - Right Side */}
      <div className="flex-1 flex justify-center pl-16">
        <div
          className="bg-gray-900 rounded-[3rem] p-4 shadow-2xl overflow-hidden flex-shrink-0"
          style={{
            height: 'min(900px, calc(100vh - 8rem))',
            width: 'calc(min(900px, calc(100vh - 8rem)) * 10 / 19.5)'
          }}
        >
          <div className="bg-white rounded-[2.5rem] overflow-hidden h-full w-full">
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
                username={username}
                botName={botName}
                about={about}
                privacyPolicyUrl={privacyPolicyUrl}
                avatar={avatar}
              />
            )}

            {mode === 'dialog' && !dialogStarted && (
              <ChatStart
                botName={botName}
                description={description}
                avatar={avatar}
                botPic={botPic}
                onStartClick={handleStartClick}
              />
            )}

            {mode === 'dialog' && dialogStarted && (
              <FirstMessage
                botName={botName}
                description={description}
                text={firstMessage?.text || ''}
                inlineButton={firstMessage?.inlineButton}
                avatar={avatar}
                botPic={botPic}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
