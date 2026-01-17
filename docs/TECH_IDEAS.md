# Tech Ideas: Технологии для изучения

> Документ создан: 2026-01-18
>
> **Проект завершён и готов к релизу.**
>
> Здесь собраны идеи технологий и подходов, которые интересно изучить на примере этого или будущих проектов. Не roadmap — просто заметки "на попробовать".

---

## UX-улучшения

Фичи для улучшения пользовательского опыта.

### 1.1 Dark theme toggle для превью

**Что:** Переключатель светлой/тёмной темы в превью телефона.

**Зачем:** Клиент видит, как бот выглядит в обеих темах Telegram.

**Как:**
- CSS-переменные для цветов
- Toggle-кнопка над превью
- Сохранение выбора в localStorage

**Затрагивает:** `TelegramPhone.tsx`, все preview-компоненты, `index.css`

---

### 1.2 Мобильная адаптация

**Что:** Адаптивный layout для экранов < 1024px.

**Зачем:** Клиенты могут заполнять форму с телефона/планшета.

**Как:**
- Tabs вместо split-view (Форма | Превью)
- Sticky tab-bar внизу экрана
- Компактные поля ввода

**Затрагивает:** `App.tsx`, создание `MobileLayout.tsx`, media queries

---

### 1.3 README.txt в ZIP-архиве

**Что:** Текстовый файл с инструкциями внутри скачиваемого архива.

**Зачем:** Клиент понимает, что делать с файлами; менеджер получает готовый пакет.

**Содержимое:**
```
Telegram Bot Settings
=====================
Бот: {botName} (@{username})
Дата: {date}

Файлы:
- data.json — текстовые данные для BotFather
- images/avatar.jpg — аватар бота (загрузить в BotFather)
- images/botpic.jpg — Description Picture

Инструкция:
1. Откройте @BotFather в Telegram
2. Выберите бота или создайте нового
3. Используйте команды /setname, /setdescription и т.д.
4. Загрузите изображения через /setuserpic и /setdescriptionpic
```

**Затрагивает:** `zipExport.ts`

---

## Работа с изображениями

Библиотеки для обработки изображений в браузере.

### 2.1 Cropping UI для изображений

**Что:** Встроенный редактор обрезки изображений.

**Зачем:** Клиент загружает любое фото — система помогает обрезать до нужных пропорций.

**Как:**
- Библиотека `react-image-crop` или `react-easy-crop`
- Модальное окно с crop-областью
- Предустановки: 1:1 (аватар), 16:9 (BotPic)

**Затрагивает:** `AvatarUpload.tsx`, `BotPicUpload.tsx`, новый `ImageCropper.tsx`

---

### 2.2 Автоматическое сжатие изображений

**Что:** Client-side сжатие больших изображений.

**Зачем:** Telegram ограничивает размер файлов (5MB). Клиент не думает о размере.

**Как:**
- Библиотека `browser-image-compression`
- Автосжатие при загрузке > 2MB
- Показ "до/после" размера

**Затрагивает:** `AvatarUpload.tsx`, `BotPicUpload.tsx`

---

### 2.3 Telegram Mini App версия

**Что:** Запуск приложения как Web App внутри Telegram.

**Зачем:** Клиент не уходит из мессенджера, автоматическая тема, можно отправить архив в чат.

**Как:**
- Добавить `@twa-dev/sdk`
- Определять окружение (браузер vs TWA)
- Использовать `WebApp.MainButton` для скачивания
- Адаптировать UI под мобильные размеры

**Требует:**
- Бот в BotFather с Menu Button
- HTTPS хостинг
- Мобильная адаптация (см. 1.2)

**Затрагивает:** `App.tsx`, `main.tsx`, создание `useTelegramWebApp.ts`

---

## Архитектура и DX

Инструменты для улучшения качества кода и developer experience.

### 3.1 Zustand для state management

**Что:** Миграция с useState на Zustand store.

**Зачем:**
- Убирает prop drilling (сейчас ~15 пропсов в App.tsx)
- Persist middleware для IndexedDB из коробки
- Проще добавлять новые фичи

**Как:**
```typescript
// stores/formStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface FormStore {
  botName: string;
  username: string;
  // ...все поля
  setBotName: (name: string) => void;
  reset: () => void;
}

export const useFormStore = create<FormStore>()(
  persist(
    (set) => ({
      botName: '',
      setBotName: (name) => set({ botName: name }),
      reset: () => set({ botName: '', username: '' }),
    }),
    { name: 'bot-settings-draft' }
  )
);
```

**Затрагивает:** `App.tsx`, все компоненты, удаление `useAutoSave.ts`

---

### 3.2 Zod schema валидация

**Что:** Единая схема валидации с автоматической генерацией типов.

**Зачем:**
- DRY: лимиты и правила в одном месте
- Типобезопасность
- Понятные сообщения об ошибках

**Как:**
```typescript
// schemas/formSchema.ts
import { z } from 'zod';

export const formSchema = z.object({
  botName: z.string()
    .min(1, 'Обязательное поле')
    .max(64, 'Максимум 64 символа'),
  username: z.string()
    .min(5, 'Минимум 5 символов')
    .max(32)
    .regex(/^[a-z][a-z0-9_]*bot$/i, 'Должен заканчиваться на "bot"'),
  // ...
});

export type FormData = z.infer<typeof formSchema>;
export const FIELD_LIMITS = {
  botName: formSchema.shape.botName._def.maxLength,
  // автоматически из схемы
};
```

**Затрагивает:** `DownloadModal.tsx`, `App.tsx`, создание `schemas/`

---

### 3.3 E2E тесты (Playwright)

**Что:** Автоматические тесты пользовательских сценариев.

**Зачем:**
- Ловит регрессии при рефакторинге
- Документирует ожидаемое поведение
- CI/CD интеграция

**Как:**
```typescript
// tests/form.spec.ts
import { test, expect } from '@playwright/test';

test('заполнение формы и валидация', async ({ page }) => {
  await page.goto('/');

  await page.fill('[data-testid="botName"]', 'Мой Бот');
  await page.fill('[data-testid="username"]', 'mybot');

  await expect(page.locator('.bot-profile-name'))
    .toContainText('Мой Бот');

  await page.click('[data-testid="download-btn"]');
  await expect(page.locator('.download-modal')).toBeVisible();
});

test('marquee для длинных имён', async ({ page }) => {
  await page.goto('/');
  await page.fill('[data-testid="botName"]', 'A'.repeat(25));

  await expect(page.locator('.animate-marquee')).toBeVisible();
});
```

**Требует:**
- `npm install -D @playwright/test`
- Добавление `data-testid` атрибутов
- CI pipeline (GitHub Actions)

**Затрагивает:** создание `tests/`, `playwright.config.ts`, компоненты (data-testid)

---

## Ссылки

- [Zustand](https://github.com/pmndrs/zustand)
- [Zod](https://zod.dev/)
- [Playwright](https://playwright.dev/)
- [Telegram Mini Apps](https://core.telegram.org/bots/webapps)
- [react-image-crop](https://github.com/DominicTobias/react-image-crop)
- [browser-image-compression](https://github.com/nickmessing/browser-image-compression)
