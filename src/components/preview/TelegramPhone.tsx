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
  focusedField?: string | null; // Для FieldHelp (с задержкой)
  highlightField?: string | null; // Для подсветки превью (мгновенно)
  showBotPicPlaceholder?: boolean;
  showPrivacyPolicyPlaceholder?: boolean;
  showFirstMessagePlaceholder?: boolean;
  showInlineButtonPlaceholder?: boolean;
  highlightAvatar?: boolean;
  avatarError?: string | null;
  avatarWarning?: string | null;
  onFieldHover?: (field: string | null) => void;
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
  highlightField,
  showBotPicPlaceholder,
  showPrivacyPolicyPlaceholder,
  showFirstMessagePlaceholder,
  showInlineButtonPlaceholder,
  highlightAvatar,
  avatarError,
  avatarWarning,
  onFieldHover,
  firstMessage,
  formData,
  onDownload
}: TelegramPhoneProps) {
  const [mode, setMode] = useState<PreviewMode>('chatlist');
  const [userClickedStart, setUserClickedStart] = useState(false); // Физический клик по START
  const [showDownloadModal, setShowDownloadModal] = useState(false);
  const [dialogInteracted, setDialogInteracted] = useState(false); // "Липкое" состояние диалога

  // Поля диалога (после START)
  const dialogFields = ['firstMessageText', 'inlineButtonText', 'inlineButtonResponse'];
  const isDialogFieldFocused = dialogFields.includes(highlightField || '');

  // Когда наводим на поля диалога - делаем состояние "липким"
  useEffect(() => {
    if (isDialogFieldFocused && !dialogInteracted) {
      setDialogInteracted(true);
    }
  }, [isDialogFieldFocused, dialogInteracted]);

  // Показывать FirstMessage если пользователь нажал START, взаимодействовал с полями диалога, или сейчас hover на поля
  const showFirstMessage = userClickedStart || dialogInteracted || isDialogFieldFocused;

  // Сброс состояния диалога при смене режима
  const handleModeChange = (newMode: PreviewMode) => {
    setMode(newMode);
    if (newMode === 'dialog') {
      setUserClickedStart(false);
      setDialogInteracted(false); // Сброс при переходе в режим диалога
    }
  };

  const handleStartClick = () => {
    setUserClickedStart(true);
  };

  // Автопереключение превью при фокусе на поле (мгновенно)
  useEffect(() => {
    if (!highlightField) return;

    // Маппинг полей на режимы превью
    const fieldToMode: Record<string, PreviewMode> = {
      // chatlist
      shortDescription: 'chatlist',
      // avatar - НЕ переключаем, он виден везде
      // profile
      username: 'profile',
      about: 'profile',
      privacyPolicyUrl: 'profile',
      // dialog
      description: 'dialog',
      botPic: 'dialog',
      firstMessageText: 'dialog',
      inlineButtonText: 'dialog',
      inlineButtonResponse: 'dialog',
      // botName видно везде - не переключаем
    };

    const targetMode = fieldToMode[highlightField];
    if (targetMode) {
      setMode(targetMode);
    }
  }, [highlightField]);

  // Адаптивная высота телефона с более консервативным масштабированием
  // На обычных экранах (1080p): 75vh ≈ 810px → clamp даст ~750px
  // На ultrawide (1260px высота): 75vh ≈ 945px → clamp ограничит до 750px max
  // На маленьких: min 600px
  const phoneHeight = 'clamp(600px, 75vh, 750px)';

  return (
    <div className="flex gap-6 items-start w-full pl-6 pr-8" style={{ height: phoneHeight }}>
      {/* Vertical Mode Switcher - Left Side - flexible width with limits */}
      <div className="flex flex-col gap-3 pt-4 flex-shrink-0" style={{ height: '100%', width: 'clamp(215px, 30%, 385px)' }}>
        {/* Mode buttons - fixed width */}
        <button
          onClick={() => handleModeChange('chatlist')}
          className={`w-[180px] px-5 py-4 text-base rounded-xl transition-all duration-200 whitespace-nowrap text-left font-medium cursor-pointer ${
            mode === 'chatlist'
              ? 'bg-blue-600 text-white shadow-md btn-mode-active'
              : 'bg-white text-gray-700 shadow-sm btn-mode-inactive'
          }`}
        >
          📋 Список чатов
        </button>
        <button
          onClick={() => handleModeChange('profile')}
          className={`w-[180px] px-5 py-4 text-base rounded-xl transition-all duration-200 whitespace-nowrap text-left font-medium cursor-pointer ${
            mode === 'profile'
              ? 'bg-blue-600 text-white shadow-md btn-mode-active'
              : 'bg-white text-gray-700 shadow-sm btn-mode-inactive'
          }`}
        >
          👤 Профиль
        </button>
        <button
          onClick={() => handleModeChange('dialog')}
          className={`w-[180px] px-5 py-4 text-base rounded-xl transition-all duration-200 whitespace-nowrap text-left font-medium cursor-pointer ${
            mode === 'dialog'
              ? 'bg-blue-600 text-white shadow-md btn-mode-active'
              : 'bg-white text-gray-700 shadow-sm btn-mode-inactive'
          }`}
        >
          💬 Диалог
        </button>

        {/* Field Help Block - takes full column width */}
        <div className="mt-4 w-full">
          <FieldHelp
            focusedField={focusedField}
            avatarError={avatarError}
            avatarWarning={avatarWarning}
          />
        </div>

        {/* Spacer to push download button to bottom */}
        <div className="flex-1" />

        {/* Download Button - fixed width like mode buttons */}
        {formData && (
          <button
            onClick={() => setShowDownloadModal(true)}
            className="w-[180px] px-5 py-4 text-base rounded-xl transition-all duration-200 whitespace-nowrap text-left font-medium cursor-pointer bg-green-600 text-white shadow-md active:scale-95 btn-download"
          >
            📦 Скачать архив
          </button>
        )}
      </div>

      {/* Phone Frame - centered in remaining space */}
      <div className="flex-1 flex justify-center">
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
              <div key="chatlist" className="preview-screen-enter h-full">
                <ChatListItem
                  botName={botName}
                  shortDescription={shortDescription}
                  avatar={avatar}
                  highlightAvatar={highlightAvatar}
                  focusedField={highlightField}
                  onFieldHover={onFieldHover}
                />
              </div>
            )}

            {mode === 'profile' && (
              <div key="profile" className="preview-screen-enter h-full">
                <BotProfile
                  username={username}
                  botName={botName}
                  about={about}
                  privacyPolicyUrl={privacyPolicyUrl}
                  avatar={avatar}
                  highlightAvatar={highlightAvatar}
                  focusedField={highlightField}
                  onFieldHover={onFieldHover}
                  showPrivacyPolicyPlaceholder={showPrivacyPolicyPlaceholder}
                />
              </div>
            )}

            {mode === 'dialog' && !showFirstMessage && (
              <div key="dialog-start" className="preview-screen-enter h-full">
                <ChatStart
                  botName={botName}
                  description={description}
                  avatar={avatar}
                  highlightAvatar={highlightAvatar}
                  botPic={botPic}
                  showBotPicPlaceholder={showBotPicPlaceholder}
                  onStartClick={handleStartClick}
                  focusedField={highlightField}
                  onFieldHover={onFieldHover}
                />
              </div>
            )}

            {mode === 'dialog' && showFirstMessage && (
              <div key="dialog-message" className="preview-screen-enter h-full">
                <FirstMessage
                  botName={botName}
                  description={description}
                  text={firstMessage?.text || ''}
                  inlineButton={firstMessage?.inlineButton}
                  avatar={avatar}
                  highlightAvatar={highlightAvatar}
                  botPic={botPic}
                  showBotPicPlaceholder={showBotPicPlaceholder}
                  showFirstMessagePlaceholder={showFirstMessagePlaceholder}
                  showInlineButtonPlaceholder={showInlineButtonPlaceholder}
                  focusedField={highlightField}
                  onFieldHover={onFieldHover}
                  permanentMode={userClickedStart}
                  stickyMode={dialogInteracted}
                />
              </div>
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
