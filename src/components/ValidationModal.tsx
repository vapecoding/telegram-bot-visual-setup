/**
 * Validation confirmation modal for Share/Download actions
 * Shows warnings and errors but allows proceeding with confirmation
 */

interface ValidationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  action: 'share' | 'download';
  formData: {
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
  avatarError: string | null;
  avatarWarning: string | null;
  isLoading?: boolean;
  isLoadingLong?: boolean; // Показывать "ещё немного" после 10 сек
  // Rate limit info for share
  shareLimitInfo?: {
    used: number;
    limit: number;
  };
}

interface ValidationResult {
  errors: string[];
  warnings: string[];
}

// Field limits for validation
const FIELD_LIMITS = {
  botName: 64,
  shortDescription: 120,
  description: 512,
  about: 120,
  username: 32,
  privacyPolicyUrl: 256,
  firstMessageText: 4096,
  inlineButtonText: 64,
  inlineButtonResponse: 4096,
} as const;

function validateForm(
  formData: ValidationModalProps['formData'],
  avatarError: string | null,
  avatarWarning: string | null
): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // === ERRORS (serious issues) ===

  // Character limit exceeded
  if (formData.botName.length > FIELD_LIMITS.botName) {
    errors.push(`Имя бота: ${formData.botName.length}/${FIELD_LIMITS.botName} символов`);
  }
  if (formData.shortDescription.length > FIELD_LIMITS.shortDescription) {
    errors.push(`Короткое описание: ${formData.shortDescription.length}/${FIELD_LIMITS.shortDescription} символов`);
  }
  if (formData.description.length > FIELD_LIMITS.description) {
    errors.push(`Описание: ${formData.description.length}/${FIELD_LIMITS.description} символов`);
  }
  if (formData.about.length > FIELD_LIMITS.about) {
    errors.push(`О боте: ${formData.about.length}/${FIELD_LIMITS.about} символов`);
  }
  if (formData.username.length > FIELD_LIMITS.username) {
    errors.push(`Username: ${formData.username.length}/${FIELD_LIMITS.username} символов`);
  }
  if (formData.privacyPolicyUrl.length > FIELD_LIMITS.privacyPolicyUrl) {
    errors.push(`Privacy Policy URL: ${formData.privacyPolicyUrl.length}/${FIELD_LIMITS.privacyPolicyUrl} символов`);
  }
  if (formData.firstMessageText.length > FIELD_LIMITS.firstMessageText) {
    errors.push(`Первое сообщение: ${formData.firstMessageText.length}/${FIELD_LIMITS.firstMessageText} символов`);
  }
  if (formData.inlineButtonText.length > FIELD_LIMITS.inlineButtonText) {
    errors.push(`Inline-кнопка: ${formData.inlineButtonText.length}/${FIELD_LIMITS.inlineButtonText} символов`);
  }
  if (formData.inlineButtonResponse.length > FIELD_LIMITS.inlineButtonResponse) {
    errors.push(`Ответ на кнопку: ${formData.inlineButtonResponse.length}/${FIELD_LIMITS.inlineButtonResponse} символов`);
  }

  // Required fields
  if (!formData.botName.trim()) {
    errors.push('Имя бота — обязательное поле');
  }
  if (!formData.username.trim()) {
    errors.push('Username — обязательное поле');
  } else if (formData.username.length < 5) {
    errors.push('Username должен содержать минимум 5 символов');
  } else if (!/^[a-z][a-z0-9_]*bot$/i.test(formData.username)) {
    errors.push('Username должен заканчиваться на "bot"');
  }

  // Avatar error (non-square)
  if (avatarError) {
    errors.push(`Аватарка: ${avatarError}`);
  }

  // === WARNINGS (non-critical) ===

  if (avatarWarning) {
    warnings.push(`Аватарка: ${avatarWarning}`);
  }
  if (!formData.avatarUrl) {
    warnings.push('Аватарка не загружена');
  }
  if (!formData.shortDescription.trim()) {
    warnings.push('Короткое описание не заполнено');
  }
  if (!formData.description.trim()) {
    warnings.push('Описание не заполнено');
  }
  if (!formData.about.trim()) {
    warnings.push('"О боте" не заполнено');
  }
  if (!formData.privacyPolicyUrl.trim()) {
    warnings.push('Privacy Policy URL не указан');
  }
  if (!formData.firstMessageText.trim()) {
    warnings.push('Первое сообщение не заполнено');
  }
  if (!formData.botPicUrl) {
    warnings.push('Description Picture не загружена');
  }

  return { errors, warnings };
}

export function ValidationModal({
  isOpen,
  onClose,
  onConfirm,
  action,
  formData,
  avatarError,
  avatarWarning,
  isLoading = false,
  isLoadingLong = false,
  shareLimitInfo
}: ValidationModalProps) {
  if (!isOpen) return null;

  const validation = validateForm(formData, avatarError, avatarWarning);
  const hasErrors = validation.errors.length > 0;
  const hasWarnings = validation.warnings.length > 0;
  const hasIssues = hasErrors || hasWarnings;

  const isShare = action === 'share';
  const actionText = isShare ? 'Поделиться' : 'Скачать архив';
  const confirmText = hasIssues
    ? (isShare ? 'Да, поделиться' : 'Да, скачать')
    : actionText;

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl p-6 max-w-md w-full mx-4 transform transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="text-center mb-5">
          <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${
            hasErrors
              ? 'bg-red-100'
              : hasWarnings
                ? 'bg-yellow-100'
                : 'bg-green-100'
          }`}>
            <span className="text-3xl">
              {hasErrors ? '⚠️' : hasWarnings ? '📋' : '✅'}
            </span>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-1">
            {hasErrors
              ? 'Есть проблемы с данными'
              : hasWarnings
                ? 'Не все поля заполнены'
                : 'Всё готово!'}
          </h3>
          <p className="text-sm text-gray-600">
            {hasErrors
              ? `Точно хотите ${isShare ? 'поделиться' : 'скачать'}?`
              : hasWarnings
                ? 'Некоторые поля пустые'
                : `Можно ${isShare ? 'создавать ссылку' : 'скачивать архив'}`}
          </p>
        </div>

        {/* Errors */}
        {hasErrors && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl">
            <div className="flex items-center gap-2 text-red-700 font-medium text-sm mb-2">
              <span>🔴</span>
              Ошибки ({validation.errors.length})
            </div>
            <ul className="text-sm text-red-600 space-y-1 pl-5">
              {validation.errors.map((error, index) => (
                <li key={index} className="list-disc">{error}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Warnings */}
        {hasWarnings && (
          <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-xl">
            <div className="flex items-center gap-2 text-yellow-700 font-medium text-sm mb-2">
              <span>🟡</span>
              Предупреждения ({validation.warnings.length})
            </div>
            <ul className="text-sm text-yellow-600 space-y-1 pl-5">
              {validation.warnings.map((warning, index) => (
                <li key={index} className="list-disc">{warning}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Success state (no issues) */}
        {!hasIssues && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-xl">
            <div className="flex items-center gap-2 text-green-700 font-medium text-sm">
              <span>🟢</span>
              Все поля заполнены корректно
            </div>
          </div>
        )}

        {/* Share limit info */}
        {isShare && shareLimitInfo && (
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-xl">
            <div className="text-sm text-blue-700">
              Лимит ссылок на сегодня: {shareLimitInfo.used}/{shareLimitInfo.limit}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3 mt-5">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            Отмена
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className={`flex-1 px-4 py-2.5 rounded-xl font-medium transition-colors flex items-center justify-center gap-2 ${
              isShare
                ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white hover:from-blue-600 hover:to-indigo-700'
                : 'bg-green-600 text-white hover:bg-green-700'
            } disabled:opacity-50`}
          >
            {isLoading && (
              <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            )}
            {isLoading ? (isLoadingLong ? 'Ещё немного...' : 'Загрузка...') : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
