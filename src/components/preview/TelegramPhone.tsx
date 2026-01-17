import { useState, useEffect } from 'react';
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
  focusedField?: string | null;
  showBotPicPlaceholder?: boolean;
  highlightAvatar?: boolean;
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
  focusedField,
  showBotPicPlaceholder,
  highlightAvatar,
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

  // Автопереключение превью при фокусе на поле
  useEffect(() => {
    if (!focusedField) return;

    // Маппинг полей на режимы превью
    const fieldToMode: Record<string, { mode: PreviewMode; needStart?: boolean }> = {
      // chatlist
      shortDescription: { mode: 'chatlist' },
      avatar: { mode: 'chatlist' },
      // profile
      username: { mode: 'profile' },
      about: { mode: 'profile' },
      privacyPolicyUrl: { mode: 'profile' },
      // dialog (до START)
      description: { mode: 'dialog' },
      botPic: { mode: 'dialog' },
      // dialog (после START)
      firstMessageText: { mode: 'dialog', needStart: true },
      inlineButtonText: { mode: 'dialog', needStart: true },
      inlineButtonResponse: { mode: 'dialog', needStart: true },
      // botName видно везде - не переключаем
    };

    const mapping = fieldToMode[focusedField];
    if (mapping) {
      setMode(mapping.mode);
      if (mapping.needStart) {
        setDialogStarted(true);
      } else if (mapping.mode === 'dialog') {
        setDialogStarted(false);
      }
    }
  }, [focusedField]);

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
                highlightAvatar={highlightAvatar}
                focusedField={focusedField}
              />
            )}

            {mode === 'profile' && (
              <BotProfile
                username={username}
                botName={botName}
                about={about}
                privacyPolicyUrl={privacyPolicyUrl}
                avatar={avatar}
                highlightAvatar={highlightAvatar}
                focusedField={focusedField}
              />
            )}

            {mode === 'dialog' && !dialogStarted && (
              <ChatStart
                botName={botName}
                description={description}
                avatar={avatar}
                highlightAvatar={highlightAvatar}
                botPic={botPic}
                showBotPicPlaceholder={showBotPicPlaceholder}
                onStartClick={handleStartClick}
                focusedField={focusedField}
              />
            )}

            {mode === 'dialog' && dialogStarted && (
              <FirstMessage
                botName={botName}
                description={description}
                text={firstMessage?.text || ''}
                inlineButton={firstMessage?.inlineButton}
                avatar={avatar}
                highlightAvatar={highlightAvatar}
                botPic={botPic}
                showBotPicPlaceholder={showBotPicPlaceholder}
                focusedField={focusedField}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
