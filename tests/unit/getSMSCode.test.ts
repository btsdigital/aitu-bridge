import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { setupAndroidFixture } from '../fixtures/setupAndroidFixture';
import { setupIosFixture } from '../fixtures/setupIosBridgeFixture';
import { setupWebFixture } from '../fixtures/setupWebFixture';
import type { AituBridge } from '../../src/types';

const smsCodeEvent = { reqId: `getSMSCode:1`, data: '123456', error: null } as const;

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

  it('should get SMS code', async () => {
    androidBridge.getSMSCode.mockResponseOnce(smsCodeEvent, { delay: 250 });

    const result = aituBridge.getSMSCode();

    vi.advanceTimersByTime(250);

    expect(androidBridge.getSMSCode).toHaveBeenCalledWith('getSMSCode:1');

    await expect(result).resolves.toStrictEqual(smsCodeEvent.data);
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

  it('should post getSMSCode message', async () => {
    iosBridge.getSMSCode.postMessage.mockResponseOnce(smsCodeEvent, { delay: 250 });

    const result = aituBridge.getSMSCode();

    vi.advanceTimersByTime(250);

    expect(iosBridge.getSMSCode.postMessage).toHaveBeenCalledWith({ reqId: 'getSMSCode:1' });

    await expect(result).resolves.toStrictEqual(smsCodeEvent.data);
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

  it('should post getSMSCode message', async () => {
    webBridge.postMessage.mockResponseOnce(smsCodeEvent, { delay: 250 });

    const result = aituBridge.getSMSCode();

    vi.advanceTimersByTime(250);

    expect(webBridge.postMessage).toHaveBeenCalledWith(
      {
        source: 'aitu-bridge',
        reqId: 'getSMSCode:1',
        method: 'getSMSCode',
        payload: [],
      },
      'test.domain',
    );

    await expect(result).resolves.toStrictEqual(smsCodeEvent.data);
  });
});

describe('Unsupported environment', () => {
  it('should log an error message to the console when getSMSCode is called', async () => {
    const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

    const aituBridge = await import('../../src/buildBridge').then((mod) => mod.buildBridge());

    const result = aituBridge.getSMSCode();

    await expect(result).toBeInstanceOf(Promise);

    expect(consoleLogSpy).toHaveBeenCalledWith(`--getSMSCode-isUnknown`);

    consoleLogSpy.mockRestore();
  });
});
