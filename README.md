# Telegram Bot Settings Viewer

Веб-приложение для сбора и валидации контента настроек Telegram-бота с live preview.

## Описание

Инструмент помогает клиентам правильно заполнить настройки бота (тексты, изображения), показывая как они будут выглядеть в Telegram. Все данные валидируются по требованиям Telegram API перед экспортом.

**Основные возможности:**
- Интерактивная форма с валидацией полей
- Live preview в 3 режимах (Список чатов, Профиль, Диалог)
- Bidirectional highlighting — подсветка связанных элементов форма ↔ превью
- Автосохранение черновика в IndexedDB
- Экспорт валидированных данных в ZIP-архив

## Технологии

- React 19 + TypeScript
- Vite 7
- Tailwind CSS 4
- IndexedDB (idb-keyval)
- JSZip + file-saver

## Разработка

```bash
# Установка зависимостей
npm install

# Запуск dev-сервера
npm run dev

# Сборка
npm run build
```

## Статус проекта

**MVP завершён** — desktop-only версия полностью функциональна.

## Документация

- [TDD_v2_EXTENDED.md](docs/TDD_v2_EXTENDED.md) — актуальная техническая документация
- [projectGoal.md](docs/projectGoal.md) — цель проекта и статус реализации
- [TECH_IDEAS.md](docs/TECH_IDEAS.md) — идеи технологий для изучения
- [TDD_LIGHT_ORIGINAL.md](docs/TDD_LIGHT_ORIGINAL.md) — оригинальный TDD (исторический)

## Лицензия

Private project
