import { vi } from 'vitest';
import { Constructable, Procedure } from '@vitest/spy';
import { type AituEvent, type IosBridge, type RequestMethods } from '../../src/types';
import { createEvent, dispatchEvent } from '../test-utils';

export const createFnMock = <T extends Constructable | Procedure>() => {
  const fnMock = vi.fn<T>();

  return Object.assign(fnMock, {
    mockResponse: (response: AituEvent['detail'], options?: { delay: number }) => {
      fnMock.mockImplementation((() => {
        dispatchEvent(createEvent(response), options?.delay ? { delayMs: options.delay } : undefined);
      }) as any);
    },
    mockResponseOnce: (response: AituEvent['detail'], options?: { delay: number }) => {
      fnMock.mockImplementationOnce((() => {
        dispatchEvent(createEvent(response), options?.delay ? { delayMs: options.delay } : undefined);
      }) as any);
    },
  });
};

export type BridgeFnMock<T extends Constructable | Procedure> = ReturnType<typeof createFnMock<T>>;

export const createMessageHandlerMock = <T extends RequestMethods>() => ({
  postMessage: createFnMock<IosBridge[T]['postMessage']>(),
});
