import { useState, useEffect } from 'react';
import { ChatListItem } from './ChatListItem';
import { BotProfile } from './BotProfile';
import { ChatStart } from './ChatStart';
import { FirstMessage } from './FirstMessage';
import { FieldHelp } from './FieldHelp';
import { DownloadModal } from '../DownloadModal';

export type PreviewMode = 'chatlist' | 'profile' | 'dialog';

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
  // Share props
  onShare?: () => void;
  isSharing?: boolean;
  // Mobile mode props
  isMobile?: boolean;
  externalMode?: PreviewMode;
  onModeChange?: (mode: PreviewMode) => void;
}

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
  onDownload,
  onShare,
  isSharing = false,
  isMobile = false,
  externalMode,
  onModeChange
}: TelegramPhoneProps) {
  const [internalMode, setInternalMode] = useState<PreviewMode>('chatlist');

  // Используем внешний режим если передан, иначе внутренний
  const mode = externalMode ?? internalMode;

  // Функция смены режима - использует внешний callback или внутренний state
  const setMode = (newMode: PreviewMode) => {
    if (onModeChange) {
      onModeChange(newMode);
    } else {
      setInternalMode(newMode);
    }
  };
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
  const mobilePhoneHeight = 'min(60vh, 500px)';

  // Общий контент телефона (переиспользуется в обоих режимах)
  const phoneContent = (
    <>
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
    </>
  );

  // Мобильная версия: только телефон без боковой панели
  if (isMobile) {
    return (
      <div className="flex justify-center items-center w-full">
        <div
          className="bg-gray-900 rounded-[2.5rem] p-3 shadow-2xl overflow-hidden"
          style={{
            height: mobilePhoneHeight,
            width: `calc(${mobilePhoneHeight} * 10 / 19.5)`
          }}
        >
          <div className="bg-white rounded-[2rem] overflow-hidden h-full w-full">
            {phoneContent}
          </div>
        </div>
      </div>
    );
  }

  // Desktop версия
  return (
    <div className="flex gap-6 items-start w-full pl-6 pr-8" style={{ height: phoneHeight }}>
      {/* Vertical Mode Switcher - Left Side - relative for absolute positioning of buttons */}
      <div className="relative flex flex-col gap-3 pt-4 pb-28 flex-shrink-0" style={{ height: '100%', width: 'clamp(215px, 30%, 385px)' }}>
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
          <FieldHelp focusedField={focusedField} />
        </div>

        {/* Action Buttons - Absolutely positioned at bottom */}
        {formData && (
          <div className="absolute bottom-0 left-0 flex flex-col gap-3">
            {/* Share Button - PRIMARY (gradient, prominent) */}
            {onShare && (
              <button
                onClick={onShare}
                disabled={isSharing}
                className={`w-[180px] px-5 py-4 text-base rounded-xl transition-all duration-200 whitespace-nowrap font-semibold flex items-center justify-center gap-2 ${
                  isSharing
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg hover:shadow-xl hover:from-blue-600 hover:to-indigo-700 cursor-pointer active:scale-95'
                }`}
              >
                {isSharing ? (
                  <>
                    <svg className="animate-spin h-4 w-4 flex-shrink-0" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Загрузка...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                    </svg>
                    <span>Поделиться</span>
                  </>
                )}
              </button>
            )}

            {/* Download Button - SECONDARY (text link style) */}
            <button
              onClick={() => setShowDownloadModal(true)}
              className="w-[180px] px-5 py-3 text-sm transition-all duration-200 whitespace-nowrap font-medium cursor-pointer text-gray-600 hover:text-gray-900 flex items-center justify-center gap-2 hover:bg-gray-100 rounded-lg active:scale-95"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              <span>Скачать архив</span>
            </button>
          </div>
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
            {phoneContent}
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
