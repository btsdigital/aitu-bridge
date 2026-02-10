import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { setupAndroidFixture } from '../fixtures/setupAndroidFixture';
import { setupIosFixture } from '../fixtures/setupIosBridgeFixture';
import { setupWebFixture } from '../fixtures/setupWebFixture';
import type { AituBridge } from '../../src/types';

const setModeEvent = { reqId: `setCustomBackArrowMode:1`, data: 'success', error: null } as const;

const getModeEvent = { reqId: `getCustomBackArrowMode:1`, data: true, error: null } as const;

const setVisibleEvent = { reqId: `setCustomBackArrowVisible:1`, data: 'success', error: null } as const;

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

  it('should call setCustomBackArrowMode', async () => {
    androidBridge.setCustomBackArrowMode.mockResponseOnce(setModeEvent, { delay: 250 });

    const result = aituBridge.setCustomBackArrowMode(true);

    vi.advanceTimersByTime(250);

    expect(androidBridge.setCustomBackArrowMode).toHaveBeenCalledWith('setCustomBackArrowMode:1', true);

    await expect(result).resolves.toStrictEqual(setModeEvent.data);
  });

  it('should call getCustomBackArrowMode', async () => {
    androidBridge.getCustomBackArrowMode.mockResponseOnce(getModeEvent, { delay: 250 });

    const result = aituBridge.getCustomBackArrowMode();

    vi.advanceTimersByTime(250);

    expect(androidBridge.getCustomBackArrowMode).toHaveBeenCalledWith('getCustomBackArrowMode:1');

    await expect(result).resolves.toStrictEqual(getModeEvent.data);
  });

  it('should call setCustomBackArrowVisible', async () => {
    androidBridge.setCustomBackArrowVisible.mockResponseOnce(setVisibleEvent, { delay: 250 });

    const result = aituBridge.setCustomBackArrowVisible(true);

    vi.advanceTimersByTime(250);

    expect(androidBridge.setCustomBackArrowVisible).toHaveBeenCalledWith('setCustomBackArrowVisible:1', true);

    await expect(result).resolves.toStrictEqual(setVisibleEvent.data);
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

  it('should post setCustomBackArrowMode message', async () => {
    iosBridge.setCustomBackArrowMode.postMessage.mockResponseOnce(setModeEvent, { delay: 250 });

    const result = aituBridge.setCustomBackArrowMode(true);

    vi.advanceTimersByTime(250);

    expect(iosBridge.setCustomBackArrowMode.postMessage).toHaveBeenCalledWith({ reqId: 'setCustomBackArrowMode:1', enabled: true });

    await expect(result).resolves.toStrictEqual(setModeEvent.data);
  });

  it('should post getCustomBackArrowMode message', async () => {
    iosBridge.getCustomBackArrowMode.postMessage.mockResponseOnce(getModeEvent, { delay: 250 });

    const result = aituBridge.getCustomBackArrowMode();

    vi.advanceTimersByTime(250);

    expect(iosBridge.getCustomBackArrowMode.postMessage).toHaveBeenCalledWith({ reqId: 'getCustomBackArrowMode:1' });

    await expect(result).resolves.toStrictEqual(getModeEvent.data);
  });

  it('should post setCustomBackArrowVisible message', async () => {
    iosBridge.setCustomBackArrowVisible.postMessage.mockResponseOnce(setVisibleEvent, { delay: 250 });

    const result = aituBridge.setCustomBackArrowVisible(true);

    vi.advanceTimersByTime(250);

    expect(iosBridge.setCustomBackArrowVisible.postMessage).toHaveBeenCalledWith({ reqId: 'setCustomBackArrowVisible:1', visible: true });

    await expect(result).resolves.toStrictEqual(setVisibleEvent.data);
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

  it('should post setCustomBackArrowMode message', async () => {
    webBridge.postMessage.mockResponseOnce(setModeEvent, { delay: 250 });

    const result = aituBridge.setCustomBackArrowMode(true);

    vi.advanceTimersByTime(250);

    expect(webBridge.postMessage).toHaveBeenCalledWith(
      { source: 'aitu-bridge', reqId: 'setCustomBackArrowMode:1', method: 'setCustomBackArrowMode', payload: [true] },
      'test.domain',
    );

    await expect(result).resolves.toStrictEqual(setModeEvent.data);
  });

  it('should post getCustomBackArrowMode message', async () => {
    webBridge.postMessage.mockResponseOnce(getModeEvent, { delay: 250 });

    const result = aituBridge.getCustomBackArrowMode();

    vi.advanceTimersByTime(250);

    expect(webBridge.postMessage).toHaveBeenCalledWith(
      { source: 'aitu-bridge', reqId: 'getCustomBackArrowMode:1', method: 'getCustomBackArrowMode', payload: [] },
      'test.domain',
    );

    await expect(result).resolves.toStrictEqual(getModeEvent.data);
  });

  it('should post setCustomBackArrowVisible message', async () => {
    webBridge.postMessage.mockResponseOnce(setVisibleEvent, { delay: 250 });

    const result = aituBridge.setCustomBackArrowVisible(true);

    vi.advanceTimersByTime(250);

    expect(webBridge.postMessage).toHaveBeenCalledWith(
      { source: 'aitu-bridge', reqId: 'setCustomBackArrowVisible:1', method: 'setCustomBackArrowVisible', payload: [true] },
      'test.domain',
    );

    await expect(result).resolves.toStrictEqual(setVisibleEvent.data);
  });
});

describe('Unsupported environment', () => {
  it('should log unsupported environment message for custom back arrow methods', async () => {
    const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

    const aituBridge = await import('../../src/buildBridge').then((mod) => mod.buildBridge());

    aituBridge.setCustomBackArrowMode(true);
    aituBridge.getCustomBackArrowMode();
    aituBridge.setCustomBackArrowVisible(true);

    expect(consoleLogSpy).toHaveBeenNthCalledWith(1, `--setCustomBackArrowMode-isUnknown`);
    expect(consoleLogSpy).toHaveBeenNthCalledWith(2, `--getCustomBackArrowMode-isUnknown`);
    expect(consoleLogSpy).toHaveBeenNthCalledWith(3, `--setCustomBackArrowVisible-isUnknown`);

    consoleLogSpy.mockRestore();
  });
});
