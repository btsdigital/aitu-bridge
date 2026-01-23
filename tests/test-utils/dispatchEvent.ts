import type { AituEvent } from '../../src/types';

export function dispatchEvent(event: AituEvent, options?: { delayMs: number }): void {
  if (options?.delayMs && options.delayMs > 0) {
    setTimeout(() => window.dispatchEvent(event), options.delayMs);
  } else {
    window.dispatchEvent(event);
  }
}
