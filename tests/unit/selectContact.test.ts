import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { setupAndroidFixture } from '../fixtures/setupAndroidFixture';
import { setupIosFixture } from '../fixtures/setupIosBridgeFixture';
import { setupWebFixture } from '../fixtures/setupWebFixture';
import type { AituBridge, SelectContactResponse } from '../../src/types';

const selectContactEvent = { 
  reqId: `selectContact:1`, 
  data: { phone: '+1234567890', name: 'John', lastname: 'Doe' } satisfies SelectContactResponse, 
  error: null 
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

  it('should select contact', async () => {
    androidBridge.selectContact.mockResponseOnce(selectContactEvent, { delay: 250 });

    const result = aituBridge.selectContact();

    vi.advanceTimersByTime(250);

    expect(androidBridge.selectContact).toHaveBeenCalledWith('selectContact:1');

    await expect(result).resolves.toStrictEqual(selectContactEvent.data);
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

  it('should post selectContact message', async () => {
    iosBridge.selectContact.postMessage.mockResponseOnce(selectContactEvent, { delay: 250 });

    const result = aituBridge.selectContact();

    vi.advanceTimersByTime(250);

    expect(iosBridge.selectContact.postMessage).toHaveBeenCalledWith({ reqId: 'selectContact:1' });

    await expect(result).resolves.toStrictEqual(selectContactEvent.data);
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

  it('should post selectContact message', async () => {
    webBridge.postMessage.mockResponseOnce(selectContactEvent, { delay: 250 });

    const result = aituBridge.selectContact();

    vi.advanceTimersByTime(250);

    expect(webBridge.postMessage).toHaveBeenCalledWith(
      {
        source: 'aitu-bridge',
        reqId: 'selectContact:1',
        method: 'selectContact',
        payload: [],
      },
      'test.domain',
    );

    await expect(result).resolves.toStrictEqual(selectContactEvent.data);
  });
});

describe('Unsupported environment', () => {
  it('should log an error message to the console when selectContact is called', async () => {
    const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

    const aituBridge = await import('../../src/buildBridge').then((mod) => mod.buildBridge());

    const result = aituBridge.selectContact();

    await expect(result).toBeInstanceOf(Promise);

    expect(consoleLogSpy).toHaveBeenCalledWith(`--selectContact-isUnknown`);

    consoleLogSpy.mockRestore();
  });
});
