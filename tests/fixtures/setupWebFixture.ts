import { createFnMock } from './createFnMock';

export const setupWebFixture = async () => {
  const originalTop = window.top;

  const originalSearch = window.location.search;

  const windowStub = {
    postMessage: createFnMock<typeof window.postMessage>(),
  };

  Object.defineProperty(window, 'location', {
    value: { search: '?__aitu-domain=test.domain' },
    configurable: true,
  });

  Object.defineProperty(window, 'top', {
    value: windowStub,
    configurable: true,
  });

  return {
    stub: windowStub,
    cleanup: () => {
      Object.defineProperty(window, 'location', {
        value: { search: originalSearch },
        configurable: true,
      });

      Object.defineProperty(window, 'top', {
        value: originalTop,
        configurable: true,
      });
    },
  };
};
