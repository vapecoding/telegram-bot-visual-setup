import { z } from 'zod';

/**
 * Zod схема валидации настроек Telegram бота
 * Используется для:
 * - Финальной валидации перед экспортом ZIP
 * - Проверки черновика при загрузке из IndexedDB
 * - Type-safety через z.infer<typeof botSettingsSchema>
 *
 * Примечание: Avatar и BotPic (File) валидируются отдельно в компонентах
 * AvatarUpload и BotPicUpload и не включены в эту схему, так как File объекты
 * не сериализуются в JSON.
 */

export const botSettingsSchema = z.object({
  // Имя бота (Display Name) - отображаемое имя бота в Telegram
  // BotFather: /setname
  // Может содержать любые символы (кириллица, эмодзи, пробелы и т.д.)
  botName: z.string()
    .min(1, "Имя не может быть пустым")
    .max(64, "Максимум 64 символа"),

  // Короткое описание (отображается в списке контактов)
  shortDescription: z.string()
    .max(120, "Максимум 120 символов"),

  // Описание (отображается на стартовом экране)
  description: z.string()
    .max(512, "Максимум 512 символов"),

  // О боте (отображается в профиле)
  about: z.string()
    .max(120, "Максимум 120 символов"),

  // URL политики конфиденциальности
  privacyPolicyUrl: z.string()
    .url("Введите корректный URL (например: https://example.com/privacy)")
    .max(256, "Максимум 256 символов"),

  // Первое сообщение после START (опциональное)
  firstMessage: z.object({
    text: z.string()
      .min(1, "Текст сообщения не может быть пустым")
      .max(4096, "Максимум 4096 символов"),
    inlineButton: z.object({
      text: z.string()
        .min(1, "Текст кнопки не может быть пустым")
        .max(64, "Максимум 64 символа"),
      response: z.string()
        .max(4096, "Максимум 4096 символов")
    }).optional()
  }).optional()
});

// TypeScript тип, автоматически выведенный из схемы
export type BotSettings = z.infer<typeof botSettingsSchema>;

/**
 * Утилита для валидации данных формы
 * Возвращает либо успешный результат, либо массив ошибок
 */
export function validateBotSettings(data: unknown): {
  success: boolean;
  data?: BotSettings;
  errors?: Array<{ field: string; message: string }>;
} {
  try {
    const validData = botSettingsSchema.parse(data);
    return { success: true, data: validData };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors = error.issues.map((issue) => ({
        field: issue.path.join('.'),
        message: issue.message
      }));
      return { success: false, errors };
    }
    return {
      success: false,
      errors: [{ field: 'unknown', message: 'Неизвестная ошибка валидации' }]
    };
  }
}
