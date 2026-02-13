import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { setupAndroidFixture } from '../fixtures/setupAndroidFixture';
import { setupIosFixture } from '../fixtures/setupIosBridgeFixture';
import { setupWebFixture } from '../fixtures/setupWebFixture';
import type { AituBridge } from '../../src/types';

const copyToClipboardEvent = { reqId: `copyToClipboard:1`, data: 'success', error: null } as const;

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

  it('should copy text to clipboard', async () => {
    androidBridge.copyToClipboard.mockResponseOnce(copyToClipboardEvent, { delay: 250 });

    const result = aituBridge.copyToClipboard('Text to copy');

    vi.advanceTimersByTime(250);

    expect(androidBridge.copyToClipboard).toHaveBeenCalledWith('copyToClipboard:1', 'Text to copy');

    await expect(result).resolves.toStrictEqual(copyToClipboardEvent.data);
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

  it('should post copyToClipboard message', async () => {
    iosBridge.copyToClipboard.postMessage.mockResponseOnce(copyToClipboardEvent, { delay: 250 });

    const result = aituBridge.copyToClipboard('Text to copy');

    vi.advanceTimersByTime(250);

    expect(iosBridge.copyToClipboard.postMessage).toHaveBeenCalledWith({ reqId: 'copyToClipboard:1', text: 'Text to copy' });

    await expect(result).resolves.toStrictEqual(copyToClipboardEvent.data);
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

  it('should post copyToClipboard message', async () => {
    webBridge.postMessage.mockResponseOnce(copyToClipboardEvent, { delay: 250 });

    const result = aituBridge.copyToClipboard('Text to copy');

    vi.advanceTimersByTime(250);

    expect(webBridge.postMessage).toHaveBeenCalledWith(
      {
        source: 'aitu-bridge',
        reqId: 'copyToClipboard:1',
        method: 'copyToClipboard',
        payload: ['Text to copy'],
      },
      'test.domain',
    );

    await expect(result).resolves.toStrictEqual(copyToClipboardEvent.data);
  });
});

describe('Unsupported environment', () => {
  it('should log an error message to the console when copyToClipboard is called', async () => {
    const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

    const aituBridge = await import('../../src/buildBridge').then((mod) => mod.buildBridge());

    const result = aituBridge.copyToClipboard('Text to copy');

    await expect(result).toBeInstanceOf(Promise);

    expect(consoleLogSpy).toHaveBeenCalledWith(`--copyToClipboard-isUnknown`);

    consoleLogSpy.mockRestore();
  });
});
