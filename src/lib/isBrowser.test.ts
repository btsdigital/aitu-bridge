import { describe, it, expect } from 'vitest';
import { isBrowser } from './isBrowser';

describe('isBrowser', () => {
  it('should return true when window is defined', () => {
    expect(window).toBeDefined();
    expect(isBrowser()).toBe(true);
  });

  it('should return false when window is undefined', () => {
    const originalWindow = global.window;
    // @ts-ignore
    delete globalThis.window;

    expect(isBrowser()).toBe(false);

    global.window = originalWindow;
  });
});
