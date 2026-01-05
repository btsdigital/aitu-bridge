import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { setupAndroidFixture } from '../fixtures/setupAndroidFixture';
import { setupIosFixture } from '../fixtures/setupIosBridgeFixture';
import type { AituBridge, PermissionDeniedError, AppUrlDoesntMatchError } from '../../src/types';

/**
 * Methods that don't accept params and resolve promise with ResponseType or rejects with error
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
  {
    reqId: `${methodName}:3`,
    data: null,
    error: {
      code: 'url_does_not_match',
      msg: 'some_error_msg',
    } satisfies AppUrlDoesntMatchError,
  } as const,
  { reqId: `${methodName}:4`, data: 'success', error: null } as const,
  { reqId: `${methodName}:5`, data: 'success', error: null } as const,
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
      const [eventA, eventB, eventC, eventD, eventE] = getTestData(methodName);

      androidBridge[methodName].mockResponseOnce(eventA, { delay: 250 });
      androidBridge[methodName].mockResponseOnce(eventB, { delay: 50 });
      androidBridge[methodName].mockResponseOnce(eventC, { delay: 500 });
      androidBridge[methodName].mockResponseOnce(eventD, { delay: 420 });
      androidBridge[methodName].mockResponseOnce(eventE, { delay: 123 });

      const resultA = aituBridge[methodName]();
      const resultB = aituBridge[methodName]();
      const resultC = aituBridge[methodName]();
      const resultD = aituBridge[methodName]();
      const resultE = aituBridge[methodName]();

      vi.advanceTimersByTime(500);

      expect(androidBridge[methodName]).toHaveBeenNthCalledWith(1, eventA.reqId);
      expect(androidBridge[methodName]).toHaveBeenNthCalledWith(2, eventB.reqId);
      expect(androidBridge[methodName]).toHaveBeenNthCalledWith(3, eventC.reqId);
      expect(androidBridge[methodName]).toHaveBeenNthCalledWith(4, eventD.reqId);
      expect(androidBridge[methodName]).toHaveBeenNthCalledWith(5, eventE.reqId);
      expect(androidBridge[methodName]).toHaveBeenCalledTimes(5);

      await expect(resultA).resolves.toStrictEqual(eventA.data);
      await expect(resultB).rejects.toStrictEqual(eventB.error);
      await expect(resultC).rejects.toStrictEqual(eventC.error);
      await expect(resultD).resolves.toStrictEqual(eventD.data);
      await expect(resultE).resolves.toStrictEqual(eventE.data);
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
      const [eventA, eventB, eventC, eventD, eventE] = getTestData(methodName);

      iosBridge[methodName].postMessage.mockResponseOnce(eventA, { delay: 250 });
      iosBridge[methodName].postMessage.mockResponseOnce(eventB, { delay: 50 });
      iosBridge[methodName].postMessage.mockResponseOnce(eventC, { delay: 500 });
      iosBridge[methodName].postMessage.mockResponseOnce(eventD, { delay: 420 });
      iosBridge[methodName].postMessage.mockResponseOnce(eventE, { delay: 123 });

      const resultA = aituBridge[methodName]();
      const resultB = aituBridge[methodName]();
      const resultC = aituBridge[methodName]();
      const resultD = aituBridge[methodName]();
      const resultE = aituBridge[methodName]();

      vi.advanceTimersByTime(500);

      expect(iosBridge[methodName].postMessage).toHaveBeenNthCalledWith(1, { reqId: eventA.reqId });
      expect(iosBridge[methodName].postMessage).toHaveBeenNthCalledWith(2, { reqId: eventB.reqId });
      expect(iosBridge[methodName].postMessage).toHaveBeenNthCalledWith(3, { reqId: eventC.reqId });
      expect(iosBridge[methodName].postMessage).toHaveBeenNthCalledWith(4, { reqId: eventD.reqId });
      expect(iosBridge[methodName].postMessage).toHaveBeenNthCalledWith(5, { reqId: eventE.reqId });
      expect(iosBridge[methodName].postMessage).toHaveBeenCalledTimes(5);

      await expect(resultA).resolves.toStrictEqual(eventA.data);
      await expect(resultB).rejects.toStrictEqual(eventB.error);
      await expect(resultC).rejects.toStrictEqual(eventC.error);
      await expect(resultD).resolves.toStrictEqual(eventD.data);
      await expect(resultE).resolves.toStrictEqual(eventE.data);
    });
  });
});
