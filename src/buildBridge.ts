import { promisifyMethod } from './utils';

import { createWebBridge } from './webBridge';

import type { AituEventHandler, AituBridge,  BridgeMethodResult, BridgeInvoke, ResponseObject } from './types';

import { EInvokeRequest } from './types';
import { isBrowser } from './lib/isBrowser';
import { isIframe } from './lib/isIframe';
import { createActionFactories } from './createActionFactories';
import { androidHandlerFactory } from './handlers/android';
import { iosHandlerFactory } from './handlers/ios';
import { webHandlerFactory } from './handlers/web';
import { nullHandler } from './handlers/null';
import { createIdGenerator } from './createIdGenerator';

declare const VERSION: string;

export const buildBridge = (): AituBridge => {
  const vibrateMethod = 'vibrate';
  const isBrowserEnv = isBrowser();
  const android = isBrowserEnv && window.AndroidBridge;
  const ios = isBrowserEnv && window.webkit && window.webkit.messageHandlers;
  const web = isBrowserEnv && isIframe() && createWebBridge();

  const handlerFactories = [androidHandlerFactory, iosHandlerFactory, webHandlerFactory];

  const targetHandlerFactory = handlerFactories.find((adapter) => adapter.isSupported());

  const handler = targetHandlerFactory?.makeActionHandler() ?? nullHandler;

  const idGenerator = createIdGenerator();

  const env = {
    handler,
    generateId: idGenerator,
  };

  const { createAction, createHandlerAction } = createActionFactories(env);

  const subs: AituEventHandler[] = [];

  if (isBrowserEnv) {
    window.addEventListener('aituEvents', (e) => {
      [...subs].map((fn) => fn.call(null, e));
    });
  }

  const vibrate = (reqId: string, pattern: number[]) => {
    if (
      !Array.isArray(pattern) ||
      pattern.some((timing) => timing < 1 || timing !== Math.floor(timing)) ||
      pattern.reduce((total, timing) => total + timing) > 10000
    ) {
      console.error('Pattern should be an array of positive integers no longer than 10000ms total');
      return;
    }

    const isAndroid = android && android[vibrateMethod];
    const isIos = ios && ios[vibrateMethod];

    if (isAndroid) {
      android[vibrateMethod](reqId, JSON.stringify(pattern));
    } else if (isIos) {
      ios[vibrateMethod].postMessage({ reqId, pattern });
    } else if (web) {
      web.execute(vibrateMethod, reqId, pattern);
    } else if (typeof window !== 'undefined') {
      console.log('--vibrate-isUnknown');
    }
  };

  const isSupported = () => handler !== nullHandler;

  const supports = handler.supports;

  const sub = (listener: AituEventHandler) => {
    subs.push(listener);
  };

  const vibratePromise = promisifyMethod<BridgeMethodResult<'vibrate'>>(vibrate, vibrateMethod, sub);

  const isESimSupported = createAction('isESimSupported');

  const activateESim = createAction('activateESim');

  const readNFCData = createAction('readNFCData');

  const readNFCPassport = createAction('readNFCPassport');

  const subscribeUserStepInfo = createAction('subscribeUserStepInfo');

  const unsubscribeUserStepInfo = createAction('unsubscribeUserStepInfo');

  const openUserProfile = createAction('openUserProfile');

  const openSettings = createAction('openSettings');

  const closeApplication = createAction('closeApplication');

  const enableSwipeBack = createAction('enableSwipeBack');

  const disableSwipeBack = createAction('disableSwipeBack');

  const storage = createAction('storage');

  const setShakeHandler = createHandlerAction('setShakeHandler');

  const setTabActiveHandler = createHandlerAction('setTabActiveHandler');

  const setHeaderMenuItemClickHandler = createHandlerAction('setHeaderMenuItemClickHandler');

  const setCustomBackArrowOnClickHandler = createHandlerAction('setCustomBackArrowOnClickHandler');

  const enableScreenCapture = createAction('enableScreenCapture');

  const disableScreenCapture = createAction('disableScreenCapture');

  const invoke = createAction('invoke', {
    generateId: ([method]) => idGenerator(`${method}:invoke`),
  });

  const setCustomBackArrowMode = createAction('setCustomBackArrowMode');

  const getCustomBackArrowMode = createAction('getCustomBackArrowMode');

  const setCustomBackArrowVisible = createAction('setCustomBackArrowVisible');

  const getNavigationItemMode = createAction('getNavigationItemMode');

  const setNavigationItemMode = createAction('setNavigationItemMode');

  const share = createAction('share');

  const shareFile = createAction('shareFile');

  const shareImage = (text: string, dataUrl: string) => {
    const ext = dataUrl.split(';')?.[0]?.split('/')[1] ?? '';
    const filename = 'image.' + ext;
    // remove mime type
    const base64Data = dataUrl.substr(dataUrl.indexOf(',') + 1);

    return shareFile(text, filename, base64Data);
  };

  const getGeo = createAction('getGeo');

  const getQr = createAction('getQr');

  const getSMSCode = createAction('getSMSCode');

  const selectContact = createAction('selectContact');

  const setTitle = createAction('setTitle');

  const copyToClipboard = createAction('copyToClipboard');

  const checkBiometry = createAction('checkBiometry');

  const getUserStepInfo = createAction('getUserStepInfo');

  const openExternalUrl = createAction('openExternalUrl');

  const openPayment = createAction('openPayment');

  const setHeaderMenuItems = createAction('setHeaderMenuItems', {
    validate: (headerMenuItems) => {
      const MAX_HEADER_MENU_ITEMS_COUNT = 3;

      if (headerMenuItems.length > MAX_HEADER_MENU_ITEMS_COUNT) {
        return 'SetHeaderMenuItems: items count should not be more than ' + MAX_HEADER_MENU_ITEMS_COUNT;
      }

      return true;
    },
  });

  return {
    version: VERSION,
    copyToClipboard,
    invoke: invoke as BridgeInvoke<EInvokeRequest, ResponseObject>,
    storage: {
      getItem: (keyName: string) => storage('getItem', { keyName }),
      setItem: (keyName: string, keyValue: string) => storage('setItem', { keyName, keyValue }),
      clear: () => storage('clear'),
    },
    getMe: () => invoke(EInvokeRequest.getMe),
    getPhone: () => invoke(EInvokeRequest.getPhone),
    getContacts: () => invoke(EInvokeRequest.getContacts),
    getGeo,
    getQr,
    getUserProfile: (id: string) => invoke(EInvokeRequest.getUserProfile, { id }),
    getSMSCode,
    openUserProfile,
    selectContact,
    enableNotifications: () => invoke(EInvokeRequest.enableNotifications),
    disableNotifications: () => invoke(EInvokeRequest.disableNotifications),
    enablePrivateMessaging: (appId: string) => invoke(EInvokeRequest.enablePrivateMessaging, { appId }),
    disablePrivateMessaging: (appId: string) => invoke(EInvokeRequest.disablePrivateMessaging, { appId }),
    openSettings,
    closeApplication,
    setTitle,
    share,
    shareImage,
    shareFile,
    setShakeHandler,
    setTabActiveHandler,
    vibrate: vibratePromise,
    isSupported,
    supports,
    sub,
    enableScreenCapture,
    disableScreenCapture,
    setHeaderMenuItems,
    setHeaderMenuItemClickHandler,
    setCustomBackArrowMode,
    getCustomBackArrowMode,
    setCustomBackArrowVisible,
    openPayment,
    setCustomBackArrowOnClickHandler,
    checkBiometry,
    openExternalUrl,
    enableSwipeBack,
    disableSwipeBack,
    setNavigationItemMode: setNavigationItemMode,
    getNavigationItemMode,
    getUserStepInfo,
    isESimSupported,
    activateESim,
    readNFCData,
    subscribeUserStepInfo,
    unsubscribeUserStepInfo,
    readNFCPassport,
  };
};
