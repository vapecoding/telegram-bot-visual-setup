import { useState, useRef, useEffect } from 'react';
import type { DragEvent, ChangeEvent } from 'react';

interface AvatarUploadProps {
  avatarUrl: string | null;
  onAvatarChange: (avatarUrl: string | null, file: File | null) => void;
  onFocus?: () => void;
  onBlur?: () => void;
}

export function AvatarUpload({ avatarUrl, onAvatarChange, onFocus, onBlur }: AvatarUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [warning, setWarning] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [imageInfo, setImageInfo] = useState<{
    width: number;
    height: number;
    size: number;
    isSquare: boolean;
  } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Закрытие модального окна по ESC
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && showModal) {
        setShowModal(false);
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [showModal]);

  // Пересчёт imageInfo при внешнем изменении avatarUrl (демо-данные, восстановление из IndexedDB)
  useEffect(() => {
    if (!avatarUrl) {
      setImageInfo(null);
      setWarning(null);
      return;
    }

    const img = new Image();
    img.onload = () => {
      const width = img.width;
      const height = img.height;
      const aspectRatio = width / height;
      const isSquare = aspectRatio >= 0.95 && aspectRatio <= 1.05;

      setImageInfo({
        width,
        height,
        size: 0, // Размер файла неизвестен для Data URL
        isSquare
      });

      // Устанавливаем предупреждение если не квадрат
      if (!isSquare) {
        setWarning(`Рекомендуется квадратное изображение (текущее: ${width}x${height}px). Telegram автоматически обрежет по центру.`);
      } else {
        setWarning(null);
      }
    };
    img.src = avatarUrl;
  }, [avatarUrl]);

  // Валидация изображения
  const validateImage = async (file: File): Promise<{ valid: boolean; error?: string; warning?: string; isSquare?: boolean }> => {
    // Проверка типа файла
    if (!file.type.match(/^image\/(jpeg|jpg|png)$/)) {
      return { valid: false, error: 'Допустимы только JPEG и PNG форматы' };
    }

    // Проверка размера файла (макс 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return { valid: false, error: `Размер файла превышает 5MB (текущий: ${(file.size / 1024 / 1024).toFixed(2)}MB)` };
    }

    // Загружаем изображение для проверки разрешения
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const width = img.width;
        const height = img.height;

        // Проверка минимального разрешения
        if (width < 640 || height < 640) {
          resolve({ valid: false, error: `Минимальное разрешение 640x640px (текущее: ${width}x${height}px)` });
          return;
        }

        // Проверка максимального разрешения
        if (width > 4096 || height > 4096) {
          resolve({ valid: false, error: `Максимальное разрешение 4096x4096px (текущее: ${width}x${height}px)` });
          return;
        }

        // Проверка соотношения сторон (квадрат ±5%)
        const aspectRatio = width / height;
        const isSquare = aspectRatio >= 0.95 && aspectRatio <= 1.05;

        if (!isSquare) {
          // Не блокируем загрузку, только предупреждаем
          resolve({
            valid: true,
            warning: `Рекомендуется квадратное изображение (текущее: ${width}x${height}px). Telegram автоматически обрежет по центру.`,
            isSquare: false
          });
          return;
        }

        resolve({ valid: true, isSquare: true });
      };

      img.onerror = () => {
        resolve({ valid: false, error: 'Не удалось загрузить изображение' });
      };

      img.src = URL.createObjectURL(file);
    });
  };

  // Обработка выбора файла
  const handleFile = async (file: File) => {
    setError(null);
    setWarning(null);

    const validation = await validateImage(file);

    if (!validation.valid) {
      setError(validation.error || 'Ошибка валидации');
      return;
    }

    // Устанавливаем предупреждение если есть
    if (validation.warning) {
      setWarning(validation.warning);
    }

    // Создаем Data URL для preview
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;

      // Получаем размеры изображения
      const img = new Image();
      img.onload = () => {
        setImageInfo({
          width: img.width,
          height: img.height,
          size: file.size,
          isSquare: validation.isSquare ?? true
        });
        onAvatarChange(dataUrl, file);
      };
      img.src = dataUrl;
    };
    reader.readAsDataURL(file);
  };

  // Drag & Drop handlers
  const handleDragEnter = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      handleFile(files[0]);
    }
  };

  // Click to upload handler
  const handleFileInput = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFile(files[0]);
    }
  };

  // Удаление аватара
  const handleRemove = () => {
    onAvatarChange(null, null);
    setImageInfo(null);
    setError(null);
    setWarning(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="mb-6">
      <div className="mb-2">
        <label className="block text-sm font-medium text-gray-700">
          Profile Photo (Аватар бота)
        </label>
        <p className="text-xs text-gray-500 mt-1">
          Круглая аватарка в профиле бота, списке чатов и заголовках сообщений
        </p>
      </div>

      {/* Upload Zone */}
      {!avatarUrl ? (
        <div
          onDragEnter={handleDragEnter}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          onMouseEnter={onFocus}
          onMouseLeave={onBlur}
          className={`
            border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
            ${isDragging
              ? 'border-blue-500 bg-blue-50'
              : error
                ? 'border-red-300 bg-red-50'
                : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'
            }
          `}
        >
          <div className="text-5xl mb-3">📷</div>
          <p className="text-sm font-medium text-gray-700 mb-1">
            Перетащите изображение или нажмите для выбора
          </p>
          <p className="text-xs text-gray-500">
            JPEG или PNG, до 5MB, минимум 640x640px, квадратное
          </p>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/jpg,image/png"
            onChange={handleFileInput}
            className="hidden"
          />
        </div>
      ) : (
        /* Preview Zone */
        <div
          onClick={onFocus}
          className={`border-2 rounded-lg p-4 cursor-pointer hover:border-blue-300 ${
            warning
              ? 'border-yellow-400 bg-yellow-50'
              : 'border-gray-300'
          }`}
        >
          <div className="flex items-start gap-4">
            {/* Avatar Preview */}
            <div
              onClick={(e) => { e.stopPropagation(); setShowModal(true); }}
              className="w-24 h-24 rounded-full overflow-hidden bg-gradient-to-br from-blue-400 to-purple-500 flex-shrink-0 cursor-pointer hover:opacity-80 transition-opacity"
              title="Нажмите для просмотра в полном размере"
            >
              <img
                src={avatarUrl}
                alt="Avatar preview"
                className="w-full h-full object-cover"
              />
            </div>

            {/* Info */}
            <div className="flex-1">
              <p className={`text-sm font-medium mb-2 ${
                warning ? 'text-yellow-700' : 'text-gray-900'
              }`}>
                {warning ? '⚠️ Изображение загружено' : '✓ Изображение загружено'}
              </p>
              {imageInfo && (
                <div className="text-xs text-gray-600 space-y-1">
                  <p>Разрешение: {imageInfo.width}x{imageInfo.height}px
                    {!imageInfo.isSquare && (
                      <span className="text-yellow-600 ml-1">(не квадрат)</span>
                    )}
                  </p>
                  <p>Размер файла: {(imageInfo.size / 1024).toFixed(1)} KB</p>
                </div>
              )}
              <button
                onClick={(e) => { e.stopPropagation(); setShowModal(true); }}
                className="text-xs text-blue-600 hover:underline mt-2"
              >
                🔍 Открыть в полном размере
              </button>
            </div>

            {/* Remove Button */}
            <button
              onClick={(e) => { e.stopPropagation(); handleRemove(); }}
              className="px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 rounded transition-colors"
            >
              🗑️ Удалить
            </button>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-700">⚠️ {error}</p>
        </div>
      )}

      {/* Warning Message */}
      {warning && (
        <div className="mt-2 p-3 bg-yellow-50 border border-yellow-300 rounded-lg">
          <p className="text-sm text-yellow-800">⚠️ {warning}</p>
        </div>
      )}


      {/* Modal для полноразмерного просмотра */}
      {showModal && avatarUrl && (
        <div
          onClick={() => setShowModal(false)}
          className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
          style={{ backdropFilter: 'blur(4px)' }}
        >
          <div className="relative max-w-4xl max-h-[90vh] flex flex-col items-center">
            {/* Close button */}
            <button
              onClick={() => setShowModal(false)}
              className="absolute -top-12 right-0 text-white text-2xl hover:text-gray-300 transition-colors bg-black/50 w-10 h-10 rounded-full"
              title="Закрыть (ESC)"
            >
              ×
            </button>

            {/* Image */}
            <img
              src={avatarUrl}
              alt="Avatar full size"
              className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            />

            {/* Image info */}
            {imageInfo && (
              <div className="mt-4 bg-black/70 text-white px-4 py-2 rounded-lg text-sm">
                {imageInfo.width}x{imageInfo.height}px · {(imageInfo.size / 1024).toFixed(1)} KB
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
