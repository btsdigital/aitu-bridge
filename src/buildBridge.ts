import { promisifyMethod, promisifyInvoke } from './utils';

import { type WebBridge, createWebBridge } from './webBridge';

import type { AituEventHandler, RequestMethods, AituBridge, HeaderMenuItem, BridgeMethodResult } from './types';

import { EInvokeRequest, type NavigationItemMode } from './types';
import { isBrowser } from './lib/isBrowser';
import { isIframe } from './lib/isIframe';
import { createActionFactory } from './createActionFactory';
import { androidHandlerFactory } from './handlers/android';
import { iosHandlerFactory } from './handlers/ios';
import { webHandlerFactory } from './handlers/web';
import { nullHandler } from './handlers/null';

declare const VERSION: string;

export const buildBridge = (): AituBridge => {
  const invokeMethod = 'invoke';
  const getGeoMethod = 'getGeo';
  const getQrMethod = 'getQr';
  const getSMSCodeMethod = 'getSMSCode';
  const selectContactMethod = 'selectContact';
  const shareMethod = 'share';
  const setTitleMethod = 'setTitle';
  const copyToClipboardMethod = 'copyToClipboard';
  const shareImageMethod = 'shareImage';
  const shareFileMethod = 'shareFile';
  const vibrateMethod = 'vibrate';
  const setHeaderMenuItemsMethod = 'setHeaderMenuItems';
  const setCustomBackArrowModeMethod = 'setCustomBackArrowMode';
  const getCustomBackArrowModeMethod = 'getCustomBackArrowMode';
  const setCustomBackArrowVisibleMethod = 'setCustomBackArrowVisible';
  const openPaymentMethod = 'openPayment';
  const checkBiometryMethod = 'checkBiometry';
  const openExternalUrlMethod = 'openExternalUrl';
  const setNavigationItemModeMethod = 'setNavigationItemMode';
  const getNavigationItemModeMethod = 'getNavigationItemMode';
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

  const invoke = (reqId: string, method: string, data = {}) => {
    const isAndroid = android && android[invokeMethod];
    const isIos = ios && ios[invokeMethod];

    if (isAndroid) {
      android[invokeMethod](reqId, method, JSON.stringify(data));
    } else if (isIos) {
      ios[invokeMethod].postMessage({ reqId, method, data });
    } else if (web) {
      web.execute(invokeMethod, reqId, method, data);
    } else if (typeof window !== 'undefined') {
      console.log('--invoke-isUnknown');
    }
  };

  const getGeo = (reqId: string) => {
    const isAndroid = android && android[getGeoMethod];
    const isIos = ios && ios[getGeoMethod];

    if (isAndroid) {
      android[getGeoMethod](reqId);
    } else if (isIos) {
      ios[getGeoMethod].postMessage({ reqId });
    } else if (web) {
      web.execute(getGeoMethod, reqId);
    } else if (typeof window !== 'undefined') {
      console.log('--getGeo-isUnknown');
    }
  };

  const getQr = (reqId: string) => {
    const isAndroid = android && android[getQrMethod];
    const isIos = ios && ios[getQrMethod];

    if (isAndroid) {
      android[getQrMethod](reqId);
    } else if (isIos) {
      ios[getQrMethod].postMessage({ reqId });
    } else if (web) {
      web.execute(getQrMethod, reqId);
    } else if (typeof window !== 'undefined') {
      console.log('--getQr-isUnknown');
    }
  };

  const getSMSCode = (reqId: string) => {
    const isAndroid = android && android[getSMSCodeMethod];
    const isIos = ios && ios[getSMSCodeMethod];

    if (isAndroid) {
      android[getSMSCodeMethod](reqId);
    } else if (isIos) {
      ios[getSMSCodeMethod].postMessage({ reqId });
    } else if (web) {
      web.execute(getSMSCodeMethod, reqId);
    } else if (typeof window !== 'undefined') {
      console.log('--getSMSCode-isUnknown');
    }
  };

  const selectContact = (reqId: string) => {
    const isAndroid = android && android[selectContactMethod];
    const isIos = ios && ios[selectContactMethod];

    if (isAndroid) {
      android[selectContactMethod](reqId);
    } else if (isIos) {
      ios[selectContactMethod].postMessage({ reqId });
    } else if (web) {
      web.execute(selectContactMethod, reqId);
    } else if (typeof window !== 'undefined') {
      console.log('--selectContact-isUnknown');
    }
  };

  const share = (reqId: string, text: string) => {
    const isAndroid = android && android[shareMethod];
    const isIos = ios && ios[shareMethod];

    if (isAndroid) {
      android[shareMethod](reqId, text);
    } else if (isIos) {
      ios[shareMethod].postMessage({ reqId, text });
    } else if (web) {
      web.execute(shareMethod, reqId, text);
    } else if (typeof window !== 'undefined') {
      console.log('--share-isUnknown');
    }
  };

  const setTitle = (reqId: string, text: string) => {
    const isAndroid = android && android[setTitleMethod];
    const isIos = ios && ios[setTitleMethod];

    if (isAndroid) {
      android[setTitleMethod](reqId, text);
    } else if (isIos) {
      ios[setTitleMethod].postMessage({ reqId, text });
    } else if (web) {
      web.execute(setTitleMethod, reqId, text);
    } else if (typeof window !== 'undefined') {
      console.log('--setTitle-isUnknown');
    }
  };

  const copyToClipboard = (reqId: string, text: string) => {
    const isAndroid = android && android[copyToClipboardMethod];
    const isIos = ios && ios[copyToClipboardMethod];

    if (isAndroid) {
      android[copyToClipboardMethod](reqId, text);
    } else if (isIos) {
      ios[copyToClipboardMethod].postMessage({ reqId, text });
    } else if (web) {
      web.execute(copyToClipboardMethod, reqId, text);
    } else if (typeof window !== 'undefined') {
      console.log('--copyToClipboard-isUnknown');
    }
  };

  const shareImage = (reqId: string, text: string, image: string) => {
    // !!!======================!!!
    // !!!===== Deprecated =====!!!
    // !!!======================!!!

    // const isAndroid = android && android[shareImageMethod];
    // const isIos = ios && ios[shareImageMethod];

    // if (isAndroid) {
    //   android[shareImageMethod](reqId, text, image);
    // } else if (isIos) {
    //   ios[shareImageMethod].postMessage({ reqId, text, image });
    // } else if (typeof window !== 'undefined') {
    //   console.log('--shareImage-isWeb');
    // }

    // new one - fallback to shareFile
    const isAndroid = android && android[shareFileMethod];
    const isIos = ios && ios[shareFileMethod];

    // get extension from base64 mime type and merge with name
    const ext = image.split(';')?.[0]?.split('/')[1] ?? '';
    const filename = 'image.' + ext;
    // remove mime type
    const base64Data = image.substr(image.indexOf(',') + 1);

    if (isAndroid) {
      android[shareFileMethod](reqId, text, filename, base64Data);
    } else if (isIos) {
      ios[shareFileMethod].postMessage({ reqId, text, filename, base64Data });
    } else if (web) {
      web.execute(shareFileMethod, reqId, { text, filename, base64Data });
    } else if (typeof window !== 'undefined') {
      console.log('--shareFile-isUnknown');
    }
  };

  const shareFile = (reqId: string, text: string, filename: string, base64Data: string) => {
    const isAndroid = android && android[shareFileMethod];
    const isIos = ios && ios[shareFileMethod];

    if (isAndroid) {
      android[shareFileMethod](reqId, text, filename, base64Data);
    } else if (isIos) {
      ios[shareFileMethod].postMessage({ reqId, text, filename, base64Data });
    } else if (web) {
      web.execute(shareFileMethod, reqId, text, filename, base64Data);
    } else if (typeof window !== 'undefined') {
      console.log('--shareFile-isUnknown');
    }
  };

  const enableNotifications = () => invokePromise(EInvokeRequest.enableNotifications);

  const disableNotifications = () => invokePromise(EInvokeRequest.disableNotifications);

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

  /**
   * @deprecated данный метод не рекомендуется использовать
   * вместо него используйте setNavigationItemMode
   */
  const setCustomBackArrowMode = (reqId: string, enabled: boolean) => {
    const isAndroid = android && android[setCustomBackArrowModeMethod];
    const isIos = ios && ios[setCustomBackArrowModeMethod];

    if (isAndroid) {
      android[setCustomBackArrowModeMethod](reqId, enabled);
    } else if (isIos) {
      ios[setCustomBackArrowModeMethod].postMessage({ reqId, enabled });
    } else if (web) {
      web.execute(setCustomBackArrowModeMethod, reqId, enabled);
    } else if (typeof window !== 'undefined') {
      console.log('--setCustomBackArrowMode-isUnknown');
    }
  };

  /**
   * @deprecated данный метод не рекомендуется использовать
   * вместо него используйте getNavigationItemMode
   */
  const getCustomBackArrowMode = (reqId: string) => {
    const isAndroid = android && android[getCustomBackArrowModeMethod];
    const isIos = ios && ios[getCustomBackArrowModeMethod];

    if (isAndroid) {
      android[getCustomBackArrowModeMethod](reqId);
    } else if (isIos) {
      ios[getCustomBackArrowModeMethod].postMessage({ reqId });
    } else if (web) {
      web.execute(getCustomBackArrowModeMethod, reqId);
    } else if (typeof window !== 'undefined') {
      console.log('--getCustomBackArrowMode-isUnknown');
    }
  };

  /**
   * @deprecated данный метод не рекомендуется использовать
   * вместо него используйте setNavigationItemMode
   */
  const setCustomBackArrowVisible = (reqId: string, visible: boolean) => {
    const isAndroid = android && android[setCustomBackArrowVisibleMethod];
    const isIos = ios && ios[setCustomBackArrowVisibleMethod];

    if (isAndroid) {
      android[setCustomBackArrowVisibleMethod](reqId, visible);
    } else if (isIos) {
      ios[setCustomBackArrowVisibleMethod].postMessage({ reqId, visible });
    } else if (web) {
      web.execute(setCustomBackArrowVisibleMethod, reqId, visible);
    } else if (typeof window !== 'undefined') {
      console.log('--setCustomBackArrowVisible-isUnknown');
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
      console.log('--openExternalUrlMethod-isUnknown');
    }
  };

  const setNavigationItemMode = (reqId: string, mode: NavigationItemMode) => {
    const isAndroid = android && android[setNavigationItemModeMethod];
    const isIos = ios && ios[setNavigationItemModeMethod];

    if (isAndroid) {
      android[setNavigationItemModeMethod](reqId, mode);
    } else if (isIos) {
      ios[setNavigationItemModeMethod].postMessage({ reqId, mode });
    } else if (web) {
      web.execute(setNavigationItemModeMethod, reqId, mode);
    } else if (typeof window !== 'undefined') {
      console.log('--setNavigationItemMode-isUnknown');
    }
  };

  const getNavigationItemMode = (reqId: string) => {
    const isAndroid = android && android[getNavigationItemModeMethod];
    const isIos = ios && ios[getNavigationItemModeMethod];

    if (isAndroid) {
      android[getNavigationItemModeMethod](reqId);
    } else if (isIos) {
      ios[getNavigationItemModeMethod].postMessage({ reqId });
    } else if (web) {
      web.execute(getNavigationItemModeMethod, reqId);
    } else if (typeof window !== 'undefined') {
      console.log('--getNavigationItemMode-isUnknown');
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

  const invokePromise = promisifyInvoke(invoke, sub);
  const getGeoPromise = promisifyMethod<BridgeMethodResult<'getGeo'>>(getGeo, getGeoMethod, sub);
  const getQrPromise = promisifyMethod<BridgeMethodResult<'getQr'>>(getQr, getQrMethod, sub);
  const getSMSCodePromise = promisifyMethod<BridgeMethodResult<'getSMSCode'>>(getSMSCode, getSMSCodeMethod, sub);
  const selectContactPromise = promisifyMethod<BridgeMethodResult<'selectContact'>>(selectContact, selectContactMethod, sub);
  const sharePromise = promisifyMethod<BridgeMethodResult<'share'>>(share, shareMethod, sub);
  const setTitlePromise = promisifyMethod<BridgeMethodResult<'setTitle'>>(setTitle, setTitleMethod, sub);
  const copyToClipboardPromise = promisifyMethod<BridgeMethodResult<'copyToClipboard'>>(copyToClipboard, copyToClipboardMethod, sub);
  const shareImagePromise = promisifyMethod<Awaited<ReturnType<AituBridge['shareImage']>>>(shareImage, shareImageMethod, sub);
  const shareFilePromise = promisifyMethod<BridgeMethodResult<'shareFile'>>(shareFile, shareFileMethod, sub);
  const vibratePromise = promisifyMethod<BridgeMethodResult<'vibrate'>>(vibrate, vibrateMethod, sub);

  const setHeaderMenuItemsPromise = promisifyMethod<BridgeMethodResult<'setHeaderMenuItems'>>(
    setHeaderMenuItems,
    setHeaderMenuItemsMethod,
    sub
  );
  const setCustomBackArrowModePromise = promisifyMethod<BridgeMethodResult<'setCustomBackArrowMode'>>(
    setCustomBackArrowMode,
    setCustomBackArrowModeMethod,
    sub
  );
  const getCustomBackArrowModePromise = promisifyMethod<BridgeMethodResult<'getCustomBackArrowMode'>>(
    getCustomBackArrowMode,
    getCustomBackArrowModeMethod,
    sub
  );
  const setCustomBackArrowVisiblePromise = promisifyMethod<BridgeMethodResult<'setCustomBackArrowVisible'>>(
    setCustomBackArrowVisible,
    setCustomBackArrowVisibleMethod,
    sub
  );
  const openPaymentPromise = promisifyMethod<BridgeMethodResult<'openPayment'>>(openPayment, openPaymentMethod, sub);
  const checkBiometryPromise = promisifyMethod<BridgeMethodResult<'checkBiometry'>>(checkBiometry, checkBiometryMethod, sub);
  const openExternalUrlPromise = promisifyMethod<BridgeMethodResult<'openExternalUrl'>>(openExternalUrl, openExternalUrlMethod, sub);
  const setNavigationItemModePromise = promisifyMethod<BridgeMethodResult<'setNavigationItemMode'>>(
    setNavigationItemMode,
    setNavigationItemModeMethod,
    sub
  );
  const getNavigationItemModePromise = promisifyMethod<BridgeMethodResult<'getNavigationItemMode'>>(
    getNavigationItemMode,
    getNavigationItemModeMethod,
    sub
  );
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

  return {
    version: VERSION,
    copyToClipboard: copyToClipboardPromise,
    invoke: invokePromise,
    storage: {
      getItem: (keyName: string) => storage('getItem', { keyName }),
      setItem: (keyName: string, keyValue: string) => storage('setItem', { keyName, keyValue }),
      clear: () => storage('clear', {}),
    },
    getMe: () => invokePromise(EInvokeRequest.getMe),
    getPhone: () => invokePromise(EInvokeRequest.getPhone),
    getContacts: () => invokePromise(EInvokeRequest.getContacts),
    getGeo: getGeoPromise,
    getQr: getQrPromise,
    getSMSCode: getSMSCodePromise,
    getUserProfile: (id: string) => invokePromise(EInvokeRequest.getUserProfile, { id }),
    openUserProfile,
    selectContact: selectContactPromise,
    enableNotifications,
    disableNotifications,
    enablePrivateMessaging: (appId: string) => invokePromise(EInvokeRequest.enablePrivateMessaging, { appId }),
    disablePrivateMessaging: (appId: string) => invokePromise(EInvokeRequest.disablePrivateMessaging, { appId }),
    openSettings,
    closeApplication,
    setTitle: setTitlePromise,
    share: sharePromise,
    shareImage: shareImagePromise,
    shareFile: shareFilePromise,
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
    setCustomBackArrowMode: setCustomBackArrowModePromise,
    getCustomBackArrowMode: getCustomBackArrowModePromise,
    setCustomBackArrowVisible: setCustomBackArrowVisiblePromise,
    openPayment: openPaymentPromise,
    setCustomBackArrowOnClickHandler,
    checkBiometry: checkBiometryPromise,
    openExternalUrl: openExternalUrlPromise,
    enableSwipeBack,
    disableSwipeBack,
    setNavigationItemMode: setNavigationItemModePromise,
    getNavigationItemMode: getNavigationItemModePromise,
    getUserStepInfo: getUserStepInfoPromise,
    isESimSupported,
    activateESim,
    readNFCData,
    subscribeUserStepInfo,
    unsubscribeUserStepInfo,
    readNFCPassport,
  };
};
