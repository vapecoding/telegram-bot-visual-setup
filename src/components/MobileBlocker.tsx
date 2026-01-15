export function MobileBlocker() {
  return (
    <div className="fixed inset-0 bg-white z-50 flex items-center justify-center p-8 lg:hidden">
      <div className="text-center max-w-md">
        <div className="text-6xl mb-6">🖥️</div>
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          Откройте на компьютере
        </h1>
        <p className="text-gray-600 mb-4">
          Этот инструмент предназначен для работы на компьютере.
          Здесь нужно загружать файлы и проверять макеты,
          на телефоне это неудобно.
        </p>
        <p className="text-sm text-gray-500">
          Откройте эту ссылку в браузере на компьютере для продолжения.
        </p>
      </div>
    </div>
  );
}
