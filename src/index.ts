import { LIB_VERSION } from './version';

import promisifyInvoke from './promisifyInvoke';
import promisifyStorage from './promisifyStorage';
import promisifyMethod from './promisifyMethod';

enum EInvokeRequest {
  getMe = 'GetMe',
  getPhone = 'GetPhone',
  getContacts = 'GetContacts',
  getUserProfile = 'GetUserProfile',
  enableNotifications = 'AllowNotifications',
  disableNotifications = 'DisableNotifications'
}

type SetItemType = (keyName: string, keyValue: string) => Promise<void>;
type GetItemType = (keyName: string) => Promise<string | null>;
type ClearType = () => Promise<void>;

type HeaderMenuItemClickHandlerType = (id: string) => Promise<void>;
type BackArrowClickHandlerType = () => Promise<void>;

interface GetPhoneResponse {
  phone: string;
  sign: string;
}

interface GetMeResponse {
  name: string;
  lastname: string;
  id: string;
  avatar?: string;
  avatarThumb?: string;
  sign: string;
}

interface ResponseObject {
  phone?: string;
  name?: string;
  lastname?: string;
}

interface GetGeoResponse {
  latitude: number;
  longitude: number;
}

interface GetContactsResponse {
  contacts: Array<{
    first_name: string;
    last_name: string;
    phone: string;
  }>;
  sign: string;
}

interface SelectContactResponse {
  phone: string;
  name: string;
  lastname: string;
}

interface GetUserProfileResponse {
  name: string;
  lastname?: string;
  phone?: string;
  avatar?: string;
  avatarThumb?: string;
}

const MAX_HEADER_MENU_ITEMS_COUNT = 3;

export enum HeaderMenuIcon {
  Search = "Search",
  ShoppingCart = "ShoppingCart",
  Menu = "Menu",
  Share = "Share",
  Notifications = "Notifications",
  Help = "Help",
  Error = "Error",
  Person = "Person",
  Sort = "Sort",
  Filter = "Filter"
}

interface HeaderMenuItem {
  id: string;
  icon: HeaderMenuIcon;
  badge?: string;
}

type OpenSettingsResponse = 'success' | 'failed';
type ShareResponse = 'success' | 'failed';
type CopyToClipboardResponse = 'success' | 'failed';
type VibrateResponse = 'success' | 'failed';
// todo: remove duplicates
type ResponseType = 'success' | 'failed';

type BridgeInvoke<T extends EInvokeRequest, R> = (method: T, data?: {}) => Promise<R>;

interface BridgeStorage {
  setItem: SetItemType,
  getItem: GetItemType,
  clear: ClearType
}

interface AituBridge {
  version: string;
  invoke: BridgeInvoke<EInvokeRequest, ResponseObject>;
  storage: BridgeStorage;
  getMe: () => Promise<GetMeResponse>;
  getPhone: () => Promise<GetPhoneResponse>;
  getContacts: () => Promise<GetContactsResponse>;
  getGeo: () => Promise<GetGeoResponse>;
  selectContact: () => Promise<SelectContactResponse>;
  getQr: () => Promise<string>;
  getSMSCode: () => Promise<string>;
  getUserProfile: (userId: string) => Promise<GetUserProfileResponse>;
  share: (text: string) => Promise<ShareResponse>;
  setTitle: (text: string) => Promise<ResponseType>;
  copyToClipboard: (text: string) => Promise<CopyToClipboardResponse>;
  shareImage: (text: string, image: string) => Promise<ShareResponse>;
  shareFile: (text: string, filename: string, base64Data: string) => Promise<ShareResponse>;
  enableNotifications: () => Promise<{}>;
  disableNotifications: () => Promise<{}>;
  openSettings: () => Promise<OpenSettingsResponse>;
  closeApplication: () => Promise<ResponseType>;
  setShakeHandler: (handler: any) => void;
  setTabActiveHandler: (handler: (tabname: string) => void) => void;
  vibrate: (pattern: number[]) => Promise<VibratePattern>;
  isSupported: () => boolean;
  supports: (method: string) => boolean;
  sub: any;
  enableScreenCapture: () => Promise<{}>;
  disableScreenCapture: () => Promise<{}>;
  setHeaderMenuItems: (items: Array<HeaderMenuItem>) => Promise<ResponseType>;
  setHeaderMenuItemClickHandler: (handler: HeaderMenuItemClickHandlerType) => void;
  setCustomBackArrowMode: (enabled: boolean) => Promise<ResponseType>;
  getCustomBackArrowMode: () => Promise<boolean>;
  setCustomBackArrowVisible: (visible: boolean) => Promise<ResponseType>;
  setCustomBackArrowOnClickHandler: (handler: BackArrowClickHandlerType) => void;
}

const invokeMethod = 'invoke';
const storageMethod = 'storage';
const getGeoMethod = 'getGeo';
const getQrMethod = 'getQr';
const getSMSCodeMethod = 'getSMSCode';
const selectContactMethod = 'selectContact';
const openSettingsMethod = 'openSettings';
const closeApplicationMethod = 'closeApplication';
const shareMethod = 'share';
const setTitleMethod = 'setTitle';
const copyToClipboardMethod = 'copyToClipboard';
const shareImageMethod = 'shareImage';
const shareFileMethod = 'shareFile';
const setShakeHandlerMethod = 'setShakeHandler';
const vibrateMethod = 'vibrate';
const enableScreenCaptureMethod = 'enableScreenCapture';
const disableScreenCaptureMethod = 'disableScreenCapture';
const setTabActiveHandlerMethod = 'setTabActiveHandler';
const setHeaderMenuItemsMethod = 'setHeaderMenuItems';
const setHeaderMenuItemClickHandlerMethod = 'setHeaderMenuItemClickHandler';
const setCustomBackArrowModeMethod = 'setCustomBackArrowMode';
const getCustomBackArrowModeMethod = 'getCustomBackArrowMode';
const setCustomBackArrowVisibleMethod = 'setCustomBackArrowVisible';
const setCustomBackArrowOnClickHandlerMethod = 'setCustomBackArrowOnClickHandler';

const android = typeof window !== 'undefined' && (window as any).AndroidBridge;
const ios = typeof window !== 'undefined' && (window as any).webkit && (window as any).webkit.messageHandlers;
const web = typeof window !== 'undefined' && (window.top !== window) && ((window as any).WebBridge = (window as any).WebBridge || {});

if (web) {
  const aituOrigin = (window as any).AITU_ORIGIN || 'https://aitu.io';

  [invokeMethod, storageMethod, getGeoMethod].forEach((method) => {
    if (!web[method]) {
      web[method] = (...args) => window.top.postMessage(JSON.stringify({
        method,
        payload: args,
      }), aituOrigin);
    }
  });

  window.addEventListener('message', (event) => {
    if (event.origin === aituOrigin && event.data) {
      try {
        const detail = JSON.parse(event.data);
        window.dispatchEvent(new CustomEvent('aituEvents', { detail }));
      } catch (e) { }
    }
  });
}

const buildBridge = (): AituBridge => {
  const subs = [];

  if (typeof window !== 'undefined') {
    window.addEventListener('aituEvents', (e: any) => {
      [...subs].map((fn) => fn.call(null, e));
    })
  }

  const invoke = (reqId, method, data = {}) => {
    const isAndroid = android && android[invokeMethod];
    const isIos = ios && ios[invokeMethod];
    const isWeb = web && web[invokeMethod];

    if (isAndroid) {
      android[invokeMethod](reqId, method, JSON.stringify(data));
    } else if (isIos) {
      ios[invokeMethod].postMessage({ reqId, method, data });
    } else if (isWeb) {
      web[invokeMethod](reqId, method, data);
    } else if (typeof window !== 'undefined') {
      console.log('--invoke-isUnknown');
    }
  };

  const storage = (reqId, method, data = {}) => {
    const isAndroid = android && android[storageMethod];
    const isIos = ios && ios[storageMethod];
    const isWeb = web && web[storageMethod];

    if (isAndroid) {
      android[storageMethod](reqId, method, JSON.stringify(data));
    } else if (isIos) {
      ios[storageMethod].postMessage({ reqId, method, data });
    } else if (isWeb) {
      web[storageMethod](reqId, method, data);
    } else if (typeof window !== 'undefined') {
      console.log('--storage-isUnknown');
    }
  }

  const getGeo = (reqId) => {
    const isAndroid = android && android[getGeoMethod];
    const isIos = ios && ios[getGeoMethod];
    const isWeb = web && web[getGeoMethod];

    if (isAndroid) {
      android[getGeoMethod](reqId);
    } else if (isIos) {
      ios[getGeoMethod].postMessage({ reqId });
    } else if(isWeb){
      web[getGeoMethod](reqId);
    } else if (typeof window !== 'undefined') {
      console.log('--getGeo-isUnknown');
    }
  }

  const getQr = (reqId) => {
    const isAndroid = android && android[getQrMethod];
    const isIos = ios && ios[getQrMethod];

    if (isAndroid) {
      android[getQrMethod](reqId);
    } else if (isIos) {
      ios[getQrMethod].postMessage({ reqId });
    } else if (typeof window !== 'undefined') {
      console.log('--getQr-isWeb');
    }
  }

  const getSMSCode = (reqId) => {
    const isAndroid = android && android[getSMSCodeMethod];
    const isIos = ios && ios[getSMSCodeMethod];

    if (isAndroid) {
      android[getSMSCodeMethod](reqId);
    } else if (isIos) {
      ios[getSMSCodeMethod].postMessage({ reqId });
    } else if (typeof window !== 'undefined') {
      console.log('--getSMSCode-isWeb');
    }
  }

  const selectContact = (reqId) => {
    const isAndroid = android && android[selectContactMethod];
    const isIos = ios && ios[selectContactMethod];

    if (isAndroid) {
      android[selectContactMethod](reqId);
    } else if (isIos) {
      ios[selectContactMethod].postMessage({ reqId });
    } else if (typeof window !== 'undefined') {
      console.log('--selectContact-isWeb');
    }
  }

  const openSettings = (reqId) => {
    const isAndroid = android && android[openSettingsMethod];
    const isIos = ios && ios[openSettingsMethod];

    if (isAndroid) {
      android[openSettingsMethod](reqId);
    } else if (isIos) {
      ios[openSettingsMethod].postMessage({ reqId });
    } else if (typeof window !== 'undefined') {
      console.log('--openSettings-isWeb');
    }
  }

  const closeApplication = (reqId) => {
    const isAndroid = android && android[closeApplicationMethod];
    const isIos = ios && ios[closeApplicationMethod];

    if (isAndroid) {
      android[closeApplicationMethod](reqId);
    } else if (isIos) {
      ios[closeApplicationMethod].postMessage({ reqId });
    } else if (typeof window !== 'undefined') {
      console.log('--closeApplication-isWeb');
    }
  }

  const share = (reqId, text) => {
    const isAndroid = android && android[shareMethod];
    const isIos = ios && ios[shareMethod];

    if (isAndroid) {
      android[shareMethod](reqId, text);
    } else if (isIos) {
      ios[shareMethod].postMessage({ reqId, text });
    } else if (typeof window !== 'undefined') {
      console.log('--share-isWeb');
    }
  }

  const setTitle = (reqId, text) => {
    const isAndroid = android && android[setTitleMethod];
    const isIos = ios && ios[setTitleMethod];

    if (isAndroid) {
      android[setTitleMethod](reqId, text);
    } else if (isIos) {
      ios[setTitleMethod].postMessage({ reqId, text });
    } else if (typeof window !== 'undefined') {
      console.log('--setTitle-isWeb');
    }
  }

  const copyToClipboard = (reqId, text) => {
    const isAndroid = android && android[copyToClipboardMethod];
    const isIos = ios && ios[copyToClipboardMethod];

    if (isAndroid) {
      android[copyToClipboardMethod](reqId, text);
    } else if (isIos) {
      ios[copyToClipboardMethod].postMessage({ reqId, text });
    } else if (typeof window !== 'undefined') {
      console.log('--copyToClipboard-isWeb');
    }
  }

  const enableScreenCapture = (reqId) => {
    const isAndroid = android && android[enableScreenCaptureMethod];
    const isIos = ios && ios[enableScreenCaptureMethod];

    if (isAndroid) {
      android[enableScreenCaptureMethod](reqId);
    } else if (isIos) {
      ios[enableScreenCaptureMethod].postMessage({ reqId });
    } else if (typeof window !== 'undefined') {
      console.log('--enableScreenCapture-isWeb');
    }
  }

  const disableScreenCapture = (reqId) => {
    const isAndroid = android && android[disableScreenCaptureMethod];
    const isIos = ios && ios[disableScreenCaptureMethod];

    if (isAndroid) {
      android[disableScreenCaptureMethod](reqId);
    } else if (isIos) {
      ios[disableScreenCaptureMethod].postMessage({ reqId });
    } else if (typeof window !== 'undefined') {
      console.log('--disableScreenCapture-isWeb');
    }
  }

  const shareImage = (reqId, text, image) => {
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
    const ext = image.split(';')[0].split('/')[1];
    const filename = 'image.' + ext;
    // remove mime type
    const base64Data = image.substr(image.indexOf(',') + 1);

    if (isAndroid) {
      android[shareFileMethod](reqId, text, filename, base64Data);
    } else if (isIos) {
      ios[shareFileMethod].postMessage({ reqId, text, filename, base64Data });
    } else if (typeof window !== 'undefined') {
      console.log('--shareFile-isWeb');
    }
  }

  const shareFile = (reqId, text, filename, base64Data) => {
    const isAndroid = android && android[shareFileMethod];
    const isIos = ios && ios[shareFileMethod];

    if (isAndroid) {
      android[shareFileMethod](reqId, text, filename, base64Data);
    } else if (isIos) {
      ios[shareFileMethod].postMessage({ reqId, text, filename, base64Data });
    } else if (typeof window !== 'undefined') {
      console.log('--shareFile-isWeb');
    }
  }

  const enableNotifications = () => invokePromise(EInvokeRequest.enableNotifications);

  const disableNotifications = () => invokePromise(EInvokeRequest.disableNotifications);

  const setShakeHandler = (handler) => {
    const isAndroid = android && android[setShakeHandlerMethod];
    const isIos = ios && ios[setShakeHandlerMethod];

    if (isAndroid || isIos) {
      (window as any).onAituBridgeShake = handler;
    } else if (typeof window !== 'undefined') {
      console.log('--setShakeHandler-isWeb');
    }
  };

  const setTabActiveHandler = (handler: (tabname: string) => void) => {
    const isAndroid = android && android[setTabActiveHandlerMethod];
    const isIos = ios && ios[setTabActiveHandlerMethod];

    if (isAndroid || isIos) {
      (window as any).onAituBridgeTabActive = handler;
    } else if (typeof window !== 'undefined') {
      console.log('--setTabActiveHandler-isWeb');
    }
  };

  const vibrate = (reqId, pattern) => {
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
    } else if (typeof window !== 'undefined') {
      console.log('--vibrate-isWeb');
    }
  }

  const isSupported = () => {
    const iosSup = ios && (window as any).webkit.messageHandlers.invoke;
    return Boolean(android || iosSup || web);
  }

  const supports = (method) =>
    (android && typeof android[method] === 'function') ||
    (ios && ios[method] && typeof ios[method].postMessage === 'function') ||
    (web && typeof web[method] === 'function');

  const sub = (listener: any) => {
    subs.push(listener);
  }

  const setHeaderMenuItems = (reqId, items: Array<HeaderMenuItem>) => {
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
    } else if (typeof window !== 'undefined') {
      console.log('--setHeaderMenuItems-isWeb');
    }
  }

  const setHeaderMenuItemClickHandler = (handler: HeaderMenuItemClickHandlerType) => {
    const isAndroid = android && android[setHeaderMenuItemClickHandlerMethod];
    const isIos = ios && ios[setHeaderMenuItemClickHandlerMethod];

    if (isAndroid || isIos) {
      (window as any).onAituBridgeHeaderMenuItemClick = handler;
    } else if (typeof window !== 'undefined') {
      console.log('--setHeaderMenuItemClickHandler-isWeb');
    }
  }

  const setCustomBackArrowMode = (reqId, enabled: boolean) => {
    const isAndroid = android && android[setCustomBackArrowModeMethod];
    const isIos = ios && ios[setCustomBackArrowModeMethod];

    if (isAndroid) {
      android[setCustomBackArrowModeMethod](reqId, enabled);
    } else if (isIos) {
      ios[setCustomBackArrowModeMethod].postMessage({ reqId, enabled });
    } else if (typeof window !== 'undefined') {
      console.log('--setCustomBackArrowMode-isWeb');
    }
  }

  const getCustomBackArrowMode = (reqId) => {
    const isAndroid = android && android[getCustomBackArrowModeMethod];
    const isIos = ios && ios[getCustomBackArrowModeMethod];

    if (isAndroid) {
      android[getCustomBackArrowModeMethod](reqId);
    } else if (isIos) {
      ios[getCustomBackArrowModeMethod].postMessage({ reqId });
    } else if (typeof window !== 'undefined') {
      console.log('--getCustomBackArrowMode-isWeb');
    }
  }

  const setCustomBackArrowVisible = (reqId, visible: boolean) => {
    const isAndroid = android && android[setCustomBackArrowVisibleMethod];
    const isIos = ios && ios[setCustomBackArrowVisibleMethod];

    if (isAndroid) {
      android[setCustomBackArrowVisibleMethod](reqId, visible);
    } else if (isIos) {
      ios[setCustomBackArrowVisibleMethod].postMessage({ reqId, visible });
    } else if (typeof window !== 'undefined') {
      console.log('--setCustomBackArrowVisible-isWeb');
    }
  }

  const setCustomBackArrowOnClickHandler = (handler: BackArrowClickHandlerType) => {
    const isAndroid = android && android[setCustomBackArrowOnClickHandlerMethod];
    const isIos = ios && ios[setCustomBackArrowOnClickHandlerMethod];

    if (isAndroid || isIos) {
      (window as any).onAituBridgeBackArrowClick = handler;
    } else if (typeof window !== 'undefined') {
      console.log('--setCustomBackArrowOnClickHandler-isWeb');
    }
  }

  const invokePromise = promisifyInvoke(invoke, sub);
  const storagePromise = promisifyStorage(storage, sub);
  const getGeoPromise = promisifyMethod(getGeo, sub);
  const getQrPromise = promisifyMethod(getQr, sub);
  const getSMSCodePromise = promisifyMethod(getSMSCode, sub);
  const selectContactPromise = promisifyMethod(selectContact, sub);
  const openSettingsPromise = promisifyMethod(openSettings, sub);
  const closeApplicationPromise = promisifyMethod(closeApplication, sub);
  const sharePromise = promisifyMethod(share, sub);
  const setTitlePromise = promisifyMethod(setTitle, sub);
  const copyToClipboardPromise = promisifyMethod(copyToClipboard, sub);
  const shareImagePromise = promisifyMethod(shareImage, sub);
  const shareFilePromise = promisifyMethod(shareFile, sub);
  const vibratePromise = promisifyMethod(vibrate, sub);
  const enableScreenCapturePromise = promisifyMethod(enableScreenCapture, sub);
  const disableScreenCapturePromise = promisifyMethod(disableScreenCapture, sub);
  const setHeaderMenuItemsPromise = promisifyMethod(setHeaderMenuItems, sub);
  const setCustomBackArrowModePromise = promisifyMethod(setCustomBackArrowMode, sub);
  const getCustomBackArrowModePromise = promisifyMethod(getCustomBackArrowMode, sub);
  const setCustomBackArrowVisiblePromise = promisifyMethod(setCustomBackArrowVisible, sub);

  return {
    version: String(LIB_VERSION),
    copyToClipboard: copyToClipboardPromise,
    invoke: invokePromise,
    storage: storagePromise,
    getMe: () => invokePromise(EInvokeRequest.getMe),
    getPhone: () => invokePromise(EInvokeRequest.getPhone),
    getContacts: () => invokePromise(EInvokeRequest.getContacts),
    getGeo: getGeoPromise,
    getQr: getQrPromise,
    getSMSCode: getSMSCodePromise,
    getUserProfile: (id: string) => invokePromise(EInvokeRequest.getUserProfile, { id }),
    selectContact: selectContactPromise,
    enableNotifications,
    disableNotifications,
    openSettings: openSettingsPromise,
    closeApplication: closeApplicationPromise,
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
    enableScreenCapture: enableScreenCapturePromise,
    disableScreenCapture: disableScreenCapturePromise,
    setHeaderMenuItems: setHeaderMenuItemsPromise,
    setHeaderMenuItemClickHandler,
    setCustomBackArrowMode: setCustomBackArrowModePromise,
    getCustomBackArrowMode: getCustomBackArrowModePromise,
    setCustomBackArrowVisible: setCustomBackArrowVisiblePromise,
    setCustomBackArrowOnClickHandler,
  }
}

const bridge = buildBridge();

export default bridge;
