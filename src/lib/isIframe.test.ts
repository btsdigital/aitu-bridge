import { describe, it, expect } from 'vitest';
import { isIframe } from './isIframe';

describe('isIframe', () => {
    it('should return false when window.self equals window.top', () => {
        expect(isIframe()).toBe(false);
    });

    it('should return true when window.self does not equal window.top', () => {
        const originalSelf = window.self;

        Object.defineProperty(window, 'self', {
            value: {},
            configurable: true,
        });

        expect(isIframe()).toBe(true);

        Object.defineProperty(window, 'self', {
            value: originalSelf,
            configurable: true,
        });
    });

    it('should return true when accessing window.top throws an error', () => {
        const originalTop = Object.getOwnPropertyDescriptor(window, 'top');

        Object.defineProperty(window, 'top', {
            get() {
                throw new Error('Cross-origin access');
            },
            configurable: true,
        });

        expect(isIframe()).toBe(true);

        if (originalTop) {
            Object.defineProperty(window, 'top', originalTop);
        }
    });

    it('should return false when running in Node.js environment', () => {
        const originalWindow = global.window;
        // @ts-ignore
        delete global.window;

        expect(isIframe()).toBe(false);

        global.window = originalWindow;
    });
});