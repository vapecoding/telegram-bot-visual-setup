import { useState, useEffect } from 'react';
import { ChatListItem } from './ChatListItem';
import { BotProfile } from './BotProfile';
import { ChatStart } from './ChatStart';
import { FirstMessage } from './FirstMessage';
import { FieldHelp } from './FieldHelp';
import { DownloadModal } from '../DownloadModal';

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
  avatarError?: string | null;
  avatarWarning?: string | null;
  firstMessage?: {
    text: string;
    inlineButton?: {
      text: string;
      response: string;
    };
  };
  // Download modal data
  formData?: {
    username: string;
    botName: string;
    shortDescription: string;
    description: string;
    about: string;
    privacyPolicyUrl: string;
    firstMessageText: string;
    inlineButtonText: string;
    inlineButtonResponse: string;
    avatarUrl: string | null;
    botPicUrl: string | null;
  };
  onDownload?: () => void;
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
  avatarError,
  avatarWarning,
  firstMessage,
  formData,
  onDownload
}: TelegramPhoneProps) {
  const [mode, setMode] = useState<PreviewMode>('chatlist');
  const [dialogStarted, setDialogStarted] = useState(false);
  const [showDownloadModal, setShowDownloadModal] = useState(false);

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
      // avatar - НЕ переключаем, он виден везде
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

  // Высота телефона для выравнивания кнопки
  const phoneHeight = 'min(900px, calc(100vh - 8rem))';

  return (
    <div className="flex gap-4 items-start">
      {/* Vertical Mode Switcher - Left Side */}
      <div
        className="flex flex-col gap-3 pt-4"
        style={{ height: phoneHeight }}
      >
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

        {/* Field Help Block */}
        <div className="mt-4">
          <FieldHelp
            focusedField={focusedField}
            avatarError={avatarError}
            avatarWarning={avatarWarning}
          />
        </div>

        {/* Spacer to push download button to bottom */}
        <div className="flex-1" />

        {/* Download Button - aligned with phone bottom */}
        {formData && (
          <button
            onClick={() => setShowDownloadModal(true)}
            className="px-5 py-4 text-base rounded-xl transition-colors whitespace-nowrap text-left font-medium bg-green-600 text-white hover:bg-green-700 shadow-md"
          >
            📦 Скачать архив
          </button>
        )}
      </div>

      {/* Phone Frame - Right Side */}
      <div className="flex-1 flex justify-center pl-16">
        <div
          className="bg-gray-900 rounded-[3rem] p-4 shadow-2xl overflow-hidden flex-shrink-0"
          style={{
            height: phoneHeight,
            width: `calc(${phoneHeight} * 10 / 19.5)`
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

      {/* Download Modal */}
      {formData && (
        <DownloadModal
          isOpen={showDownloadModal}
          onClose={() => setShowDownloadModal(false)}
          onDownload={() => onDownload?.()}
          formData={formData}
          avatarError={avatarError ?? null}
          avatarWarning={avatarWarning ?? null}
        />
      )}
    </div>
  );
}
