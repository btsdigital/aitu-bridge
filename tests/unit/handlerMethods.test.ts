import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { setupAndroidFixture } from '../fixtures/setupAndroidFixture';
import { setupIosFixture } from '../fixtures/setupIosBridgeFixture';
import { setupWebFixture } from '../fixtures/setupWebFixture';
import type { AituBridge } from '../../src/types';

const handlerMethods = [
  {
    method: 'setHeaderMenuItemClickHandler',
    callbackName: 'onAituBridgeHeaderMenuItemClick',
  },
  {
    method: 'setCustomBackArrowOnClickHandler',
    callbackName: 'onAituBridgeBackArrowClick',
  },
  {
    method: 'setTabActiveHandler',
    callbackName: 'onAituBridgeTabActive',
  },
  {
    method: 'setShakeHandler',
    callbackName: 'onAituBridgeShake',
  },
] as const;

describe('Android Bridge', () => {
  let cleanup: ReturnType<typeof setupAndroidFixture>['cleanup'];

  let aituBridge: AituBridge;

  beforeAll(() => {
    const fixture = setupAndroidFixture();

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

  it.each(handlerMethods)('$method should set handler to window[$callbackName]', ({ callbackName, method }) => {
    const handler = async () => {};

    const result = aituBridge[method](handler);

    expect(result).not.toBeDefined();
    expect(window[callbackName]).toBe(handler);

    delete window[callbackName];
  });
});

describe('iOS Bridge', () => {
  let cleanup: ReturnType<typeof setupIosFixture>['cleanup'];

  let aituBridge: AituBridge;

  beforeAll(() => {
    const fixture = setupIosFixture();

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

  it.each(handlerMethods)('$method should set handler to window[$callbackName]', ({ callbackName, method }) => {
    const handler = async () => {};

    const result = aituBridge[method](handler);

    expect(result).not.toBeDefined();
    expect(window[callbackName]).toBe(handler);

    delete window[callbackName];
  });
});

describe('Web Bridge', () => {
  let cleanup: Awaited<ReturnType<typeof setupWebFixture>>['cleanup'];

  let aituBridge: AituBridge;

  beforeAll(async () => {
    const fixture = await setupWebFixture();

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

  it.each(handlerMethods)('$method should set handler to window[$callbackName]', ({ callbackName, method }) => {
    const handler = async () => {};

    const result = aituBridge[method](handler);

    expect(result).not.toBeDefined();
    expect(window[callbackName]).toBe(handler);

    delete window[callbackName];
  });
});

describe('Unsupported environment', () => {
  it.each(handlerMethods)('$method should log message', async ({ callbackName, method }) => {
    const handler = async () => {};
    const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

    const aituBridge = await import('../../src/buildBridge').then((mod) => mod.buildBridge());

    const result = aituBridge[method](handler);

    expect(result).not.toBeDefined();
    expect(window[callbackName]).not.toBeDefined();
    expect(consoleLogSpy).toHaveBeenNthCalledWith(1, `--${method}-isUnknown`);

    consoleLogSpy.mockReset();
  });
});
