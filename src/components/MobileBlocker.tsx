export function MobileBlocker() {
  return (
    <div className="fixed inset-0 bg-white z-50 flex items-center justify-center p-8 lg:hidden">
      <div className="text-center max-w-md">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Telegram Bot Visual Setup
        </h1>
        <p className="text-gray-600 mb-6">
          Инструмент для подготовки контента настроек Telegram-бота с live preview
        </p>

        <div className="text-6xl mb-4">🖥️</div>
        <p className="text-gray-700 mb-2">
          Для работы нужен компьютер
        </p>
        <p className="text-sm text-gray-500 mb-8">
          Загрузка файлов и проверка макетов неудобны на мобильном устройстве
        </p>

        <div className="pt-6 border-t border-gray-200">
          <p className="text-sm text-gray-500">
            Автор: Андрей Погорелый
          </p>
          <a
            href="https://t.me/+vZVUCYuga3plNjYy"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-blue-600 hover:text-blue-800"
          >
            @toolatetolearn
          </a>
        </div>
      </div>
    </div>
  );
}
