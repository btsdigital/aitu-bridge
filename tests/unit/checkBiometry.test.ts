import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { setupAndroidFixture } from '../fixtures/setupAndroidFixture';
import { setupIosFixture } from '../fixtures/setupIosBridgeFixture';
import { setupWebFixture } from '../fixtures/setupWebFixture';
import type { AituBridge } from '../../src/types';

const checkBiometryEvent = { reqId: `checkBiometry:1`, data: 'success', error: null } as const;

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

  it('should check biometry', async () => {
    androidBridge.checkBiometry.mockResponseOnce(checkBiometryEvent, { delay: 250 });

    const result = aituBridge.checkBiometry();

    vi.advanceTimersByTime(250);

    expect(androidBridge.checkBiometry).toHaveBeenCalledWith('checkBiometry:1');

    await expect(result).resolves.toStrictEqual(checkBiometryEvent.data);
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

  it('should post checkBiometry message', async () => {
    iosBridge.checkBiometry.postMessage.mockResponseOnce(checkBiometryEvent, { delay: 250 });

    const result = aituBridge.checkBiometry();

    vi.advanceTimersByTime(250);

    expect(iosBridge.checkBiometry.postMessage).toHaveBeenCalledWith({ reqId: 'checkBiometry:1' });

    await expect(result).resolves.toStrictEqual(checkBiometryEvent.data);
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

  it('should post checkBiometry message', async () => {
    webBridge.postMessage.mockResponseOnce(checkBiometryEvent, { delay: 250 });

    const result = aituBridge.checkBiometry();

    vi.advanceTimersByTime(250);

    expect(webBridge.postMessage).toHaveBeenCalledWith(
      {
        source: 'aitu-bridge',
        reqId: 'checkBiometry:1',
        method: 'checkBiometry',
        payload: [],
      },
      'test.domain',
    );

    await expect(result).resolves.toStrictEqual(checkBiometryEvent.data);
  });
});

describe('Unsupported environment', () => {
  it('should log an error message to the console when checkBiometry is called', async () => {
    const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

    const aituBridge = await import('../../src/buildBridge').then((mod) => mod.buildBridge());

    const result = aituBridge.checkBiometry();

    await expect(result).toBeInstanceOf(Promise);

    expect(consoleLogSpy).toHaveBeenCalledWith(`--checkBiometry-isUnknown`);

    consoleLogSpy.mockRestore();
  });
});
