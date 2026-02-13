import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { setupAndroidFixture } from '../fixtures/setupAndroidFixture';
import { setupIosFixture } from '../fixtures/setupIosBridgeFixture';
import { setupWebFixture } from '../fixtures/setupWebFixture';
import type { AituBridge, GetGeoResponse } from '../../src/types';

const geoEvent = { reqId: `getGeo:1`, data: { latitude: 51.5074, longitude: -0.1278 } satisfies GetGeoResponse, error: null } as const;

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

  it('should get geo location', async () => {
    androidBridge.getGeo.mockResponseOnce(geoEvent, { delay: 250 });

    const result = aituBridge.getGeo();

    vi.advanceTimersByTime(250);

    expect(androidBridge.getGeo).toHaveBeenCalledWith('getGeo:1');

    await expect(result).resolves.toStrictEqual(geoEvent.data);
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

  it('should post getGeo message', async () => {
    iosBridge.getGeo.postMessage.mockResponseOnce(geoEvent, { delay: 250 });

    const result = aituBridge.getGeo();

    vi.advanceTimersByTime(250);

    expect(iosBridge.getGeo.postMessage).toHaveBeenCalledWith({ reqId: 'getGeo:1' });

    await expect(result).resolves.toStrictEqual(geoEvent.data);
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

  it('should post getGeo message', async () => {
    webBridge.postMessage.mockResponseOnce(geoEvent, { delay: 250 });

    const result = aituBridge.getGeo();

    vi.advanceTimersByTime(250);

    expect(webBridge.postMessage).toHaveBeenCalledWith(
      {
        source: 'aitu-bridge',
        reqId: 'getGeo:1',
        method: 'getGeo',
        payload: [],
      },
      'test.domain',
    );

    await expect(result).resolves.toStrictEqual(geoEvent.data);
  });
});

describe('Unsupported environment', () => {
  it('should log an error message to the console when getGeo is called', async () => {
    const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

    const aituBridge = await import('../../src/buildBridge').then((mod) => mod.buildBridge());

    const result = aituBridge.getGeo();

    await expect(result).toBeInstanceOf(Promise);

    expect(consoleLogSpy).toHaveBeenCalledWith(`--getGeo-isUnknown`);

    consoleLogSpy.mockRestore();
  });
});
