import { supabase } from './supabase';

interface ShareNotification {
  shareUrl: string;
  botName?: string;
  botUsername?: string;
}

/**
 * Отправляет уведомление о созданной ссылке через Edge Function
 * Не блокирует UI и не показывает ошибки пользователю
 */
export async function notifyShareCreated(data: ShareNotification): Promise<void> {
  if (!supabase) return;

  try {
    await supabase.functions.invoke('notify-telegram', {
      body: data,
    });
  } catch (error) {
    // Тихо игнорируем ошибки уведомлений - это не критично для пользователя
    console.warn('Failed to send share notification:', error);
  }
}

/**
 * Отправляет событие в Яндекс.Метрику
 */
export function trackEvent(goal: string): void {
  try {
    // @ts-expect-error ym is defined globally in index.html
    if (typeof ym === 'function') {
      // @ts-expect-error ym is defined globally in index.html
      ym(106321267, 'reachGoal', goal);
    }
  } catch (error) {
    console.warn('Failed to track event:', error);
  }
}
