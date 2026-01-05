import { vi } from 'vitest';
import { Constructable, Procedure } from '@vitest/spy';
import { type AituEvent, type IosBridge, type RequestMethods } from '../../src/types';

export const createFnMock = <T extends Constructable | Procedure>() => {
  const fnMock = vi.fn<T>();

  return Object.assign(fnMock, {
    mockResponse: (response: AituEvent['detail'], options?: { delay: number }) => {
      fnMock.mockImplementation((() => {
        setTimeout(() => {
          window.dispatchEvent(new CustomEvent('aituEvents', { detail: response }));
        }, options?.delay ?? 0);
      }) as any);
    },
    mockResponseOnce: (response: AituEvent['detail'], options?: { delay: number }) => {
      fnMock.mockImplementationOnce((() => {
        setTimeout(() => {
          window.dispatchEvent(new CustomEvent('aituEvents', { detail: response }));
        }, options?.delay ?? 0);
      }) as any);
    },
  });
};

export type BridgeFnMock<T extends Constructable | Procedure> = ReturnType<typeof createFnMock<T>>;

export const createMessageHandlerMock = <T extends RequestMethods>() => ({
  postMessage: createFnMock<IosBridge[T]['postMessage']>(),
});
