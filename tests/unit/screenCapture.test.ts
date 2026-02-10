import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { setupAndroidFixture } from '../fixtures/setupAndroidFixture';
import { setupIosFixture } from '../fixtures/setupIosBridgeFixture';
import { setupWebFixture } from '../fixtures/setupWebFixture';
import type { AituBridge } from '../../src/types';

const enableScreenCaptureEvent = { reqId: `enableScreenCapture:1`, data: 'some-data', error: null } as const;

const disableScreenCaptureEvent = { reqId: `disableScreenCapture:1`, data: 'success', error: null } as const;

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

  it('should call enableScreenCapture method', async () => {
    androidBridge.enableScreenCapture.mockResponseOnce(enableScreenCaptureEvent, { delay: 250 });

    const result = aituBridge.enableScreenCapture();

    vi.advanceTimersByTime(250);

    expect(androidBridge.enableScreenCapture).toHaveBeenCalledWith('enableScreenCapture:1');

    await expect(result).resolves.toStrictEqual(enableScreenCaptureEvent.data);
  });

  it('should call disableScreenCapture method', async () => {
    androidBridge.disableScreenCapture.mockResponseOnce(disableScreenCaptureEvent, { delay: 250 });

    const result = aituBridge.disableScreenCapture();

    vi.advanceTimersByTime(250);

    expect(androidBridge.disableScreenCapture).toHaveBeenCalledWith('disableScreenCapture:1');

    await expect(result).resolves.toStrictEqual(disableScreenCaptureEvent.data);
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

  it('should post enableScreenCapture message', async () => {
    iosBridge.enableScreenCapture.postMessage.mockResponseOnce(enableScreenCaptureEvent, { delay: 250 });

    const result = aituBridge.enableScreenCapture();

    vi.advanceTimersByTime(250);

    expect(iosBridge.enableScreenCapture.postMessage).toHaveBeenCalledWith({ reqId: 'enableScreenCapture:1' });

    await expect(result).resolves.toStrictEqual(enableScreenCaptureEvent.data);
  });

  it('should post disableScreenCapture message', async () => {
    iosBridge.disableScreenCapture.postMessage.mockResponseOnce(disableScreenCaptureEvent, { delay: 250 });

    const result = aituBridge.disableScreenCapture();

    vi.advanceTimersByTime(250);

    expect(iosBridge.disableScreenCapture.postMessage).toHaveBeenCalledWith({ reqId: 'disableScreenCapture:1' });

    await expect(result).resolves.toStrictEqual(disableScreenCaptureEvent.data);
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

  it('should post enableScreenCapture message', async () => {
    webBridge.postMessage.mockResponseOnce(enableScreenCaptureEvent, { delay: 250 });

    const result = aituBridge.enableScreenCapture();

    vi.advanceTimersByTime(250);

    expect(webBridge.postMessage).toHaveBeenCalledWith(
      {
        reqId: `enableScreenCapture:1`,
        method: 'enableScreenCapture',
        source: 'aitu-bridge',
        payload: [],
      },
      'test.domain',
    );

    await expect(result).resolves.toStrictEqual(enableScreenCaptureEvent.data);
  });

  it('should post disableScreenCapture message', async () => {
    webBridge.postMessage.mockResponseOnce(disableScreenCaptureEvent, { delay: 250 });

    const result = aituBridge.disableScreenCapture();

    vi.advanceTimersByTime(250);

    expect(webBridge.postMessage).toHaveBeenCalledWith(
      {
        reqId: `disableScreenCapture:1`,
        method: 'disableScreenCapture',
        source: 'aitu-bridge',
        payload: [],
      },
      'test.domain',
    );

    await expect(result).resolves.toStrictEqual(disableScreenCaptureEvent.data);
  });
});

describe('Unsupported environment', () => {
  it('should log an error message to the console when enableScreenCapture is called', async () => {
    const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

    const aituBridge = await import('../../src/buildBridge').then((mod) => mod.buildBridge());

    const result = aituBridge.enableScreenCapture();

    await expect(result).toBeInstanceOf(Promise);

    expect(consoleLogSpy).toHaveBeenCalledWith(`--enableScreenCapture-isUnknown`);

    consoleLogSpy.mockRestore();
  });

  it('should log an error message to the console when disableScreenCapture is called', async () => {
    const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

    const aituBridge = await import('../../src/buildBridge').then((mod) => mod.buildBridge());

    const result = aituBridge.disableScreenCapture();

    await expect(result).toBeInstanceOf(Promise);

    expect(consoleLogSpy).toHaveBeenCalledWith(`--disableScreenCapture-isUnknown`);
    consoleLogSpy.mockRestore();
  });
});
