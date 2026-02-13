import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { setupAndroidFixture } from '../fixtures/setupAndroidFixture';
import { setupIosFixture } from '../fixtures/setupIosBridgeFixture';
import { setupWebFixture } from '../fixtures/setupWebFixture';
import type { AituBridge, UserStepInfoResponse } from '../../src/types';

const getUserStepInfoEvent = {
  reqId: `getUserStepInfo:1`,
  data: {
    steps: [
      { date: '01.01.2024', steps: 1000 },
      { date: '02.01.2024', steps: 2000 },
    ],
  } satisfies UserStepInfoResponse,
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

  it('should get user step info', async () => {
    androidBridge.getUserStepInfo.mockResponseOnce(getUserStepInfoEvent, { delay: 250 });

    const result = aituBridge.getUserStepInfo();

    vi.advanceTimersByTime(250);

    expect(androidBridge.getUserStepInfo).toHaveBeenCalledWith('getUserStepInfo:1');

    await expect(result).resolves.toStrictEqual(getUserStepInfoEvent.data);
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

  it('should post getUserStepInfo message', async () => {
    iosBridge.getUserStepInfo.postMessage.mockResponseOnce(getUserStepInfoEvent, { delay: 250 });

    const result = aituBridge.getUserStepInfo();

    vi.advanceTimersByTime(250);

    expect(iosBridge.getUserStepInfo.postMessage).toHaveBeenCalledWith({ reqId: 'getUserStepInfo:1' });

    await expect(result).resolves.toStrictEqual(getUserStepInfoEvent.data);
  });
});

describe('Web Bridge', () => {
  it('should log getUserStepInfo-isWeb message to the console', async () => {
    const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

    const fixture = await setupWebFixture();

    const aituBridge = await import('../../src/buildBridge').then((mod) => mod.buildBridge());

    const result = aituBridge.getUserStepInfo();

    await expect(result).toBeInstanceOf(Promise);

    expect(consoleLogSpy).toHaveBeenCalledWith(`--getUserStepInfo-isWeb`);

    consoleLogSpy.mockRestore();
    fixture.cleanup();
  });
});

describe('Unsupported environment', () => {
  it('should log an error message to the console when getUserStepInfo is called', async () => {
    const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

    const aituBridge = await import('../../src/buildBridge').then((mod) => mod.buildBridge());

    const result = aituBridge.getUserStepInfo();

    await expect(result).toBeInstanceOf(Promise);

    expect(consoleLogSpy).toHaveBeenCalledWith(`--getUserStepInfo-isUnknown`);

    consoleLogSpy.mockRestore();
  });
});
