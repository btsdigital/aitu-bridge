import type { AituEvent } from '../../src/types';

export function createEvent(detail: AituEvent['detail']): AituEvent {
  return new CustomEvent('aituEvents', { detail });
}
