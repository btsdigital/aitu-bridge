import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { setupAndroidFixture } from '../fixtures/setupAndroidFixture';
import { setupIosFixture } from '../fixtures/setupIosBridgeFixture';
import { setupWebFixture } from '../fixtures/setupWebFixture';
import type { AituBridge } from '../../src/types';

const qrEvent = { reqId: `getQr:1`, data: 'https://example.com/qr', error: null } as const;

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

  it('should call getQr method', async () => {
    androidBridge.getQr.mockResponseOnce(qrEvent, { delay: 250 });

    const result = aituBridge.getQr();

    vi.advanceTimersByTime(250);

    expect(androidBridge.getQr).toHaveBeenCalledWith('getQr:1');

    await expect(result).resolves.toStrictEqual(qrEvent.data);
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

  it('should post getQr message', async () => {
    iosBridge.getQr.postMessage.mockResponseOnce(qrEvent, { delay: 250 });

    const result = aituBridge.getQr();

    vi.advanceTimersByTime(250);

    expect(iosBridge.getQr.postMessage).toHaveBeenCalledWith({ reqId: 'getQr:1' });

    await expect(result).resolves.toStrictEqual(qrEvent.data);
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

  it('should post getQr message', async () => {
    webBridge.postMessage.mockResponseOnce(qrEvent, { delay: 250 });

    const result = aituBridge.getQr();

    vi.advanceTimersByTime(250);

    expect(webBridge.postMessage).toHaveBeenCalledWith(
      {
        source: 'aitu-bridge',
        reqId: 'getQr:1',
        method: 'getQr',
        payload: [],
      },
      'test.domain',
    );

    await expect(result).resolves.toStrictEqual(qrEvent.data);
  });
});

describe('Unsupported environment', () => {
  it('should log an error message to the console when getQr is called', async () => {
    const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

    const aituBridge = await import('../../src/buildBridge').then((mod) => mod.buildBridge());

    const result = aituBridge.getQr();

    await expect(result).toBeInstanceOf(Promise);

    expect(consoleLogSpy).toHaveBeenCalledWith(`--getQr-isUnknown`);

    consoleLogSpy.mockRestore();
  });
});
