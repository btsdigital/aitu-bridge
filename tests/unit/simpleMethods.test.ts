import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { setupAndroidFixture } from '../fixtures/setupAndroidFixture';
import { setupIosFixture } from '../fixtures/setupIosBridgeFixture';
import { setupWebFixture } from '../fixtures/setupWebFixture';
import type { AituBridge, PermissionDeniedError } from '../../src/types';

/**
 * Methods that don't accept params and resolve promise with SuccessResponse or rejects with error
 */
const simpleMethods = [
  'openUserProfile',
  'openSettings',
  'closeApplication',
  'enableSwipeBack',
  'disableSwipeBack',
  'isESimSupported',
  'subscribeUserStepInfo',
  'unsubscribeUserStepInfo',
] as const;

const getTestData = (methodName: string) => [
  { reqId: `${methodName}:1`, data: 'success', error: null } as const,
  {
    reqId: `${methodName}:2`,
    data: null,
    error: {
      code: 'permission_denied',
      msg: 'permission deny',
      meta: {
        can_retry: true,
      },
    } satisfies PermissionDeniedError,
  } as const,
];

describe('Android Bridge', () => {
  let cleanup: ReturnType<typeof setupAndroidFixture>['cleanup'];

  let androidBridge: ReturnType<typeof setupAndroidFixture>['stub'];

  let aituBridge: AituBridge;

  beforeAll(() => {
    const fixture = setupAndroidFixture();

    androidBridge = fixture.stub;

    cleanup = fixture.cleanup;
  });

  beforeEach(async () => {
    vi.useFakeTimers();

    aituBridge = await import('../../src/buildBridge').then((mod) => mod.buildBridge());
  });

  afterEach(() => {
    vi.resetAllMocks();
    vi.resetModules();
    vi.useRealTimers();
  });

  afterAll(() => {
    cleanup();
  });

  describe.for(simpleMethods)('%s method', (methodName) => {
    it('should resolve and reject with correct data', async () => {
      const [eventA, eventB] = getTestData(methodName);

      androidBridge[methodName].mockResponseOnce(eventA, { delay: 250 });
      androidBridge[methodName].mockResponseOnce(eventB, { delay: 50 });

      const resultA = aituBridge[methodName]();
      const resultB = aituBridge[methodName]();

      vi.advanceTimersByTime(250);

      expect(androidBridge[methodName]).toHaveBeenNthCalledWith(1, eventA.reqId);
      expect(androidBridge[methodName]).toHaveBeenNthCalledWith(2, eventB.reqId);
      expect(androidBridge[methodName]).toHaveBeenCalledTimes(2);

      await expect(resultA).resolves.toStrictEqual(eventA.data);
      await expect(resultB).rejects.toStrictEqual(eventB.error);
    });
  });
});

describe('iOS Bridge', () => {
  let cleanup: ReturnType<typeof setupIosFixture>['cleanup'];

  let iosBridge: ReturnType<typeof setupIosFixture>['stub'];

  let aituBridge: AituBridge;

  beforeAll(() => {
    const fixture = setupIosFixture();

    iosBridge = fixture.stub;

    cleanup = fixture.cleanup;
  });

  beforeEach(async () => {
    aituBridge = await import('../../src/buildBridge').then((mod) => mod.buildBridge());

    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.resetAllMocks();
    vi.resetModules();
    vi.useRealTimers();
  });

  afterAll(() => {
    cleanup();
  });

  describe.for(simpleMethods)('%s method', (methodName) => {
    it('should resolve and reject with correct data', async () => {
      const [eventA, eventB] = getTestData(methodName);

      iosBridge[methodName].postMessage.mockResponseOnce(eventA, { delay: 250 });
      iosBridge[methodName].postMessage.mockResponseOnce(eventB, { delay: 50 });

      const resultA = aituBridge[methodName]();
      const resultB = aituBridge[methodName]();

      vi.advanceTimersByTime(250);

      expect(iosBridge[methodName].postMessage).toHaveBeenNthCalledWith(1, { reqId: eventA.reqId });
      expect(iosBridge[methodName].postMessage).toHaveBeenNthCalledWith(2, { reqId: eventB.reqId });
      expect(iosBridge[methodName].postMessage).toHaveBeenCalledTimes(2);

      await expect(resultA).resolves.toStrictEqual(eventA.data);
      await expect(resultB).rejects.toStrictEqual(eventB.error);
    });
  });
});

describe('Web Bridge', () => {
  let cleanup: Awaited<ReturnType<typeof setupWebFixture>>['cleanup'];

  let webBridge: Awaited<ReturnType<typeof setupWebFixture>>['stub'];

  let aituBridge: AituBridge;

  beforeAll(async () => {
    const fixture = await setupWebFixture();

    webBridge = fixture.stub;

    cleanup = fixture.cleanup;
  });

  beforeEach(async () => {
    aituBridge = await import('../../src/buildBridge').then((mod) => mod.buildBridge());

    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.resetAllMocks();
    vi.resetModules();
    vi.useRealTimers();
  });

  afterAll(() => {
    cleanup();
  });

  describe.for(simpleMethods)('%s method', (methodName) => {
    it('should resolve and reject with correct data', async () => {
      const [eventA, eventB] = getTestData(methodName);
      webBridge.postMessage.mockResponseOnce(eventA, { delay: 250 });
      webBridge.postMessage.mockResponseOnce(eventB, { delay: 50 });

      const resultA = aituBridge[methodName]();
      const resultB = aituBridge[methodName]();

      vi.advanceTimersByTime(250);

      expect(webBridge.postMessage).toHaveBeenNthCalledWith(
        1,
        {
          reqId: `${methodName}:1`,
          method: methodName,
          source: 'aitu-bridge',
          payload: [],
        },
        'test.domain',
      );
      expect(webBridge.postMessage).toHaveBeenNthCalledWith(
        2,
        {
          reqId: `${methodName}:2`,
          method: methodName,
          source: 'aitu-bridge',
          payload: [],
        },
        'test.domain',
      );
      expect(webBridge.postMessage).toHaveBeenCalledTimes(2);

      await expect(resultA).resolves.toStrictEqual(eventA.data);
      await expect(resultB).rejects.toStrictEqual(eventB.error);
    });
  });
});

describe('Unsupported environment', () => {
  it('should log unsupported environment message for simple methods', async () => {
    const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

    const aituBridge = await import('../../src/buildBridge').then((mod) => mod.buildBridge());

    for (const methodName of simpleMethods) {
      aituBridge[methodName]();
      expect(consoleLogSpy).toHaveBeenCalledWith(`--${methodName}-isUnknown`);
    }

    consoleLogSpy.mockRestore();
  });
});
