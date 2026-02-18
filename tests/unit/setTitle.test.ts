import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { setupAndroidFixture } from '../fixtures/setupAndroidFixture';
import { setupIosFixture } from '../fixtures/setupIosBridgeFixture';
import { setupWebFixture } from '../fixtures/setupWebFixture';
import type { AituBridge } from '../../src/types';

const setTitleEvent = { reqId: `setTitle:1`, data: 'success', error: null } as const;

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

  it('should set title', async () => {
    androidBridge.setTitle.mockResponseOnce(setTitleEvent, { delay: 250 });

    const result = aituBridge.setTitle('New Title');

    vi.advanceTimersByTime(250);

    expect(androidBridge.setTitle).toHaveBeenCalledWith('setTitle:1', 'New Title');

    await expect(result).resolves.toStrictEqual(setTitleEvent.data);
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

  it('should post setTitle message', async () => {
    iosBridge.setTitle.postMessage.mockResponseOnce(setTitleEvent, { delay: 250 });

    const result = aituBridge.setTitle('New Title');

    vi.advanceTimersByTime(250);

    expect(iosBridge.setTitle.postMessage).toHaveBeenCalledWith({ reqId: 'setTitle:1', text: 'New Title' });

    await expect(result).resolves.toStrictEqual(setTitleEvent.data);
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

  it('should post setTitle message', async () => {
    webBridge.postMessage.mockResponseOnce(setTitleEvent, { delay: 250 });

    const result = aituBridge.setTitle('New Title');

    vi.advanceTimersByTime(250);

    expect(webBridge.postMessage).toHaveBeenCalledWith(
      {
        source: 'aitu-bridge',
        reqId: 'setTitle:1',
        method: 'setTitle',
        payload: ['New Title'],
      },
      'test.domain',
    );

    await expect(result).resolves.toStrictEqual(setTitleEvent.data);
  });
});

describe('Unsupported environment', () => {
  it('should log an error message to the console when setTitle is called', async () => {
    const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

    const aituBridge = await import('../../src/buildBridge').then((mod) => mod.buildBridge());

    const result = aituBridge.setTitle('New Title');

    await expect(result).toBeInstanceOf(Promise);

    expect(consoleLogSpy).toHaveBeenCalledWith(`--setTitle-isUnknown`);

    consoleLogSpy.mockRestore();
  });
});
