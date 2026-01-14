// Type guard utilities

import type { Campaign } from '@/types';

/**
 * Type guard to check if value is not null or undefined
 */
export const isDefined = <T>(value: T | null | undefined): value is T => {
    return value !== null && value !== undefined;
};

/**
 * Type guard to check if value is a string
 */
export const isString = (value: unknown): value is string => {
    return typeof value === 'string';
};

/**
 * Type guard to check if value is a number
 */
export const isNumber = (value: unknown): value is number => {
    return typeof value === 'number' && !isNaN(value);
};

/**
 * Type guard to check if object has a specific property
 */
export const hasProperty = <T extends object, K extends PropertyKey>(
    obj: T,
    key: K
): obj is T & Record<K, unknown> => {
    return key in obj;
};
