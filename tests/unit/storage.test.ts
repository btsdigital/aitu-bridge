import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { setupAndroidFixture } from '../fixtures/setupAndroidFixture';
import { setupIosFixture } from '../fixtures/setupIosBridgeFixture';
import { setupWebFixture } from '../fixtures/setupWebFixture';
import type { AituBridge } from '../../src/types';

const getItemEvent = { reqId: `storage:1`, data: 'some-data', error: null } as const;

const setItemEvent = { reqId: `storage:1`, data: 'success', error: null } as const;

const clearEvent = { reqId: `storage:1`, data: 'success', error: null } as const;


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

  it('should get item from storage', async () => {
    androidBridge.storage.mockResponseOnce(getItemEvent, { delay: 250 });

    const resultA = aituBridge.storage.getItem('testKey');

    vi.advanceTimersByTime(250);

    expect(androidBridge.storage).toHaveBeenNthCalledWith(1, 'storage:1', 'getItem', JSON.stringify({ keyName: 'testKey' }));

    await expect(resultA).resolves.toStrictEqual('some-data');
  });

  it('should set item to storage', async () => {
    androidBridge.storage.mockResponseOnce(setItemEvent, { delay: 250 });

    const result = aituBridge.storage.setItem('key1', 'value1');

    vi.advanceTimersByTime(250);

    expect(androidBridge.storage).toHaveBeenNthCalledWith(
      1,
      'storage:1',
      'setItem',
      JSON.stringify({ keyName: 'key1', keyValue: 'value1' }),
    );

    await expect(result).resolves.toStrictEqual('success');
  });

  it('should clear storage', async () => {
    androidBridge.storage.mockResponseOnce(clearEvent, { delay: 250 });

    const result = aituBridge.storage.clear();

    vi.advanceTimersByTime(250);

    expect(androidBridge.storage).toHaveBeenCalledWith('storage:1', 'clear', JSON.stringify({}));

    await expect(result).resolves.toStrictEqual('success');
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

  it('should get item from storage', async () => {
    iosBridge.storage.postMessage.mockResponseOnce(getItemEvent, { delay: 250 });

    const result = aituBridge.storage.getItem('testKey');

    vi.advanceTimersByTime(250);

    expect(iosBridge.storage.postMessage).toHaveBeenNthCalledWith(1, {
      reqId: 'storage:1',
      method: 'getItem',
      data: { keyName: 'testKey' },
    });

    await expect(result).resolves.toStrictEqual('some-data');
  });

  it('should set item to storage', async () => {
    iosBridge.storage.postMessage.mockResponseOnce(setItemEvent, { delay: 250 });

    const result = aituBridge.storage.setItem('key1', 'value1');

    vi.advanceTimersByTime(250);

    expect(iosBridge.storage.postMessage).toHaveBeenNthCalledWith(1, {
      method: 'setItem',
      reqId: `storage:1`,
      data: { keyName: 'key1', keyValue: 'value1' },
    });

    await expect(result).resolves.toStrictEqual('success');
  });

  it('should clear storage', async () => {
    iosBridge.storage.postMessage.mockResponseOnce(clearEvent, { delay: 250 });

    const result = aituBridge.storage.clear();

    vi.advanceTimersByTime(250);

    expect(iosBridge.storage.postMessage).toHaveBeenCalledWith({ method: 'clear', reqId: `storage:1`, data: {} });
    await expect(result).resolves.toStrictEqual('success');
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

  it('should get item from storage', async () => {
    webBridge.postMessage.mockResponseOnce(getItemEvent, { delay: 250 });

    const result = aituBridge.storage.getItem('testKey');

    vi.advanceTimersByTime(250);

    expect(webBridge.postMessage).toHaveBeenNthCalledWith(
      1,
      { source: 'aitu-bridge', reqId: 'storage:1', method: 'storage', payload: ['getItem', { keyName: 'testKey' }] },
      'test.domain',
    );

    await expect(result).resolves.toStrictEqual('some-data');
  });

  it('should set item to storage', async () => {
    webBridge.postMessage.mockResponseOnce(setItemEvent, { delay: 250 });

    const resultA = aituBridge.storage.setItem('key1', 'value1');

    vi.advanceTimersByTime(250);

    expect(webBridge.postMessage).toHaveBeenNthCalledWith(
      1,
      { source: 'aitu-bridge', reqId: 'storage:1', method: 'storage', payload: ['setItem', { keyName: 'key1', keyValue: 'value1' }] },
      'test.domain',
    );

    await expect(resultA).resolves.toStrictEqual('success');
  });

  it('should clear storage', async () => {
    webBridge.postMessage.mockResponseOnce(clearEvent, { delay: 250 });

    const result = aituBridge.storage.clear();

    vi.advanceTimersByTime(250);

    expect(webBridge.postMessage).toHaveBeenCalledWith(
      { source: 'aitu-bridge', reqId: 'storage:1', method: 'storage', payload: ['clear', {}] },
      'test.domain',
    );
    await expect(result).resolves.toStrictEqual('success');

    vi.advanceTimersByTime(250);
  });
});

describe('Unsupported environment', () => {
  it('should log unsupported environment message for simple methods', async () => {
    const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

    const aituBridge = await import('../../src/buildBridge').then((mod) => mod.buildBridge());

    aituBridge.storage.getItem('testKey');
    aituBridge.storage.setItem('key', 'value');
    aituBridge.storage.clear();
    expect(consoleLogSpy).toHaveBeenNthCalledWith(1, `--storage-isUnknown`);
    expect(consoleLogSpy).toHaveBeenNthCalledWith(2, `--storage-isUnknown`);
    expect(consoleLogSpy).toHaveBeenNthCalledWith(3, `--storage-isUnknown`);

    consoleLogSpy.mockRestore();
  });
});
