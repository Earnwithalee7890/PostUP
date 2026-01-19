/**
 * Application Constants
 * Centralized configuration for the Tip2Post platform
 */

// Platform Configuration
export const PLATFORM_FEE_PERCENT = 10;
export const CREATOR_FEE_PERCENT = 8;
export const MAX_CAMPAIGN_DURATION_DAYS = 30;
export const MIN_CAMPAIGN_BUDGET = 1; // $1 minimum

// Brand Colors
export const BRAND_COLORS = {
    PRIMARY: '#8b5cf6', // Violet 500
    SECONDARY: '#7c3aed', // Violet 600
    ACCENT: '#ec4899', // Pink 500
    SUCCESS: '#22c55e', // Green 500
    WARNING: '#f59e0b', // Amber 500
    ERROR: '#ef4444', // Red 500
    BACKGROUND: '#000000',
    SURFACE: '#121212',
    TEXT: '#ffffff',
    TEXT_MUTED: '#9ca3af' // Gray 400
};

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
    'Follow': BRAND_COLORS.PRIMARY,
    'Boost': BRAND_COLORS.WARNING,
    'Multi': '#2ecc71',
    'Channel': '#3b82f6',
    'MiniApp': BRAND_COLORS.ACCENT
};

// Quality Score Thresholds
export const QUALITY_TIERS = {
    ELITE: { min: 85, label: '🏆 Elite', color: '#ffd700' },
    PRO: { min: 65, label: '⭐ Pro', color: BRAND_COLORS.PRIMARY },
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
