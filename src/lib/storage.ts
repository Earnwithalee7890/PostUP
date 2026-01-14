// Local storage utilities with type safety

const STORAGE_PREFIX = 'postup_';

/**
 * Get item from localStorage with type safety
 */
export function getStorageItem<T>(key: string): T | null {
    if (typeof window === 'undefined') return null;
    try {
        const item = localStorage.getItem(STORAGE_PREFIX + key);
        return item ? JSON.parse(item) : null;
    } catch {
        return null;
    }
}

/**
 * Set item in localStorage
 */
export function setStorageItem<T>(key: string, value: T): void {
    if (typeof window === 'undefined') return;
    try {
        localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(value));
    } catch {
        console.error('Failed to save to localStorage');
    }
}

/**
 * Remove item from localStorage
 */
export function removeStorageItem(key: string): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(STORAGE_PREFIX + key);
}

/**
 * Clear all app-specific localStorage items
 */
export function clearAppStorage(): void {
    if (typeof window === 'undefined') return;
    Object.keys(localStorage)
        .filter(key => key.startsWith(STORAGE_PREFIX))
        .forEach(key => localStorage.removeItem(key));
}
