interface DownloadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDownload: () => void;
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
}

interface ValidationResult {
  canDownload: boolean;
  errors: string[];
  warnings: string[];
}

// Лимиты символов для полей
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
  formData: DownloadModalProps['formData'],
  avatarError: string | null,
  avatarWarning: string | null
): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // === ПРЕВЫШЕНИЕ ЛИМИТА СИМВОЛОВ (блокируют скачивание) ===

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

  // === ОБЯЗАТЕЛЬНЫЕ ПОЛЯ (блокируют скачивание) ===

  // botName
  if (!formData.botName.trim()) {
    errors.push('Имя бота — обязательное поле');
  }

  // username
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

  // === ОПЦИОНАЛЬНЫЕ ПОЛЯ (предупреждения, не блокируют) ===

  // Avatar warning
  if (avatarWarning) {
    warnings.push(`Аватарка: ${avatarWarning}`);
  }

  // Пустые опциональные поля
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

  return {
    canDownload: errors.length === 0,
    errors,
    warnings
  };
}

export function DownloadModal({
  isOpen,
  onClose,
  onDownload,
  formData,
  avatarError,
  avatarWarning
}: DownloadModalProps) {
  if (!isOpen) return null;

  const validation = validateForm(formData, avatarError, avatarWarning);
  const hasIssues = validation.errors.length > 0 || validation.warnings.length > 0;

  const handleDownload = () => {
    if (validation.canDownload) {
      onDownload();
      onClose();
    }
  };

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
            validation.canDownload
              ? hasIssues
                ? 'bg-yellow-100'
                : 'bg-green-100'
              : 'bg-red-100'
          }`}>
            <span className="text-3xl">
              {validation.canDownload
                ? hasIssues
                  ? '⚠️'
                  : '✅'
                : '🚫'}
            </span>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-1">
            {validation.canDownload
              ? hasIssues
                ? 'Архив готов к скачиванию'
                : 'Всё заполнено!'
              : 'Невозможно скачать архив'}
          </h3>
          <p className="text-sm text-gray-600">
            {validation.canDownload
              ? 'Проверьте статус перед скачиванием'
              : 'Исправьте ошибки для продолжения'}
          </p>
        </div>

        {/* Errors */}
        {validation.errors.length > 0 && (
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
        {validation.warnings.length > 0 && (
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
              Все обязательные и опциональные поля заполнены
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3 mt-5">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors"
          >
            Отмена
          </button>
          <button
            onClick={handleDownload}
            disabled={!validation.canDownload}
            className={`flex-1 px-4 py-2.5 rounded-xl font-medium transition-colors ${
              validation.canDownload
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
          >
            Скачать архив
          </button>
        </div>
      </div>
    </div>
  );
}
