import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { setupAndroidFixture } from '../fixtures/setupAndroidFixture';
import { setupIosFixture } from '../fixtures/setupIosBridgeFixture';
import type { AituBridge } from '../../src/types';

const openExternalUrlEvent = { reqId: `openExternalUrl:1`, data: 'success', error: null } as const;

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

  it('should open external url', async () => {
    androidBridge.openExternalUrl.mockResponseOnce(openExternalUrlEvent, { delay: 250 });

    const result = aituBridge.openExternalUrl('https://example.com');

    vi.advanceTimersByTime(250);

    expect(androidBridge.openExternalUrl).toHaveBeenCalledWith('openExternalUrl:1', 'https://example.com');

    await expect(result).resolves.toStrictEqual(openExternalUrlEvent.data);
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

  it('should post openExternalUrl message', async () => {
    iosBridge.openExternalUrl.postMessage.mockResponseOnce(openExternalUrlEvent, { delay: 250 });

    const result = aituBridge.openExternalUrl('https://example.com');

    vi.advanceTimersByTime(250);

    expect(iosBridge.openExternalUrl.postMessage).toHaveBeenCalledWith({ reqId: 'openExternalUrl:1', url: 'https://example.com' });

    await expect(result).resolves.toStrictEqual(openExternalUrlEvent.data);
  });
});

describe('Unsupported environment', () => {
  it('should log an error message to the console when openExternalUrl is called', async () => {
    const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

    const aituBridge = await import('../../src/buildBridge').then((mod) => mod.buildBridge());

    const result = aituBridge.openExternalUrl('https://example.com');

    await expect(result).toBeInstanceOf(Promise);

    expect(consoleLogSpy).toHaveBeenCalledWith(`--openExternalUrl-isUnknown`);

    consoleLogSpy.mockRestore();
  });
});
