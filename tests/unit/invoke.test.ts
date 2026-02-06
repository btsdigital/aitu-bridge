import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { setupAndroidFixture } from '../fixtures/setupAndroidFixture';
import { setupIosFixture } from '../fixtures/setupIosBridgeFixture';
import { setupWebFixture } from '../fixtures/setupWebFixture';
import {
  EInvokeRequest,
  type AituBridge,
  type EmptyObject,
  type GetContactsResponse,
  type GetMeResponse,
  type GetPhoneResponse,
  type GetUserProfileResponse,
} from '../../src/types';

const getMeEvent = {
  reqId: `${EInvokeRequest.getMe}:invoke:1`,
  data: {
    name: 'John',
    lastname: 'Doe',
    id: '1',
    avatar: 'avatar',
    avatarThumb: 'avatarThumb',
    notifications_allowed: true,
    private_messaging_enabled: true,
    sign: 'sign',
  } satisfies GetMeResponse,
  error: null,
} as const;

const getContactsEvent = {
  reqId: `${EInvokeRequest.getContacts}:invoke:1`,
  data: {
    contacts: [{ first_name: 'John', last_name: 'Doe', phone: '+77771231234' }],
    sign: 'sign',
  } satisfies GetContactsResponse,
  error: null,
} as const;

const getPhoneEvent = {
  reqId: `${EInvokeRequest.getPhone}:invoke:1`,
  data: {
    phone: '+77771231234',
    sign: 'sign',
  } satisfies GetPhoneResponse,
  error: null,
} as const;

const getUserProfileEvent = {
  reqId: `${EInvokeRequest.getUserProfile}:invoke:1`,
  data: {
    name: 'John',
    lastname: 'Doe',
    phone: '+77771237777',
    avatar: 'avatar',
    avatarThumb: 'avatarThumb',
  } satisfies GetUserProfileResponse,
  error: null,
} as const;

const enablePrivateMessagingEvent = {
  reqId: `${EInvokeRequest.enablePrivateMessaging}:invoke:1`,
  data: {} satisfies EmptyObject,
  error: null,
} as const;

const disablePrivateMessagingEvent = {
  reqId: `${EInvokeRequest.disablePrivateMessaging}:invoke:1`,
  data: {} satisfies EmptyObject,
  error: null,
} as const;

const enableNotificationsEvent = {
  reqId: `${EInvokeRequest.enableNotifications}:invoke:1`,
  data: {} satisfies EmptyObject,
  error: null,
} as const;

const disableNotificationsEvent = {
  reqId: `${EInvokeRequest.disableNotifications}:invoke:1`,
  data: {} satisfies EmptyObject,
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

  it('should get user info', async () => {
    androidBridge.invoke.mockResponseOnce(getMeEvent, { delay: 250 });

    const result = aituBridge.getMe();

    vi.advanceTimersByTime(250);

    console.log(androidBridge.invoke.mock.calls);

    expect(androidBridge.invoke).toHaveBeenNthCalledWith(1, `${EInvokeRequest.getMe}:invoke:1`, EInvokeRequest.getMe, JSON.stringify({}));

    await expect(result).resolves.toEqual(getMeEvent.data);
  });

  it('should get contacts', async () => {
    androidBridge.invoke.mockResponseOnce(getContactsEvent, { delay: 250 });

    const result = aituBridge.getContacts();

    vi.advanceTimersByTime(250);

    expect(androidBridge.invoke).toHaveBeenNthCalledWith(
      1,
      `${EInvokeRequest.getContacts}:invoke:1`,
      EInvokeRequest.getContacts,
      JSON.stringify({}),
    );

    await expect(result).resolves.toEqual(getContactsEvent.data);
  });

  it('should get phone', async () => {
    androidBridge.invoke.mockResponseOnce(getPhoneEvent, { delay: 250 });

    const result = aituBridge.getPhone();

    vi.advanceTimersByTime(250);

    expect(androidBridge.invoke).toHaveBeenNthCalledWith(
      1,
      `${EInvokeRequest.getPhone}:invoke:1`,
      EInvokeRequest.getPhone,
      JSON.stringify({}),
    );

    await expect(result).resolves.toEqual(getPhoneEvent.data);
  });

  it('should get user profile', async () => {
    androidBridge.invoke.mockResponseOnce(getUserProfileEvent, { delay: 250 });

    const result = aituBridge.getUserProfile('1337');

    vi.advanceTimersByTime(250);

    expect(androidBridge.invoke).toHaveBeenNthCalledWith(
      1,
      `${EInvokeRequest.getUserProfile}:invoke:1`,
      EInvokeRequest.getUserProfile,
      JSON.stringify({ id: '1337' }),
    );

    await expect(result).resolves.toEqual(getUserProfileEvent.data);
  });

  it('should enable private messaging', async () => {
    androidBridge.invoke.mockResponseOnce(enablePrivateMessagingEvent, { delay: 250 });

    const result = aituBridge.enablePrivateMessaging('1337');

    vi.advanceTimersByTime(250);

    expect(androidBridge.invoke).toHaveBeenNthCalledWith(
      1,
      `${EInvokeRequest.enablePrivateMessaging}:invoke:1`,
      EInvokeRequest.enablePrivateMessaging,
      JSON.stringify({ appId: '1337' }),
    );

    await expect(result).resolves.toEqual(enablePrivateMessagingEvent.data);
  });

  it('should disable private messaging', async () => {
    androidBridge.invoke.mockResponseOnce(disablePrivateMessagingEvent, { delay: 250 });

    const result = aituBridge.disablePrivateMessaging('1337');

    vi.advanceTimersByTime(250);

    expect(androidBridge.invoke).toHaveBeenNthCalledWith(
      1,
      `${EInvokeRequest.disablePrivateMessaging}:invoke:1`,
      EInvokeRequest.disablePrivateMessaging,
      JSON.stringify({ appId: '1337' }),
    );

    await expect(result).resolves.toEqual(disablePrivateMessagingEvent.data);
  });

  it('should enable notifications', async () => {
    androidBridge.invoke.mockResponseOnce(enableNotificationsEvent, { delay: 250 });

    const result = aituBridge.enableNotifications();

    vi.advanceTimersByTime(250);

    expect(androidBridge.invoke).toHaveBeenNthCalledWith(
      1,
      `${EInvokeRequest.enableNotifications}:invoke:1`,
      EInvokeRequest.enableNotifications,
      JSON.stringify({}),
    );

    await expect(result).resolves.toEqual(enableNotificationsEvent.data);
  });

  it('should disable notifications', async () => {
    androidBridge.invoke.mockResponseOnce(disableNotificationsEvent, { delay: 250 });

    const result = aituBridge.disableNotifications();

    vi.advanceTimersByTime(250);

    expect(androidBridge.invoke).toHaveBeenNthCalledWith(
      1,
      `${EInvokeRequest.disableNotifications}:invoke:1`,
      EInvokeRequest.disableNotifications,
      JSON.stringify({}),
    );

    await expect(result).resolves.toEqual(disableNotificationsEvent.data);
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

  it('should get user info', async () => {
    iosBridge.invoke.postMessage.mockResponseOnce(getMeEvent, { delay: 250 });

    const result = aituBridge.getMe();

    vi.advanceTimersByTime(250);

    expect(iosBridge.invoke.postMessage).toHaveBeenNthCalledWith(1, {
      reqId: `${EInvokeRequest.getMe}:invoke:1`,
      method: EInvokeRequest.getMe,
      data: {},
    });

    await expect(result).resolves.toEqual(getMeEvent.data);
  });

  it('should get contacts', async () => {
    iosBridge.invoke.postMessage.mockResponseOnce(getContactsEvent, { delay: 250 });

    const result = aituBridge.getContacts();

    vi.advanceTimersByTime(250);

    expect(iosBridge.invoke.postMessage).toHaveBeenNthCalledWith(1, {
      reqId: `${EInvokeRequest.getContacts}:invoke:1`,
      method: EInvokeRequest.getContacts,
      data: {},
    });

    await expect(result).resolves.toEqual(getContactsEvent.data);
  });

  it('should get phone', async () => {
    iosBridge.invoke.postMessage.mockResponseOnce(getPhoneEvent, { delay: 250 });

    const result = aituBridge.getPhone();

    vi.advanceTimersByTime(250);

    expect(iosBridge.invoke.postMessage).toHaveBeenNthCalledWith(1, {
      reqId: `${EInvokeRequest.getPhone}:invoke:1`,
      method: EInvokeRequest.getPhone,
      data: {},
    });

    await expect(result).resolves.toEqual(getPhoneEvent.data);
  });

  it('should get user profile', async () => {
    iosBridge.invoke.postMessage.mockResponseOnce(getUserProfileEvent, { delay: 250 });

    const result = aituBridge.getUserProfile('1337');

    vi.advanceTimersByTime(250);

    expect(iosBridge.invoke.postMessage).toHaveBeenNthCalledWith(1, {
      reqId: `${EInvokeRequest.getUserProfile}:invoke:1`,
      method: EInvokeRequest.getUserProfile,
      data: { id: '1337' },
    });

    await expect(result).resolves.toEqual(getUserProfileEvent.data);
  });

  it('should enable private messaging', async () => {
    iosBridge.invoke.postMessage.mockResponseOnce(enablePrivateMessagingEvent, { delay: 250 });

    const result = aituBridge.enablePrivateMessaging('1337');

    vi.advanceTimersByTime(250);

    expect(iosBridge.invoke.postMessage).toHaveBeenNthCalledWith(1, {
      reqId: `${EInvokeRequest.enablePrivateMessaging}:invoke:1`,
      method: EInvokeRequest.enablePrivateMessaging,
      data: { appId: '1337' },
    });

    await expect(result).resolves.toEqual(enablePrivateMessagingEvent.data);
  });

  it('should disable private messaging', async () => {
    iosBridge.invoke.postMessage.mockResponseOnce(disablePrivateMessagingEvent, { delay: 250 });

    const result = aituBridge.disablePrivateMessaging('1337');

    vi.advanceTimersByTime(250);

    expect(iosBridge.invoke.postMessage).toHaveBeenNthCalledWith(1, {
      reqId: `${EInvokeRequest.disablePrivateMessaging}:invoke:1`,
      method: EInvokeRequest.disablePrivateMessaging,
      data: { appId: '1337' },
    });

    await expect(result).resolves.toEqual(disablePrivateMessagingEvent.data);
  });

  it('should enable notifications', async () => {
    iosBridge.invoke.postMessage.mockResponseOnce(enableNotificationsEvent, { delay: 250 });

    const result = aituBridge.enableNotifications();

    vi.advanceTimersByTime(250);

    expect(iosBridge.invoke.postMessage).toHaveBeenNthCalledWith(1, {
      reqId: `${EInvokeRequest.enableNotifications}:invoke:1`,
      method: EInvokeRequest.enableNotifications,
      data: {},
    });

    await expect(result).resolves.toEqual(enableNotificationsEvent.data);
  });

  it('should disable notifications', async () => {
    iosBridge.invoke.postMessage.mockResponseOnce(disableNotificationsEvent, { delay: 250 });

    const result = aituBridge.disableNotifications();

    vi.advanceTimersByTime(250);

    expect(iosBridge.invoke.postMessage).toHaveBeenNthCalledWith(1, {
      reqId: `${EInvokeRequest.disableNotifications}:invoke:1`,
      method: EInvokeRequest.disableNotifications,
      data: {},
    });

    await expect(result).resolves.toEqual(disableNotificationsEvent.data);
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

  it('should get user info', async () => {
    webBridge.postMessage.mockResponseOnce(getMeEvent, { delay: 250 });

    const result = aituBridge.getMe();

    vi.advanceTimersByTime(250);

    expect(webBridge.postMessage).toHaveBeenCalledWith(
      {
        source: 'aitu-bridge',
        reqId: `${EInvokeRequest.getMe}:invoke:1`,
        method: 'invoke',
        payload: [EInvokeRequest.getMe, {}],
      },
      'test.domain',
    );

    await expect(result).resolves.toEqual(getMeEvent.data);
  });

  it('should get contacts', async () => {
    webBridge.postMessage.mockResponseOnce(getContactsEvent, { delay: 250 });

    const result = aituBridge.getContacts();

    vi.advanceTimersByTime(250);

    expect(webBridge.postMessage).toHaveBeenCalledWith(
      {
        source: 'aitu-bridge',
        reqId: `${EInvokeRequest.getContacts}:invoke:1`,
        method: 'invoke',
        payload: [EInvokeRequest.getContacts, {}],
      },
      'test.domain',
    );

    await expect(result).resolves.toEqual(getContactsEvent.data);
  });

  it('should get phone', async () => {
    webBridge.postMessage.mockResponseOnce(getPhoneEvent, { delay: 250 });

    const result = aituBridge.getPhone();

    vi.advanceTimersByTime(250);

    expect(webBridge.postMessage).toHaveBeenCalledWith(
      {
        source: 'aitu-bridge',
        reqId: `${EInvokeRequest.getPhone}:invoke:1`,
        method: 'invoke',
        payload: [EInvokeRequest.getPhone, {}],
      },
      'test.domain',
    );

    await expect(result).resolves.toEqual(getPhoneEvent.data);
  });

  it('should get user profile', async () => {
    webBridge.postMessage.mockResponseOnce(getUserProfileEvent, { delay: 250 });

    const result = aituBridge.getUserProfile('1337');

    vi.advanceTimersByTime(250);

    expect(webBridge.postMessage).toHaveBeenCalledWith(
      {
        source: 'aitu-bridge',
        reqId: `${EInvokeRequest.getUserProfile}:invoke:1`,
        method: 'invoke',
        payload: [
          EInvokeRequest.getUserProfile,
          {
            id: '1337',
          },
        ],
      },
      'test.domain',
    );

    await expect(result).resolves.toEqual(getUserProfileEvent.data);
  });

  it('should enable private messaging', async () => {
    webBridge.postMessage.mockResponseOnce(enablePrivateMessagingEvent, { delay: 250 });

    const result = aituBridge.enablePrivateMessaging('1337');

    vi.advanceTimersByTime(250);

    expect(webBridge.postMessage).toHaveBeenCalledWith(
      {
        source: 'aitu-bridge',
        reqId: `${EInvokeRequest.enablePrivateMessaging}:invoke:1`,
        method: 'invoke',
        payload: [
          EInvokeRequest.enablePrivateMessaging,
          {
            appId: '1337',
          },
        ],
      },
      'test.domain',
    );

    await expect(result).resolves.toEqual(enablePrivateMessagingEvent.data);
  });

  it('should disable private messaging', async () => {
    webBridge.postMessage.mockResponseOnce(disablePrivateMessagingEvent, { delay: 250 });

    const result = aituBridge.disablePrivateMessaging('1337');

    vi.advanceTimersByTime(250);

    expect(webBridge.postMessage).toHaveBeenCalledWith(
      {
        source: 'aitu-bridge',
        reqId: `${EInvokeRequest.disablePrivateMessaging}:invoke:1`,
        method: 'invoke',
        payload: [
          EInvokeRequest.disablePrivateMessaging,
          {
            appId: '1337',
          },
        ],
      },
      'test.domain',
    );

    await expect(result).resolves.toEqual(disablePrivateMessagingEvent.data);
  });

  it('should enable notifications', async () => {
    webBridge.postMessage.mockResponseOnce(enableNotificationsEvent, { delay: 250 });

    const result = aituBridge.enableNotifications();

    vi.advanceTimersByTime(250);

    expect(webBridge.postMessage).toHaveBeenCalledWith(
      {
        source: 'aitu-bridge',
        reqId: `${EInvokeRequest.enableNotifications}:invoke:1`,
        method: 'invoke',
        payload: [EInvokeRequest.enableNotifications, {}],
      },
      'test.domain',
    );

    await expect(result).resolves.toEqual(enableNotificationsEvent.data);
  });

  it('should disable notifications', async () => {
    webBridge.postMessage.mockResponseOnce(disableNotificationsEvent, { delay: 250 });

    const result = aituBridge.disableNotifications();

    vi.advanceTimersByTime(250);

    expect(webBridge.postMessage).toHaveBeenCalledWith(
      {
        source: 'aitu-bridge',
        reqId: `${EInvokeRequest.disableNotifications}:invoke:1`,
        method: 'invoke',
        payload: [EInvokeRequest.disableNotifications, {}],
      },
      'test.domain',
    );

    await expect(result).resolves.toEqual(disableNotificationsEvent.data);
  });
});

describe('Unsupported environment', () => {
  it('should get user info', async () => {
    const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

    const aituBridge = await import('../../src/buildBridge').then((mod) => mod.buildBridge());

    const result = aituBridge.getMe();

    expect(result).toBeInstanceOf(Promise);

    expect(consoleLogSpy).toHaveBeenCalledWith(`--invoke-isUnknown`);

    consoleLogSpy.mockReset();
  });

  it('should get contacts', async () => {
    const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

    const aituBridge = await import('../../src/buildBridge').then((mod) => mod.buildBridge());

    const result = aituBridge.getContacts();

    expect(result).toBeInstanceOf(Promise);

    expect(consoleLogSpy).toHaveBeenCalledWith(`--invoke-isUnknown`);

    consoleLogSpy.mockReset();
  });

  it('should get phone', async () => {
    const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

    const aituBridge = await import('../../src/buildBridge').then((mod) => mod.buildBridge());

    const result = aituBridge.getPhone();

    expect(result).toBeInstanceOf(Promise);

    expect(consoleLogSpy).toHaveBeenCalledWith(`--invoke-isUnknown`);

    consoleLogSpy.mockReset();
  });

  it('should get user profile', async () => {
    const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

    const aituBridge = await import('../../src/buildBridge').then((mod) => mod.buildBridge());

    const result = aituBridge.getUserProfile('1337');

    expect(result).toBeInstanceOf(Promise);

    expect(consoleLogSpy).toHaveBeenCalledWith(`--invoke-isUnknown`);

    consoleLogSpy.mockReset();
  });

  it('should enable private messaging', async () => {
    const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

    const aituBridge = await import('../../src/buildBridge').then((mod) => mod.buildBridge());

    const result = aituBridge.enablePrivateMessaging('1337');

    expect(result).toBeInstanceOf(Promise);

    expect(consoleLogSpy).toHaveBeenCalledWith(`--invoke-isUnknown`);

    consoleLogSpy.mockReset();
  });

  it('should disable private messaging', async () => {
    const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

    const aituBridge = await import('../../src/buildBridge').then((mod) => mod.buildBridge());

    const result = aituBridge.disablePrivateMessaging('1337');

    expect(result).toBeInstanceOf(Promise);

    expect(consoleLogSpy).toHaveBeenCalledWith(`--invoke-isUnknown`);

    consoleLogSpy.mockReset();
  });

  it('should enable notifications', async () => {
    const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

    const aituBridge = await import('../../src/buildBridge').then((mod) => mod.buildBridge());

    const result = aituBridge.enableNotifications();

    expect(result).toBeInstanceOf(Promise);

    expect(consoleLogSpy).toHaveBeenCalledWith(`--invoke-isUnknown`);

    consoleLogSpy.mockReset();
  });

  it('should disable notifications', async () => {
    const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

    const aituBridge = await import('../../src/buildBridge').then((mod) => mod.buildBridge());

    const result = aituBridge.disableNotifications();

    expect(result).toBeInstanceOf(Promise);

    expect(consoleLogSpy).toHaveBeenCalledWith(`--invoke-isUnknown`);

    consoleLogSpy.mockReset();
  });
});
