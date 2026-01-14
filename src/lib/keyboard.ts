// Keyboard navigation utilities

/**
 * Common keyboard shortcuts for the app
 */
export const KEYBOARD_SHORTCUTS = {
    ESCAPE: 'Escape',
    ENTER: 'Enter',
    ARROW_UP: 'ArrowUp',
    ARROW_DOWN: 'ArrowDown',
    TAB: 'Tab',
} as const;

/**
 * Check if user pressed escape key
 */
export const isEscapeKey = (event: KeyboardEvent): boolean => {
    return event.key === KEYBOARD_SHORTCUTS.ESCAPE;
};

/**
 * Check if user pressed enter key
 */
export const isEnterKey = (event: KeyboardEvent): boolean => {
    return event.key === KEYBOARD_SHORTCUTS.ENTER;
};
