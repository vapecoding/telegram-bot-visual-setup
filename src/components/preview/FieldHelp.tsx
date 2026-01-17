interface FieldHelpProps {
  focusedField?: string | null;
  avatarError?: string | null;
  avatarWarning?: string | null;
}

// Описания полей с техническими деталями
const fieldDescriptions: Record<string, { title: string; description: string; limits?: string }> = {
  botName: {
    title: 'Имя бота (Display Name)',
    description: 'Отображаемое имя бота в списке чатов, профиле и шапке диалога. Может содержать эмодзи и любые символы Unicode.',
    limits: 'До 64 символов'
  },
  shortDescription: {
    title: 'Короткое описание',
    description: 'Показывается в списке контактов (как последнее сообщение) и при открытии ссылки t.me/username. Видно до входа в диалог.',
    limits: 'До 120 символов'
  },
  avatar: {
    title: 'Аватарка бота',
    description: 'Фото профиля бота. Показывается во всех местах: список чатов, профиль, шапка диалога, сообщения от бота.',
    limits: '640×640 px, до 5 МБ, форматы: JPG, PNG'
  },
  about: {
    title: 'О боте (About)',
    description: 'Текст в профиле бота в разделе "О боте". Ссылки (https://, t.me/, @username) автоматически становятся кликабельными.',
    limits: 'До 120 символов'
  },
  username: {
    title: 'Username бота',
    description: 'Уникальный адрес бота в Telegram. Используется для ссылок t.me/username и поиска. Только латиница, цифры и подчёркивание.',
    limits: '5-32 символа, должен заканчиваться на "bot"'
  },
  privacyPolicyUrl: {
    title: 'Политика конфиденциальности',
    description: 'Ссылка на страницу с политикой конфиденциальности. Показывается в профиле бота отдельной строкой.',
    limits: 'До 256 символов, валидный HTTPS URL'
  },
  botPic: {
    title: 'Description Picture',
    description: 'Картинка на стартовом экране диалога (до нажатия START). Показывается над карточкой "Что умеет этот бот?".',
    limits: '640×360 px (16:9), до 5 МБ, форматы: JPG, PNG'
  },
  description: {
    title: 'Описание (Description)',
    description: 'Текст в карточке "Что умеет этот бот?" на стартовом экране. Поддерживает переносы строк. Показывается до первого сообщения.',
    limits: 'До 512 символов'
  },
  firstMessageText: {
    title: 'Первое сообщение',
    description: 'Сообщение, которое бот отправит пользователю после нажатия START. Поддерживает переносы строк и базовое форматирование.',
    limits: 'До 4096 символов'
  },
  inlineButtonText: {
    title: 'Inline-кнопка',
    description: 'Кнопка под первым сообщением бота. Может содержать эмодзи. При нажатии выполняет callback_query.',
    limits: 'До 64 символов'
  },
  inlineButtonResponse: {
    title: 'Ответ на кнопку',
    description: 'Сообщение, которое бот отправит при нажатии на inline-кнопку. Поддерживает переносы строк.',
    limits: 'До 4096 символов'
  }
};

const defaultHelp = {
  title: 'Превью',
  description: 'Справа отображается схематичное превью настроек бота. Внешний вид приближен к Telegram, но может отличаться от реального отображения в приложении.\n\nНаведите на поле или начните его редактировать, чтобы увидеть подробное описание.',
  limits: undefined
};

export function FieldHelp({ focusedField, avatarError, avatarWarning }: FieldHelpProps) {
  const isDefault = !focusedField || !fieldDescriptions[focusedField];
  const help = isDefault ? defaultHelp : fieldDescriptions[focusedField];

  // Проверяем, есть ли алерт для аватарки
  const isAvatarFocused = focusedField === 'avatar';
  const hasAvatarError = isAvatarFocused && avatarError;
  const hasAvatarWarning = isAvatarFocused && avatarWarning && !avatarError;

  // Определяем стиль блока
  const getBlockStyle = () => {
    if (hasAvatarError) {
      return 'bg-red-50 border-2 border-red-300 shadow-sm';
    }
    if (hasAvatarWarning) {
      return 'bg-yellow-50 border-2 border-yellow-300 shadow-sm';
    }
    if (isDefault) {
      return 'bg-gray-100/60 border border-gray-200/30';
    }
    return 'bg-white/90 backdrop-blur-sm shadow-sm border border-blue-200/50';
  };

  // Определяем иконку
  const getIcon = () => {
    if (hasAvatarError) return '⚠️';
    if (hasAvatarWarning) return '⚠️';
    if (isDefault) return '💡';
    return 'ℹ️';
  };

  return (
    <div className={`rounded-xl p-4 text-sm transition-all duration-200 ${getBlockStyle()}`}>
      <div className="flex items-start gap-2 mb-2">
        <span className={`text-base ${isDefault && !hasAvatarError && !hasAvatarWarning ? 'opacity-40' : 'opacity-100'}`}>
          {getIcon()}
        </span>
        <h4 className={`font-semibold ${
          hasAvatarError ? 'text-red-800' :
          hasAvatarWarning ? 'text-yellow-800' :
          isDefault ? 'text-gray-500' : 'text-gray-800'
        }`}>
          {help.title}
        </h4>
      </div>

      {/* Алерт блок для ошибки/предупреждения аватарки */}
      {(hasAvatarError || hasAvatarWarning) && (
        <div className={`mb-3 p-2 rounded-lg ${
          hasAvatarError ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
        }`}>
          <p className="text-sm font-medium">
            {avatarError || avatarWarning}
          </p>
        </div>
      )}

      <p className={`whitespace-pre-wrap leading-relaxed ${
        hasAvatarError ? 'text-red-600' :
        hasAvatarWarning ? 'text-yellow-700' :
        isDefault ? 'text-gray-400 text-xs' : 'text-gray-600'
      }`}>
        {help.description}
      </p>
      {help.limits && (
        <div className={`mt-2 pt-2 border-t ${
          hasAvatarError ? 'border-red-200' :
          hasAvatarWarning ? 'border-yellow-200' :
          'border-gray-200/50'
        }`}>
          <span className={`text-xs font-medium ${
            hasAvatarError ? 'text-red-600' :
            hasAvatarWarning ? 'text-yellow-600' :
            'text-blue-600'
          }`}>{help.limits}</span>
        </div>
      )}
    </div>
  );
}
