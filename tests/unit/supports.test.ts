import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { setupAndroidFixture } from '../fixtures/setupAndroidFixture';
import { setupIosFixture } from '../fixtures/setupIosBridgeFixture';
import { setupWebFixture } from '../fixtures/setupWebFixture';
import type { AituBridge, HandlerMethods, RequestMethods } from '../../src/types';

const supportedMethods: (RequestMethods | HandlerMethods)[] = [
  'activateESim',
  'checkBiometry',
  'closeApplication',
  'copyToClipboard',
  'disableScreenCapture',
  'disableSwipeBack',
  'enableScreenCapture',
  'enableSwipeBack',
  'getCustomBackArrowMode',
  'getGeo',
  'getNavigationItemMode',
  'getQr',
  'getSMSCode',
  'getUserStepInfo',
  'invoke',
  'isESimSupported',
  'openExternalUrl',
  'openPayment',
  'openSettings',
  'openUserProfile',
  'readNFCData',
  'readNFCPassport',
  'selectContact',
  'setCustomBackArrowMode',
  'setCustomBackArrowOnClickHandler',
  'setCustomBackArrowVisible',
  'setHeaderMenuItemClickHandler',
  'setHeaderMenuItems',
  'setNavigationItemMode',
  'setShakeHandler',
  'setTabActiveHandler',
  'setTitle',
  'share',
  'shareFile',
  'storage',
  'subscribeUserStepInfo',
  'unsubscribeUserStepInfo',
  'vibrate',
];

describe('Android Bridge', () => {
  let cleanup: ReturnType<typeof setupAndroidFixture>['cleanup'];

  let aituBridge: AituBridge;

  beforeAll(() => {
    const fixture = setupAndroidFixture();

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

  it.each(supportedMethods)('should return true for %s method', (methodName) => {
    const result = aituBridge.supports(methodName);

    expect(result).toStrictEqual(true);
  });

  it('should return false for unsupported method', () => {
    const result = aituBridge.supports('someUnsupportedMethod');

    expect(result).toStrictEqual(false);
  });
});

describe('iOS Bridge', () => {
  let cleanup: ReturnType<typeof setupIosFixture>['cleanup'];

  let aituBridge: AituBridge;

  beforeAll(() => {
    const fixture = setupIosFixture();

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

  it.each(supportedMethods)('should return true for %s method', (methodName) => {
    const result = aituBridge.supports(methodName);

    expect(result).toStrictEqual(true);
  });

  it('should return false for unsupported method', () => {
    const result = aituBridge.supports('someUnsupportedMethod');

    expect(result).toStrictEqual(false);
  });
});

describe('Web Bridge', () => {
  let cleanup: Awaited<ReturnType<typeof setupWebFixture>>['cleanup'];

  let aituBridge: AituBridge;

  beforeAll(async () => {
    const fixture = await setupWebFixture();

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

  // TODO: realize supports for web bridge
  it.each(supportedMethods)('should return false for %s method', (methodName) => {
    const result = aituBridge.supports(methodName);

    expect(result).toStrictEqual(false);
  });

  it('should return false for unsupported method', () => {
    const result = aituBridge.supports('someUnsupportedMethod');

    expect(result).toStrictEqual(false);
  });
});

describe('Unsupported environment', () => {
  it.each(supportedMethods)('should return true for %s method', async (methodName) => {
    const aituBridge = await import('../../src/buildBridge').then((mod) => mod.buildBridge());
    const result = aituBridge.supports(methodName);

    expect(result).toStrictEqual(false);
  });

  it('should return false for unsupported method', async () => {
    const aituBridge = await import('../../src/buildBridge').then((mod) => mod.buildBridge());

    const result = aituBridge.supports('someUnsupportedMethod');

    expect(result).toStrictEqual(false);
  });
});
