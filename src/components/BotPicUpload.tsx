import { useState, useRef, useEffect } from 'react';
import type { DragEvent, ChangeEvent } from 'react';

interface BotPicUploadProps {
  botPicUrl: string | null;
  onBotPicChange: (botPicUrl: string | null, file: File | null) => void;
  onFocus?: () => void;
  onHoverStart?: () => void;
  onHoverEnd?: () => void;
}

export function BotPicUpload({ botPicUrl, onBotPicChange, onFocus, onHoverStart, onHoverEnd }: BotPicUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isImageLoading, setIsImageLoading] = useState(false);
  const [imageInfo, setImageInfo] = useState<{
    width: number;
    height: number;
    size: number;
  } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Вычисление размера файла из data URL (base64)
  const getDataUrlSize = (dataUrl: string): number => {
    const base64 = dataUrl.split(',')[1];
    if (!base64) return 0;
    const padding = (base64.match(/=+$/) || [''])[0].length;
    return Math.floor((base64.length * 3) / 4) - padding;
  };

  // Пересчёт imageInfo при внешнем изменении botPicUrl (восстановление из IndexedDB)
  useEffect(() => {
    if (!botPicUrl) {
      setImageInfo(null);
      setIsImageLoading(false);
      return;
    }

    // Начинаем загрузку
    setIsImageLoading(true);

    const img = new Image();
    img.onload = () => {
      const size = getDataUrlSize(botPicUrl);
      setImageInfo({
        width: img.width,
        height: img.height,
        size
      });
      setIsImageLoading(false);
    };
    img.onerror = () => {
      setIsImageLoading(false);
    };
    img.src = botPicUrl;
  }, [botPicUrl]);

  // Валидация изображения
  const validateImage = async (file: File): Promise<{ valid: boolean; error?: string }> => {
    // Проверка типа файла (только JPEG/PNG)
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

        // Требование Telegram: СТРОГО 640x360px
        if (width !== 640 || height !== 360) {
          resolve({
            valid: false,
            error: `Telegram требует строго 640×360px (текущее: ${width}×${height}px)`
          });
          return;
        }

        resolve({ valid: true });
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

    const validation = await validateImage(file);

    if (!validation.valid) {
      setError(validation.error || 'Ошибка валидации');
      return;
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
          size: file.size
        });
        onBotPicChange(dataUrl, file);
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

  // Удаление BotPic
  const handleRemove = () => {
    onBotPicChange(null, null);
    setImageInfo(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="mb-4">
      {/* Upload Zone */}
      {!botPicUrl ? (
        <div
          onDragEnter={handleDragEnter}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          onMouseEnter={onHoverStart}
          onMouseLeave={onHoverEnd}
          className={`
            border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all duration-200 upload-zone
            ${isDragging
              ? 'border-blue-500 bg-blue-50'
              : error
                ? 'border-red-300 bg-red-50'
                : 'border-gray-300'
            }
          `}
        >
          <div className="text-4xl mb-2">🖼️</div>
          <p className="text-sm text-gray-600">
            Description Picture
          </p>
          <p className="text-xs text-gray-400 mt-1">
            строго 640×360 px
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
          onMouseEnter={onHoverStart}
          onMouseLeave={onHoverEnd}
          className="border-2 border-gray-300 rounded-lg p-4 cursor-pointer transition-all duration-200 upload-preview"
        >
          <div className="flex items-start gap-4">
            {/* BotPic Preview */}
            <div className="w-48 flex-shrink-0">
              <div className="relative" style={{ aspectRatio: '16 / 9' }}>
                {isImageLoading && (
                  <div className="absolute inset-0 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded-lg animate-pulse" />
                )}
                <img
                  src={botPicUrl}
                  alt="BotPic preview"
                  className={`w-full h-full object-cover rounded-lg transition-opacity duration-200 ${
                    isImageLoading ? 'opacity-0' : 'opacity-100'
                  }`}
                  onLoad={() => setIsImageLoading(false)}
                  onError={() => setIsImageLoading(false)}
                />
              </div>
            </div>

            {/* Info */}
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900 mb-2">
                ✓ Изображение загружено
              </p>
              {imageInfo && (
                <div className="text-xs text-gray-600 space-y-1">
                  <p>Разрешение: {imageInfo.width}×{imageInfo.height}px ✓</p>
                  <p>Размер файла: {(imageInfo.size / 1024).toFixed(1)} KB</p>
                </div>
              )}
            </div>

            {/* Remove Button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleRemove();
              }}
              className="px-3 py-1.5 text-sm text-red-600 rounded cursor-pointer transition-all duration-200 btn-delete"
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
    </div>
  );
}
