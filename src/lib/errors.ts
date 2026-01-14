// Error handling utilities

/**
 * Custom app error class
 */
export class AppError extends Error {
    constructor(
        message: string,
        public code: string,
        public statusCode: number = 400
    ) {
        super(message);
        this.name = 'AppError';
    }
}

/**
 * Common error codes
 */
export const ERROR_CODES = {
    UNAUTHORIZED: 'UNAUTHORIZED',
    NOT_FOUND: 'NOT_FOUND',
    VALIDATION_ERROR: 'VALIDATION_ERROR',
    NETWORK_ERROR: 'NETWORK_ERROR',
    UNKNOWN_ERROR: 'UNKNOWN_ERROR',
} as const;

/**
 * Create a user-friendly error message
 */
export const getErrorMessage = (error: unknown): string => {
    if (error instanceof AppError) return error.message;
    if (error instanceof Error) return error.message;
    return 'An unexpected error occurred';
};

/**
 * Log error to console (can be extended to external service)
 */
export const logError = (error: unknown, context?: string): void => {
    console.error(`[${context || 'App'}]`, error);
    // TODO: Send to error tracking service in production
};
