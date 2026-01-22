/**
 * Rate limiting utility for Share functionality
 * Uses localStorage with a separate key from IndexedDB draft storage
 * so that "Очистить" (Clear) button doesn't reset the share limit
 */

const SHARE_LIMIT_KEY = 'tgvisual_share_limits';
const DAILY_LIMIT = 5;

interface ShareLimits {
  dailyCount: number;
  dailyResetDate: string; // YYYY-MM-DD format
}

function getTodayDate(): string {
  return new Date().toISOString().split('T')[0];
}

function getLimits(): ShareLimits {
  try {
    const stored = localStorage.getItem(SHARE_LIMIT_KEY);
    if (!stored) {
      return { dailyCount: 0, dailyResetDate: getTodayDate() };
    }
    return JSON.parse(stored);
  } catch {
    return { dailyCount: 0, dailyResetDate: getTodayDate() };
  }
}

function saveLimits(limits: ShareLimits): void {
  localStorage.setItem(SHARE_LIMIT_KEY, JSON.stringify(limits));
}

/**
 * Check if a new date has started and reset counter if needed
 */
function getResetLimitsIfNeeded(): ShareLimits {
  const limits = getLimits();
  const today = getTodayDate();

  if (limits.dailyResetDate !== today) {
    // New day - reset the counter
    return { dailyCount: 0, dailyResetDate: today };
  }

  return limits;
}

/**
 * Check if sharing is allowed
 * @returns Object with allowed status and remaining shares count
 */
export function canShare(): { allowed: boolean; remaining: number } {
  const limits = getResetLimitsIfNeeded();
  const remaining = DAILY_LIMIT - limits.dailyCount;

  return {
    allowed: remaining > 0,
    remaining: Math.max(0, remaining)
  };
}

/**
 * Increment the share counter after successful share
 * Call this AFTER a successful share operation
 */
export function incrementShareCount(): void {
  const limits = getResetLimitsIfNeeded();
  limits.dailyCount += 1;
  saveLimits(limits);
}

/**
 * Get detailed share limit information for UI display
 */
export function getShareLimitInfo(): {
  used: number;
  limit: number;
} {
  const limits = getResetLimitsIfNeeded();

  return {
    used: limits.dailyCount,
    limit: DAILY_LIMIT
  };
}

export const SHARE_DAILY_LIMIT = DAILY_LIMIT;
