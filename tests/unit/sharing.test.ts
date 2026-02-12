import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { setupAndroidFixture } from '../fixtures/setupAndroidFixture';
import { setupIosFixture } from '../fixtures/setupIosBridgeFixture';
import { setupWebFixture } from '../fixtures/setupWebFixture';
import type { AituBridge } from '../../src/types';

const shareFileEvent = { reqId: `shareFile:1`, data: 'success', error: null } as const;

const shareEvent = { reqId: `share:1`, data: 'success', error: null } as const;

const pngBase64Data =
  'iVBORw0KGgoAAAANSUhEUgAAAAgAAAAICAYAAADED76LAAAAVUlEQVR4AWSOCQ4AIQjEqP//8y7FICYaOVJGxvXliYjM75WvTE4tAVQ1AcVLIOiAEclKAAPTSH5iwV4luYfd+0lnxx9mm4OysOkX9gZsYVncoIVdfwAAAP//SBT8gAAAAAZJREFUAwD9+jf3yeOUmQAAAABJRU5ErkJggg==';

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

  it('should share text', async () => {
    androidBridge.share.mockResponseOnce(shareEvent, { delay: 250 });

    const result = aituBridge.share('some text');

    vi.advanceTimersByTime(250);

    expect(androidBridge.share).toHaveBeenCalledWith('share:1', 'some text');

    await expect(result).resolves.toStrictEqual(shareEvent.data);
  });

  it('should share file', async () => {
    const payload = ['some text', 'text.txt', 'U29tZSB0ZXh0IGluIGZpbGUK'] as const;

    androidBridge.shareFile.mockResponseOnce(shareFileEvent, { delay: 250 });

    const result = aituBridge.shareFile(...payload);

    vi.advanceTimersByTime(250);

    expect(androidBridge.shareFile).toHaveBeenCalledWith('shareFile:1', ...payload);

    await expect(result).resolves.toStrictEqual(shareFileEvent.data);
  });

  it('should share image', async () => {
    const payload = ['some text', `data:image/png;base64,${pngBase64Data}`] as const;
    androidBridge.shareFile.mockResponseOnce(shareFileEvent, { delay: 250 });

    const result = aituBridge.shareImage(...payload);

    vi.advanceTimersByTime(250);

    expect(androidBridge.shareFile).toHaveBeenCalledWith('shareFile:1', payload[0], 'image.png', pngBase64Data);

    await expect(result).resolves.toStrictEqual(shareFileEvent.data);
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

  it('should share text', async () => {
    iosBridge.share.postMessage.mockResponseOnce(shareEvent, { delay: 250 });

    const result = aituBridge.share('some text');

    vi.advanceTimersByTime(250);

    expect(iosBridge.share.postMessage).toHaveBeenCalledWith({
      reqId: 'share:1',
      text: 'some text',
    });

    await expect(result).resolves.toStrictEqual(shareEvent.data);
  });

  it('should share file', async () => {
    const payload = ['some text', 'text.txt', 'U29tZSB0ZXh0IGluIGZpbGUK'] as const;

    iosBridge.shareFile.postMessage.mockResponseOnce(shareFileEvent, { delay: 250 });

    const result = aituBridge.shareFile(...payload);

    vi.advanceTimersByTime(250);

    expect(iosBridge.shareFile.postMessage).toHaveBeenCalledWith({
      reqId: 'shareFile:1',
      text: payload[0],
      filename: payload[1],
      base64Data: payload[2],
    });

    await expect(result).resolves.toStrictEqual(shareFileEvent.data);
  });

  it('should share image', async () => {
    const payload = ['some text', `data:image/png;base64,${pngBase64Data}`] as const;
    iosBridge.shareFile.postMessage.mockResponseOnce(shareFileEvent, { delay: 250 });

    const result = aituBridge.shareImage(...payload);

    vi.advanceTimersByTime(250);

    expect(iosBridge.shareFile.postMessage).toHaveBeenCalledWith({
      reqId: 'shareFile:1',
      text: payload[0],
      filename: 'image.png',
      base64Data: pngBase64Data,
    });

    await expect(result).resolves.toStrictEqual(shareFileEvent.data);
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

  it('should share text', async () => {
    webBridge.postMessage.mockResponseOnce(shareEvent, { delay: 250 });

    const result = aituBridge.share('some text');

    vi.advanceTimersByTime(250);

    expect(webBridge.postMessage).toHaveBeenCalledWith(
      { source: 'aitu-bridge', reqId: 'share:1', method: 'share', payload: ['some text'] },
      'test.domain',
    );

    await expect(result).resolves.toStrictEqual(shareEvent.data);
  });

  it('should share file', async () => {
    const payload = ['some text', 'text.txt', 'U29tZSB0ZXh0IGluIGZpbGUK'] as const;

    webBridge.postMessage.mockResponseOnce(shareFileEvent, { delay: 250 });

    const result = aituBridge.shareFile(...payload);

    vi.advanceTimersByTime(250);

    expect(webBridge.postMessage).toHaveBeenCalledWith(
      { source: 'aitu-bridge', reqId: 'shareFile:1', method: 'shareFile', payload: [...payload] },
      'test.domain',
    );

    await expect(result).resolves.toStrictEqual(shareFileEvent.data);
  });

  it('should shareImage', async () => {
    const payload = ['some text', `data:image/png;base64,${pngBase64Data}`] as const;

    webBridge.postMessage.mockResponseOnce(shareFileEvent, { delay: 250 });

    const result = aituBridge.shareImage(...payload);

    vi.advanceTimersByTime(250);

    expect(webBridge.postMessage).toHaveBeenCalledWith(
      {
        source: 'aitu-bridge',
        reqId: 'shareFile:1',
        method: 'shareFile',
        payload: ['some text', 'image.png', pngBase64Data],
      },
      'test.domain',
    );

    await expect(result).resolves.toStrictEqual(shareFileEvent.data);
  });
});

describe('Unsupported environment', () => {
  it('should log an error message to the console when share is called', async () => {
    const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

    const aituBridge = await import('../../src/buildBridge').then((mod) => mod.buildBridge());

    const result = aituBridge.share('some text');

    await expect(result).toBeInstanceOf(Promise);

    expect(consoleLogSpy).toHaveBeenCalledWith(`--share-isUnknown`);
    consoleLogSpy.mockRestore();
  });

  it('should log an error message to the console when shareFile is called', async () => {
    const payload = ['some text', 'text.txt', 'U29tZSB0ZXh0IGluIGZpbGUK'] as const;
    const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

    const aituBridge = await import('../../src/buildBridge').then((mod) => mod.buildBridge());

    const result = aituBridge.shareFile(...payload);

    await expect(result).toBeInstanceOf(Promise);

    expect(consoleLogSpy).toHaveBeenCalledWith(`--shareFile-isUnknown`);

    consoleLogSpy.mockRestore();
  });

  it('should log an error message to the console when shareImage is called', async () => {
    const base64Data =
      'PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz4KPCEtLSBTVkcgRmlsZSBpY29uIGJ5IEFydGh1ciBTaGxhaW4gZnJvbSBVc2VmdWxpY29ucy5jb20gLS0+CjxzdmcgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayIgeG1sOnNwYWNlPSJwcmVzZXJ2ZSIgdmVyc2lvbj0iMS4xIiB4PSIwcHgiIHk9IjBweCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIHdpZHRoPSI0MDBweCIgaGVpZ2h0PSI0MDBweCI+PHBhdGggZD0iTTEwLDEwTDEwLDQwTDIwLDQwTDIwLDIwTDYwLDIwTDYwLDQwTDkwLDQwTDYwLDEwTDEwLDEwWiIgc3Ryb2tlPSJub25lIj48L3BhdGg+PHBhdGggZD0iTTEwLDcwTDIwLDcwTDIwLDYwTDMwLDYwTDMwLDUwTDEwLDUwTDEwLDcwWiIgc3Ryb2tlPSJub25lIj48L3BhdGg+PHBhdGggZD0iTTEwLDgwTDEwLDkwTDMwLDkwTDMwLDcwTDIwLDcwTDIwLDgwTDEwLDgwWiIgc3Ryb2tlPSJub25lIj48L3BhdGg+PHBhdGggZD0iTTQwLDkwTDUwLDkwTDYwLDcwTDYwLDUwTDQwLDUwTDQwLDkwWiIgc3Ryb2tlPSJub25lIj48L3BhdGg+PHBhdGggZD0iTTcwLDkwTDkwLDkwTDkwLDcwTDgwLDcwTDgwLDYwTDkwLDYwTDkwLDUwTDcwLDUwTDcwLDkwWiIgc3Ryb2tlPSJub25lIj48L3BhdGg+PC9zdmc+';
    const payload = ['some text', `data:image/svg+xml;base64,${base64Data}`] as const;
    const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

    const aituBridge = await import('../../src/buildBridge').then((mod) => mod.buildBridge());

    const result = aituBridge.shareImage(...payload);

    await expect(result).toBeInstanceOf(Promise);

    expect(consoleLogSpy).toHaveBeenCalledWith(`--shareFile-isUnknown`);
    consoleLogSpy.mockRestore();
  });
});
