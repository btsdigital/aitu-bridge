import { promisifyMethod } from './utils';

import { type WebBridge, createWebBridge } from './webBridge';

import type { AituEventHandler, RequestMethods, AituBridge, HeaderMenuItem, BridgeMethodResult, BridgeInvoke, ResponseObject } from './types';

import { EInvokeRequest } from './types';
import { isBrowser } from './lib/isBrowser';
import { isIframe } from './lib/isIframe';
import { createActionFactory } from './createActionFactory';
import { androidHandlerFactory } from './handlers/android';
import { iosHandlerFactory } from './handlers/ios';
import { webHandlerFactory } from './handlers/web';
import { nullHandler } from './handlers/null';

declare const VERSION: string;

export const buildBridge = (): AituBridge => {
  const copyToClipboardMethod = 'copyToClipboard';
  const vibrateMethod = 'vibrate';
  const setHeaderMenuItemsMethod = 'setHeaderMenuItems';
  const openPaymentMethod = 'openPayment';
  const checkBiometryMethod = 'checkBiometry';
  const openExternalUrlMethod = 'openExternalUrl';
  const getUserStepInfoMethod = 'getUserStepInfo';

  const MAX_HEADER_MENU_ITEMS_COUNT = 3;
  const isBrowserEnv = isBrowser();
  const android = isBrowserEnv && window.AndroidBridge;
  const ios = isBrowserEnv && window.webkit && window.webkit.messageHandlers;
  const web = isBrowserEnv && isIframe() && createWebBridge();

  const handlerFactories = [androidHandlerFactory, iosHandlerFactory, webHandlerFactory];

  const targetHandlerFactory = handlerFactories.find((adapter) => adapter.isSupported());

  const handler = targetHandlerFactory?.makeActionHandler() ?? nullHandler;

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

  const isSupported = () => {
    const iosSup = ios && window.webkit?.messageHandlers?.invoke;
    return Boolean(android || iosSup || web);
  };

  // TODO: implement web support
  const supports = (method: string) =>
    (!!android && typeof android[method as RequestMethods] === 'function') ||
    (!!ios && !!ios[method as RequestMethods] && typeof ios[method as RequestMethods].postMessage === 'function') ||
    (!!web && typeof web[method as keyof WebBridge] === 'function');

  const sub = (listener: AituEventHandler) => {
    subs.push(listener);
  };

  const setHeaderMenuItems = (reqId: string, items: Array<HeaderMenuItem>) => {
    if (items.length > MAX_HEADER_MENU_ITEMS_COUNT) {
      console.error('SetHeaderMenuItems: items count should not be more than ' + MAX_HEADER_MENU_ITEMS_COUNT);
      return;
    }

    const isAndroid = android && android[setHeaderMenuItemsMethod];
    const isIos = ios && ios[setHeaderMenuItemsMethod];

    const itemsJsonArray = JSON.stringify(items);

    if (isAndroid) {
      android[setHeaderMenuItemsMethod](reqId, itemsJsonArray);
    } else if (isIos) {
      ios[setHeaderMenuItemsMethod].postMessage({ reqId, itemsJsonArray });
    } else if (web) {
      web.execute(setHeaderMenuItemsMethod, reqId, itemsJsonArray);
    } else if (typeof window !== 'undefined') {
      console.log('--setHeaderMenuItems-isUnknown');
    }
  };

  const openPayment = (reqId: string, transactionId: string) => {
    const isAndroid = android && android[openPaymentMethod];
    const isIos = ios && ios[openPaymentMethod];

    if (isAndroid) {
      android[openPaymentMethod](reqId, transactionId);
    } else if (isIos) {
      ios[openPaymentMethod].postMessage({ reqId, transactionId });
    } else {
      console.log('--openPayment-isUnknown');
    }
  };

  const checkBiometry = (reqId: string) => {
    const isAndroid = android && android[checkBiometryMethod];
    const isIos = ios && ios[checkBiometryMethod];

    if (isAndroid) {
      android[checkBiometryMethod](reqId);
    } else if (isIos) {
      ios[checkBiometryMethod].postMessage({ reqId });
    } else if (web) {
      web.execute(checkBiometryMethod, reqId);
    } else if (typeof window !== 'undefined') {
      console.log('--checkBiometry-isUnknown');
    }
  };

  const openExternalUrl = (reqId: string, url: string) => {
    const isAndroid = android && android[openExternalUrlMethod];
    const isIos = ios && ios[openExternalUrlMethod];

    if (isAndroid) {
      android[openExternalUrlMethod](reqId, url);
    } else if (isIos) {
      ios[openExternalUrlMethod].postMessage({ reqId, url });
    } else {
      console.log('--openExternalUrl-isUnknown');
    }
  };

  const getUserStepInfo = (reqId: string) => {
    const isAndroid = android && android[getUserStepInfoMethod];
    const isIos = ios && ios[getUserStepInfoMethod];

    if (isAndroid) {
      android[getUserStepInfoMethod](reqId);
    } else if (isIos) {
      ios[getUserStepInfoMethod].postMessage({ reqId });
    } else if (web) {
      console.log('--getUserStepInfo-isWeb');
    } else if (typeof window !== 'undefined') {
      console.log('--getUserStepInfo-isUnknown');
    }
  };

  const vibratePromise = promisifyMethod<BridgeMethodResult<'vibrate'>>(vibrate, vibrateMethod, sub);

  const setHeaderMenuItemsPromise = promisifyMethod<BridgeMethodResult<'setHeaderMenuItems'>>(
    setHeaderMenuItems,
    setHeaderMenuItemsMethod,
    sub,
  );
  const openPaymentPromise = promisifyMethod<BridgeMethodResult<'openPayment'>>(openPayment, openPaymentMethod, sub);
  const checkBiometryPromise = promisifyMethod<BridgeMethodResult<'checkBiometry'>>(checkBiometry, checkBiometryMethod, sub);
  const openExternalUrlPromise = promisifyMethod<BridgeMethodResult<'openExternalUrl'>>(openExternalUrl, openExternalUrlMethod, sub);
  const getUserStepInfoPromise = promisifyMethod<BridgeMethodResult<'getUserStepInfo'>>(getUserStepInfo, getUserStepInfoMethod, sub);

  const createAction = createActionFactory(handler);

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

  const setShakeHandler = createAction('setShakeHandler');

  const setTabActiveHandler = createAction('setTabActiveHandler');

  const setHeaderMenuItemClickHandler = createAction('setHeaderMenuItemClickHandler');

  const setCustomBackArrowOnClickHandler = createAction('setCustomBackArrowOnClickHandler');

  const enableScreenCapture = createAction('enableScreenCapture');

  const disableScreenCapture = createAction('disableScreenCapture');
  
  const invoke = createAction('invoke', {
    generateId: ({ counter, payload: [method] }) => `${method}:${counter.next()}`,
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

  return {
    version: VERSION,
    copyToClipboard,
    invoke: invoke as BridgeInvoke<EInvokeRequest, ResponseObject>,
    storage: {
      getItem: (keyName: string) => storage('getItem', { keyName }),
      setItem: (keyName: string, keyValue: string) => storage('setItem', { keyName, keyValue }) as any,
      clear: () => storage('clear') as any,
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
    enablePrivateMessaging: (appId: string) => invoke(EInvokeRequest.enablePrivateMessaging, { appId }) as any,
    disablePrivateMessaging: (appId: string) => invoke(EInvokeRequest.disablePrivateMessaging, { appId }) as any,
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
    setHeaderMenuItems: setHeaderMenuItemsPromise,
    setHeaderMenuItemClickHandler,
    setCustomBackArrowMode,
    getCustomBackArrowMode,
    setCustomBackArrowVisible,
    openPayment: openPaymentPromise,
    setCustomBackArrowOnClickHandler,
    checkBiometry: checkBiometryPromise,
    openExternalUrl: openExternalUrlPromise,
    enableSwipeBack,
    disableSwipeBack,
    setNavigationItemMode: setNavigationItemMode as AituBridge['setNavigationItemMode'],
    getNavigationItemMode,
    getUserStepInfo: getUserStepInfoPromise,
    isESimSupported,
    activateESim,
    readNFCData,
    subscribeUserStepInfo,
    unsubscribeUserStepInfo,
    readNFCPassport,
  };
};
