import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { setupAndroidFixture } from '../fixtures/setupAndroidFixture';
import { setupIosFixture } from '../fixtures/setupIosBridgeFixture';
import { setupWebFixture } from '../fixtures/setupWebFixture';
import type { AituBridge } from '../../src/types';
import { NavigationItemMode } from '../../src/types';

const setNavigationItemModeEvent = { reqId: `setNavigationItemMode:1`, data: 'success', error: null } as const;

const getNavigationItemModeEvent = {
  reqId: `getNavigationItemMode:1`,
  data: NavigationItemMode.SystemBackArrow,
  error: null,
} as const;

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

  it('should set navigation item mode', async () => {
    androidBridge.setNavigationItemMode.mockResponseOnce(setNavigationItemModeEvent, { delay: 250 });

    const result = aituBridge.setNavigationItemMode(NavigationItemMode.SystemBackArrow);

    vi.advanceTimersByTime(250);

    expect(androidBridge.setNavigationItemMode).toHaveBeenCalledWith(
      'setNavigationItemMode:1',
      NavigationItemMode.SystemBackArrow,
    );

    await expect(result).resolves.toBeUndefined();
  });

  it('should get navigation item mode', async () => {
    androidBridge.getNavigationItemMode.mockResponseOnce(getNavigationItemModeEvent, { delay: 250 });

    const result = aituBridge.getNavigationItemMode();

    vi.advanceTimersByTime(250);

    expect(androidBridge.getNavigationItemMode).toHaveBeenCalledWith('getNavigationItemMode:1');

    await expect(result).resolves.toStrictEqual(NavigationItemMode.SystemBackArrow);
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

  it('should post setNavigationItemMode message', async () => {
    iosBridge.setNavigationItemMode.postMessage.mockResponseOnce(setNavigationItemModeEvent, { delay: 250 });

    const result = aituBridge.setNavigationItemMode(NavigationItemMode.SystemBackArrow);

    vi.advanceTimersByTime(250);

    expect(iosBridge.setNavigationItemMode.postMessage).toHaveBeenCalledWith({
      reqId: 'setNavigationItemMode:1',
      mode: NavigationItemMode.SystemBackArrow,
    });

    await expect(result).resolves.toBeUndefined();
  });

  it('should post getNavigationItemMode message', async () => {
    iosBridge.getNavigationItemMode.postMessage.mockResponseOnce(getNavigationItemModeEvent, { delay: 250 });

    const result = aituBridge.getNavigationItemMode();

    vi.advanceTimersByTime(250);

    expect(iosBridge.getNavigationItemMode.postMessage).toHaveBeenNthCalledWith(1, { reqId: 'getNavigationItemMode:1' });

    await expect(result).resolves.toStrictEqual(NavigationItemMode.SystemBackArrow);
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

  it('should post setNavigationItemMode message', async () => {
    webBridge.postMessage.mockResponseOnce(setNavigationItemModeEvent, { delay: 250 });

    const result = aituBridge.setNavigationItemMode(NavigationItemMode.SystemBackArrow);

    vi.advanceTimersByTime(250);

    expect(webBridge.postMessage).toHaveBeenNthCalledWith(
      1,
      {
        source: 'aitu-bridge',
        reqId: 'setNavigationItemMode:1',
        method: 'setNavigationItemMode',
        payload: [NavigationItemMode.SystemBackArrow],
      },
      'test.domain',
    );

    await expect(result).resolves.toBeUndefined();
  });

  it('should post getNavigationItemMode message', async () => {
    webBridge.postMessage.mockResponseOnce(getNavigationItemModeEvent, { delay: 250 });

    const result = aituBridge.getNavigationItemMode();

    vi.advanceTimersByTime(250);

    expect(webBridge.postMessage).toHaveBeenNthCalledWith(
      1,
      {
        source: 'aitu-bridge',
        reqId: 'getNavigationItemMode:1',
        method: 'getNavigationItemMode',
        payload: [],
      },
      'test.domain',
    );

    await expect(result).resolves.toStrictEqual(NavigationItemMode.SystemBackArrow);
  });
});

describe('Unsupported environment', () => {
  it('should log unsupported environment message for setNavigationItemMode', async () => {
    const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

    const aituBridge = await import('../../src/buildBridge').then((mod) => mod.buildBridge());

    aituBridge.setNavigationItemMode(NavigationItemMode.SystemBackArrow);

    expect(consoleLogSpy).toHaveBeenNthCalledWith(1, `--setNavigationItemMode-isUnknown`);

    consoleLogSpy.mockRestore();
  });

  it('should log unsupported environment message for getNavigationItemMode', async () => {
    const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

    const aituBridge = await import('../../src/buildBridge').then((mod) => mod.buildBridge());

    aituBridge.getNavigationItemMode();

    expect(consoleLogSpy).toHaveBeenNthCalledWith(1, `--getNavigationItemMode-isUnknown`);

    consoleLogSpy.mockRestore();
  });
});
