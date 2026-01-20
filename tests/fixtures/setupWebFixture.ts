import { vi } from 'vitest';
import { createFnMock, type BridgeFnMock } from './createFnMock';
import { type WebBridge } from '../../src/webBridge';

type WebBridgeStub = {
  execute: BridgeFnMock<WebBridge['execute']>;
  origin: string;
};

export const setupWebFixture = async () => {
  const executeMock = createFnMock();

  vi.doMock('../../src/webBridge', () => ({
    createWebBridge: vi.fn(() => ({
      origin: 'test.domain',
      execute: executeMock,
    })),
  }));

  const { createWebBridge } = await import('../../src/webBridge');

  const originalTop = window.top;

  Object.defineProperty(window, 'top', {
    value: {} as Window,
    configurable: true,
  });

  const webBridge = createWebBridge();

  return {
    stub: webBridge as WebBridgeStub,
    cleanup: () => {
      vi.doUnmock('../../src/webBridge');

      Object.defineProperty(window, 'top', {
        value: originalTop,
        configurable: true,
      });

    },
  };
};
