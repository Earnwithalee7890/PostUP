/**
 * Application Constants
 * Centralized configuration for the Post Up platform
 */

// Platform Configuration
export const PLATFORM_FEE_PERCENT = 10;
export const CREATOR_FEE_PERCENT = 8;
export const MAX_CAMPAIGN_DURATION_DAYS = 30;
export const MIN_CAMPAIGN_BUDGET = 1; // $1 minimum

// Task Types
export const TASK_LABELS: Record<string, string> = {
    'Follow': '👤 Follow',
    'Like': '❤️ Like',
    'Repost': '🔄 Repost',
    'Comment': '💬 Comment',
    'Quote': '📝 Quote',
    'Cast': '📢 Cast',
    'JoinChannel': '📺 Join Channel',
    'OpenMiniApp': '🎮 Mini App'
};

// Campaign Categories
export const CATEGORY_COLORS: Record<string, string> = {
    'Follow': '#8b5cf6',
    'Boost': '#f59e0b',
    'Multi': '#2ecc71',
    'Channel': '#3b82f6',
    'MiniApp': '#ec4899'
};

// Quality Score Thresholds
export const QUALITY_TIERS = {
    ELITE: { min: 85, label: '🏆 Elite', color: '#ffd700' },
    PRO: { min: 65, label: '⭐ Pro', color: '#8b5cf6' },
    VERIFIED: { min: 45, label: '✓ Verified', color: '#2ecc71' },
    BASIC: { min: 0, label: '📝 Basic', color: '#6b7280' }
};

// API Endpoints
export const API_ENDPOINTS = {
    VERIFY_TASK: '/api/verify-task',
    SEND_NOTIFICATION: '/api/send-notification',
    WEBHOOK: '/api/webhook'
};

// Pagination
export const DEFAULT_PAGE_SIZE = 20;
export const MAX_PAGE_SIZE = 100;

// Cache Duration (seconds)
export const CACHE_DURATION = {
    CAMPAIGNS: 60,
    LEADERBOARD: 300,
    USER_STATS: 180
};
