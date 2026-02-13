import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { setupAndroidFixture } from '../fixtures/setupAndroidFixture';
import { setupIosFixture } from '../fixtures/setupIosBridgeFixture';
import { setupWebFixture } from '../fixtures/setupWebFixture';
import type { AituBridge } from '../../src/types';

const vibrateEvent = { reqId: `vibrate:1`, data: 'success', error: null } as const;

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

  it('should vibrate with valid pattern', async () => {
    androidBridge.vibrate.mockResponseOnce(vibrateEvent, { delay: 250 });

    const pattern = [100, 200, 100];
    const result = aituBridge.vibrate(pattern);

    vi.advanceTimersByTime(250);

    expect(androidBridge.vibrate).toHaveBeenCalledWith('vibrate:1', JSON.stringify(pattern));

    await expect(result).resolves.toStrictEqual(vibrateEvent.data);
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

  it('should post vibrate message', async () => {
    iosBridge.vibrate.postMessage.mockResponseOnce(vibrateEvent, { delay: 250 });

    const pattern = [100, 200, 100];
    const result = aituBridge.vibrate(pattern);

    vi.advanceTimersByTime(250);

    expect(iosBridge.vibrate.postMessage).toHaveBeenCalledWith({ reqId: 'vibrate:1', pattern });

    await expect(result).resolves.toStrictEqual(vibrateEvent.data);
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

  it('should post vibrate message', async () => {
    webBridge.postMessage.mockResponseOnce(vibrateEvent, { delay: 250 });

    const pattern = [100, 200, 100];
    const result = aituBridge.vibrate(pattern);

    vi.advanceTimersByTime(250);

    expect(webBridge.postMessage).toHaveBeenCalledWith(
      {
        source: 'aitu-bridge',
        reqId: 'vibrate:1',
        method: 'vibrate',
        payload: [pattern],
      },
      'test.domain',
    );

    await expect(result).resolves.toStrictEqual(vibrateEvent.data);
  });
});

describe('Unsupported environment', () => {
  it('should log an error message to the console when vibrate is called', async () => {
    const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

    const aituBridge = await import('../../src/buildBridge').then((mod) => mod.buildBridge());

    const result = aituBridge.vibrate([100, 200]);

    await expect(result).toBeInstanceOf(Promise);

    expect(consoleLogSpy).toHaveBeenCalledWith(`--vibrate-isUnknown`);

    consoleLogSpy.mockRestore();
  });
});
