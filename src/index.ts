import { LIB_VERSION } from './version';

import {
  promisifyMethod,
  promisifyStorage,
  promisifyInvoke,
} from './utils'

import WebBridge from './webBridge';

enum EInvokeRequest {
  getMe = 'GetMe',
  getPhone = 'GetPhone',
  getContacts = 'GetContacts',
  getUserProfile = 'GetUserProfile',
  enableNotifications = 'AllowNotifications',
  disableNotifications = 'DisableNotifications',
  enablePrivateMessaging = 'EnablePrivateMessaging',
  disablePrivateMessaging = 'DisablePrivateMessaging',
}

type SetItemType = (keyName: string, keyValue: string) => Promise<void>;
type GetItemType = (keyName: string) => Promise<string | null>;
type ClearType = () => Promise<void>;

type HeaderMenuItemClickHandlerType = (id: string) => Promise<void>;
type BackArrowClickHandlerType = () => Promise<void>;

export interface GetPhoneResponse {
  phone: string;
  sign: string;
}

export interface GetMeResponse {
  name: string;
  lastname: string;
  id: string;
  avatar?: string;
  avatarThumb?: string;
  notifications_allowed: boolean;
  private_messaging_enabled: boolean;
  sign: string;
}

export interface ResponseObject {
  phone?: string;
  name?: string;
  lastname?: string;
}

export interface GetGeoResponse {
  latitude: number;
  longitude: number;
}

export interface GetContactsResponse {
  contacts: Array<{
    first_name: string;
    last_name: string;
    phone: string;
  }>;
  sign: string;
}

export interface SelectContactResponse {
  phone: string;
  name: string;
  lastname: string;
}

export interface GetUserProfileResponse {
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
  Filter = "Filter",
  Close = "Close",
  SystemNotifications = "SystemNotifications"
}

export enum NavigationItemMode {
  SystemBackArrow = "SystemBackArrow",
  CustomBackArrow = "CustomBackArrow",
  NoItem = "NoItem",
  UserProfile = "UserProfile",
}

export interface HeaderMenuItem {
  id: string;
  icon: HeaderMenuIcon;
  badge?: string;
}

export interface UserStepsPerDay {
  date: string;
  steps: number;
}

export interface UserStepInfoResponse {
  steps: UserStepsPerDay[];
}

type OpenSettingsResponse = 'success' | 'failed';
type ShareResponse = 'success' | 'failed';
type CopyToClipboardResponse = 'success' | 'failed';
type VibrateResponse = 'success' | 'failed';
// todo: remove duplicates
type ResponseType = 'success' | 'failed';
type BiometryResponse = 'success' | 'failed' | 'unavailable' | 'cancelled';

type BridgeInvoke<T extends EInvokeRequest, R> = (method: T, data?: {}) => Promise<R>;

interface BridgeStorage {
  setItem: SetItemType,
  getItem: GetItemType,
  clear: ClearType
}

export interface AituBridge {
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
  enablePrivateMessaging: (appId: string) => Promise<string>;
  disablePrivateMessaging: (appId: string) => Promise<string>;
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
  openPayment: (transactionId: string) => Promise<ResponseType>;
  setCustomBackArrowOnClickHandler: (handler: BackArrowClickHandlerType) => void;
  checkBiometry: () => Promise<BiometryResponse>;
  openExternalUrl: (url: string) => Promise<ResponseType>;
  enableSwipeBack: () => Promise<ResponseType>;
  disableSwipeBack: () => Promise<ResponseType>;
  setNavigationItemMode: (mode: NavigationItemMode) => Promise<void>;
  getNavigationItemMode: () => Promise<NavigationItemMode>;
  getUserStepInfo: () => Promise<UserStepInfoResponse>;
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
const openPaymentMethod = 'openPayment'
const setCustomBackArrowOnClickHandlerMethod = 'setCustomBackArrowOnClickHandler';
const checkBiometryMethod = 'checkBiometry';
const openExternalUrlMethod = 'openExternalUrl';
const enableSwipeBackMethod = 'enableSwipeBack';
const disableSwipeBackMethod = 'disableSwipeBack';
const setNavigationItemModeMethod = 'setNavigationItemMode';
const getNavigationItemModeMethod = 'getNavigationItemMode';
const getUserStepInfoMethod = 'getUserStepInfo';

const android = typeof window !== 'undefined' && (window as any).AndroidBridge;
const ios = typeof window !== 'undefined' && (window as any).webkit && (window as any).webkit.messageHandlers;
const web = typeof window !== 'undefined' && (window.top !== window) && WebBridge;

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

    if (isAndroid) {
      android[invokeMethod](reqId, method, JSON.stringify(data));
    } else if (isIos) {
      ios[invokeMethod].postMessage({ reqId, method, data });
    } else if (web) {
      web.execute(invokeMethod, reqId, method, data)
    } else if (typeof window !== 'undefined') {
      console.log('--invoke-isUnknown');
    }
  };

  const storage = (reqId, method, data = {}) => {
    const isAndroid = android && android[storageMethod];
    const isIos = ios && ios[storageMethod];

    if (isAndroid) {
      android[storageMethod](reqId, method, JSON.stringify(data));
    } else if (isIos) {
      ios[storageMethod].postMessage({ reqId, method, data });
    } else if (web) {
      web.execute(storageMethod, reqId, method, data);
    } else if (typeof window !== 'undefined') {
      console.log('--storage-isUnknown');
    }
  }

  const getGeo = (reqId) => {
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
  }

  const getQr = (reqId) => {
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
  }

  const getSMSCode = (reqId) => {
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
  }

  const selectContact = (reqId) => {
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
  }

  const openSettings = (reqId) => {
    const isAndroid = android && android[openSettingsMethod];
    const isIos = ios && ios[openSettingsMethod];

    if (isAndroid) {
      android[openSettingsMethod](reqId);
    } else if (isIos) {
      ios[openSettingsMethod].postMessage({ reqId });
    } else if (web) {
      web.execute(openSettingsMethod, reqId);
    } else if (typeof window !== 'undefined') {
      console.log('--openSettings-isUnknown');
    }
  }

  const closeApplication = (reqId) => {
    const isAndroid = android && android[closeApplicationMethod];
    const isIos = ios && ios[closeApplicationMethod];

    if (isAndroid) {
      android[closeApplicationMethod](reqId);
    } else if (isIos) {
      ios[closeApplicationMethod].postMessage({ reqId });
    } else if (web) {
      web.execute(closeApplicationMethod, reqId);
    } else if (typeof window !== 'undefined') {
      console.log('--closeApplication-isUnknown');
    }
  }

  const share = (reqId, text) => {
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
  }

  const setTitle = (reqId, text) => {
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
  }

  const copyToClipboard = (reqId, text) => {
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
  }

  const enableScreenCapture = (reqId) => {
    const isAndroid = android && android[enableScreenCaptureMethod];
    const isIos = ios && ios[enableScreenCaptureMethod];

    if (isAndroid) {
      android[enableScreenCaptureMethod](reqId);
    } else if (isIos) {
      ios[enableScreenCaptureMethod].postMessage({ reqId });
    } else if (web) {
      web.execute(enableScreenCaptureMethod, reqId);
    } else if (typeof window !== 'undefined') {
      console.log('--enableScreenCapture-isUnknown');
    }
  }

  const disableScreenCapture = (reqId) => {
    const isAndroid = android && android[disableScreenCaptureMethod];
    const isIos = ios && ios[disableScreenCaptureMethod];

    if (isAndroid) {
      android[disableScreenCaptureMethod](reqId);
    } else if (isIos) {
      ios[disableScreenCaptureMethod].postMessage({ reqId });
    } else if (web) {
      web.execute(disableScreenCaptureMethod, reqId);
    } else if (typeof window !== 'undefined') {
      console.log('--disableScreenCapture-isUnknown');
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
    } else if (web) {
      web.execute(shareFileMethod, reqId, { text, filename, base64Data });
    } else if (typeof window !== 'undefined') {
      console.log('--shareFile-isUnknown');
    }
  }

  const shareFile = (reqId, text, filename, base64Data) => {
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
  }

  const enableNotifications = () => invokePromise(EInvokeRequest.enableNotifications);

  const disableNotifications = () => invokePromise(EInvokeRequest.disableNotifications);

  const setShakeHandler = (handler) => {
    const isAndroid = android && android[setShakeHandlerMethod];
    const isIos = ios && ios[setShakeHandlerMethod];

    if (isAndroid || isIos || web) {
      (window as any).onAituBridgeShake = handler;
    } else if (typeof window !== 'undefined') {
      console.log('--setShakeHandler-isUnknown');
    }
  };

  const setTabActiveHandler = (handler: (tabname: string) => void) => {
    const isAndroid = android && android[setTabActiveHandlerMethod];
    const isIos = ios && ios[setTabActiveHandlerMethod];

    if (isAndroid || isIos || web) {
      (window as any).onAituBridgeTabActive = handler;
    } else if (typeof window !== 'undefined') {
      console.log('--setTabActiveHandler-isUnknown');
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
    } else if (web) {
      web.execute(vibrateMethod, reqId, pattern);
    } else if (typeof window !== 'undefined') {
      console.log('--vibrate-isUnknown');
    }
  }

  const isSupported = () => {
    const iosSup = ios && (window as any).webkit.messageHandlers.invoke;
    return Boolean(android || iosSup || web);
  }

  // TODO: implement web support
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
    } else if (web) {
      web.execute(setHeaderMenuItemsMethod, reqId, itemsJsonArray);
    } else if (typeof window !== 'undefined') {
      console.log('--setHeaderMenuItems-isUnknown');
    }
  }

  const setHeaderMenuItemClickHandler = (handler: HeaderMenuItemClickHandlerType) => {
    const isAndroid = android && android[setHeaderMenuItemClickHandlerMethod];
    const isIos = ios && ios[setHeaderMenuItemClickHandlerMethod];

    if (isAndroid || isIos || web) {
      (window as any).onAituBridgeHeaderMenuItemClick = handler;
    } else if (typeof window !== 'undefined') {
      console.log('--setHeaderMenuItemClickHandler-isUnknown');
    }
  }

  /**
   * @deprecated данный метод не рекомендуется использовать
   * вместо него используйте setNavigationItemMode
   */
  const setCustomBackArrowMode = (reqId, enabled: boolean) => {
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
  }

  /**
   * @deprecated данный метод не рекомендуется использовать
   * вместо него используйте getNavigationItemMode
   */
  const getCustomBackArrowMode = (reqId) => {
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
  }

  /**
   * @deprecated данный метод не рекомендуется использовать
   * вместо него используйте setNavigationItemMode
   */
  const setCustomBackArrowVisible = (reqId, visible: boolean) => {
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
  }

  const setCustomBackArrowOnClickHandler = (handler: BackArrowClickHandlerType) => {
    const isAndroid = android && android[setCustomBackArrowOnClickHandlerMethod];
    const isIos = ios && ios[setCustomBackArrowOnClickHandlerMethod];

    if (isAndroid || isIos || web) {
      (window as any).onAituBridgeBackArrowClick = handler;
    } else if (typeof window !== 'undefined') {
      console.log('--setCustomBackArrowOnClickHandler-isUnknown');
    }
  }

  const openPayment = (reqId, transactionId: string) => {
    const isAndroid = android && android[openPaymentMethod];
    const isIos = ios && ios[openPaymentMethod];

    if (isAndroid) {
      android[openPaymentMethod](reqId, transactionId);
    } else if (isIos) {
      ios[openPaymentMethod].postMessage({ reqId, transactionId });
    } else {
      console.log('--openPayment-isUnknown');
    }
  }

  const checkBiometry = (reqId) => {
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
  }

  const openExternalUrl = (reqId, url: string) => {
    const isAndroid = android && android[openExternalUrlMethod];
    const isIos = ios && ios[openExternalUrlMethod];

    if (isAndroid) {
      android[openExternalUrlMethod](reqId, url);
    } else if (isIos) {
      ios[openExternalUrlMethod].postMessage({ reqId, url });
    } else {
      console.log("--openExternalUrlMethod-isUnknown");
    }
  };

  const enableSwipeBack = (reqId) => {
    const isAndroid = android && android[enableSwipeBackMethod];
    const isIos = ios && ios[enableSwipeBackMethod];

    if (isAndroid) {
      android[enableSwipeBackMethod](reqId);
    } else if (isIos) {
      ios[enableSwipeBackMethod].postMessage({ reqId });
    } else if (web) {
      web.execute(enableSwipeBackMethod, reqId);
    } else if (typeof window !== 'undefined') {
      console.log('--enableSwipeBack-isUnknown');
    }
  }

  const disableSwipeBack = (reqId) => {
    const isAndroid = android && android[disableSwipeBackMethod];
    const isIos = ios && ios[disableSwipeBackMethod];

    if (isAndroid) {
      android[disableSwipeBackMethod](reqId);
    } else if (isIos) {
      ios[disableSwipeBackMethod].postMessage({ reqId });
    } else if (web) {
      web.execute(disableSwipeBackMethod, reqId);
    } else if (typeof window !== 'undefined') {
      console.log('--disableSwipeBack-isUnknown');
    }
  }

  const setNavigationItemMode = (reqId, mode: NavigationItemMode) => {
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
  }

  const getNavigationItemMode = (reqId) => {
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
  }

  const getUserStepInfo = (reqId) => {
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
  }

  const invokePromise = promisifyInvoke(invoke, sub);
  const storagePromise = promisifyStorage(storage, sub);
  const getGeoPromise = promisifyMethod(getGeo, getGeoMethod, sub);
  const getQrPromise = promisifyMethod(getQr, getQrMethod, sub);
  const getSMSCodePromise = promisifyMethod(getSMSCode, getSMSCodeMethod, sub);
  const selectContactPromise = promisifyMethod(selectContact, selectContactMethod, sub);
  const openSettingsPromise = promisifyMethod(openSettings, openSettingsMethod, sub);
  const closeApplicationPromise = promisifyMethod(closeApplication, closeApplicationMethod, sub);
  const sharePromise = promisifyMethod(share, shareMethod, sub);
  const setTitlePromise = promisifyMethod(setTitle, setTitleMethod, sub);
  const copyToClipboardPromise = promisifyMethod(copyToClipboard, copyToClipboardMethod, sub);
  const shareImagePromise = promisifyMethod(shareImage, shareImageMethod, sub);
  const shareFilePromise = promisifyMethod(shareFile, shareFileMethod, sub);
  const vibratePromise = promisifyMethod(vibrate, vibrateMethod, sub);
  const enableScreenCapturePromise = promisifyMethod(enableScreenCapture, enableScreenCaptureMethod, sub);
  const disableScreenCapturePromise = promisifyMethod(disableScreenCapture, disableScreenCaptureMethod, sub);
  const setHeaderMenuItemsPromise = promisifyMethod(setHeaderMenuItems, setHeaderMenuItemsMethod, sub);
  const setCustomBackArrowModePromise = promisifyMethod(setCustomBackArrowMode, setCustomBackArrowModeMethod, sub);
  const getCustomBackArrowModePromise = promisifyMethod(getCustomBackArrowMode, getCustomBackArrowModeMethod, sub);
  const setCustomBackArrowVisiblePromise = promisifyMethod(setCustomBackArrowVisible, setCustomBackArrowVisibleMethod, sub);
  const openPaymentPromise = promisifyMethod(openPayment, openPaymentMethod, sub);
  const checkBiometryPromise = promisifyMethod(checkBiometry, checkBiometryMethod, sub);
  const openExternalUrlPromise = promisifyMethod(openExternalUrl, openExternalUrlMethod, sub);
  const enableSwipeBackPromise = promisifyMethod(enableSwipeBack, enableSwipeBackMethod, sub);
  const disableSwipeBackPromise = promisifyMethod(disableSwipeBack, disableSwipeBackMethod, sub);
  const setNavigationItemModePromise = promisifyMethod(setNavigationItemMode, setNavigationItemModeMethod, sub);
  const getNavigationItemModePromise = promisifyMethod(getNavigationItemMode, getNavigationItemModeMethod, sub);
  const getUserStepInfoPromise = promisifyMethod(getUserStepInfo, getUserStepInfoMethod, sub);

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
    getUserProfile: (id: string) =>
      invokePromise(EInvokeRequest.getUserProfile, { id }),
    selectContact: selectContactPromise,
    enableNotifications,
    disableNotifications,
    enablePrivateMessaging: (appId: string) =>
      invokePromise(EInvokeRequest.enablePrivateMessaging, { appId }),
    disablePrivateMessaging: (appId: string) =>
      invokePromise(EInvokeRequest.disablePrivateMessaging, { appId }),
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
    openPayment: openPaymentPromise,
    setCustomBackArrowOnClickHandler,
    checkBiometry: checkBiometryPromise,
    openExternalUrl: openExternalUrlPromise,
    enableSwipeBack: enableSwipeBackPromise,
    disableSwipeBack: disableSwipeBackPromise,
    setNavigationItemMode: setNavigationItemModePromise,
    getNavigationItemMode: getNavigationItemModePromise,
    getUserStepInfo: getUserStepInfoPromise,
  };
}

const bridge = buildBridge();

export default bridge;
