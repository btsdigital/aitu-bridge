import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { setupAndroidFixture } from '../fixtures/setupAndroidFixture';
import { setupIosFixture } from '../fixtures/setupIosBridgeFixture';
import { setupWebFixture } from '../fixtures/setupWebFixture';
import type { AituBridge, HeaderMenuItem } from '../../src/types';
import { HeaderMenuIcon } from '../../src/types';

const setHeaderMenuItemsEvent = { reqId: `setHeaderMenuItems:1`, data: 'success', error: null } as const;

const mockMenuItems: HeaderMenuItem[] = [
  { id: '1', icon: HeaderMenuIcon.Menu },
  { id: '2', icon: HeaderMenuIcon.Person, badge: '5' },
];

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

  it('should call setHeaderMenuItems method', async () => {
    androidBridge.setHeaderMenuItems.mockResponseOnce(setHeaderMenuItemsEvent, { delay: 250 });

    const result = aituBridge.setHeaderMenuItems(mockMenuItems);

    vi.advanceTimersByTime(250);

    expect(androidBridge.setHeaderMenuItems).toHaveBeenCalledWith('setHeaderMenuItems:1', JSON.stringify(mockMenuItems));

    await expect(result).resolves.toStrictEqual(setHeaderMenuItemsEvent.data);
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

  it('should post setHeaderMenuItems message', async () => {
    iosBridge.setHeaderMenuItems.postMessage.mockResponseOnce(setHeaderMenuItemsEvent, { delay: 250 });

    const result = aituBridge.setHeaderMenuItems(mockMenuItems);

    vi.advanceTimersByTime(250);

    expect(iosBridge.setHeaderMenuItems.postMessage).toHaveBeenCalledWith({
      reqId: 'setHeaderMenuItems:1',
      itemsJsonArray: JSON.stringify(mockMenuItems),
    });

    await expect(result).resolves.toStrictEqual(setHeaderMenuItemsEvent.data);
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

  it('should post setHeaderMenuItems message', async () => {
    webBridge.postMessage.mockResponseOnce(setHeaderMenuItemsEvent, { delay: 250 });

    const result = aituBridge.setHeaderMenuItems(mockMenuItems);

    vi.advanceTimersByTime(250);

    expect(webBridge.postMessage).toHaveBeenCalledWith(
      {
        source: 'aitu-bridge',
        reqId: 'setHeaderMenuItems:1',
        method: 'setHeaderMenuItems',
        payload: [JSON.stringify(mockMenuItems)],
      },
      'test.domain',
    );

    await expect(result).resolves.toStrictEqual(setHeaderMenuItemsEvent.data);
  });
});

describe('Unsupported environment', () => {
  it('should log an error message to the console when setHeaderMenuItems is called', async () => {
    const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

    const aituBridge = await import('../../src/buildBridge').then((mod) => mod.buildBridge());

    const result = aituBridge.setHeaderMenuItems(mockMenuItems);

    await expect(result).toBeInstanceOf(Promise);

    expect(consoleLogSpy).toHaveBeenCalledWith(`--setHeaderMenuItems-isUnknown`);

    consoleLogSpy.mockRestore();
  });
});
