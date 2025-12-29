type NavigationItemModeValue = 'SystemBackArrow' | 'CustomBackArrow' | 'NoItem' | 'UserProfile';

type PostMessageMethod<T extends Record<string, unknown> = Record<string, unknown>> = {
  postMessage(data: T & { reqId: string }): void;
};

/**
 * @public
 * Represents a header menu item click handler.
 */
export type HeaderMenuItemClickHandlerType = (id: string) => Promise<void>;

/**
 * @public
 * Represents a back arrow click handler.
 */
export type BackArrowClickHandlerType = () => Promise<void>;

export type RequestMethods =
  | 'copyToClipboard'
  | 'invoke'
  | 'storage'
  | 'share'
  | 'getGeo'
  | 'getQr'
  | 'getSMSCode'
  | 'selectContact'
  | 'openSettings'
  | 'closeApplication'
  | 'setTitle'
  | 'enableScreenCapture'
  | 'disableScreenCapture'
  | 'vibrate'
  | 'setHeaderMenuItems'
  | 'shareFile'
  | 'getUserStepInfo'
  | 'getCustomBackArrowMode'
  | 'setCustomBackArrowMode'
  | 'setCustomBackArrowVisible'
  | 'openPayment'
  | 'checkBiometry'
  | 'openExternalUrl'
  | 'enableSwipeBack'
  | 'disableSwipeBack'
  | 'setNavigationItemMode'
  | 'getNavigationItemMode'
  | 'isESimSupported'
  | 'activateESim'
  | 'readNFCData'
  | 'readNFCPassport'
  | 'subscribeUserStepInfo'
  | 'unsubscribeUserStepInfo'
  | 'openUserProfile';

type AndroidBridgeShape<Methods extends string, T extends Record<Methods, unknown[]>> = {
  [P in keyof T]: (reqId: string, ...args: T[P]) => void;
};

type IosBridgeShape<Methods extends string, T extends Record<Methods, Record<string, unknown>>> = {
  [P in keyof T]: PostMessageMethod<T[P]>;
};

type HandlerMethodsMap = {
  setShakeHandler: (handler: (() => void) | null) => void;
  setTabActiveHandler: (handler: (tabname: string) => void) => void;
  setCustomBackArrowOnClickHandler: (handler: BackArrowClickHandlerType) => void;
  setHeaderMenuItemClickHandler: (handler: HeaderMenuItemClickHandlerType) => void;
};

export type AndroidBridge = AndroidBridgeShape<
  RequestMethods,
  {
    copyToClipboard: [text: string];
    invoke: [method: string, data: string];
    storage: [method: string, data: string];
    share: [text: string];
    getGeo: [];
    getQr: [];
    getSMSCode: [];
    selectContact: [];
    openSettings: [];
    closeApplication: [];
    setTitle: [title: string];
    enableScreenCapture: [];
    disableScreenCapture: [];
    vibrate: [pattern: string];
    setHeaderMenuItems: [itemsJsonArray: string];
    shareFile: [text: string, filename: string, base64Data: string];
    getUserStepInfo: [];
    getCustomBackArrowMode: [];
    setCustomBackArrowMode: [enabled: boolean];
    setCustomBackArrowVisible: [visible: boolean];
    openPayment: [transactionId: string];
    checkBiometry: [];
    openExternalUrl: [url: string];
    enableSwipeBack: [];
    disableSwipeBack: [];
    setNavigationItemMode: [mode: NavigationItemModeValue];
    getNavigationItemMode: [];
    isESimSupported: [];
    activateESim: [activationCode: string];
    readNFCData: [];
    readNFCPassport: [passportNumber: string, dateOfBirth: string, expirationDate: string];
    subscribeUserStepInfo: [];
    unsubscribeUserStepInfo: [];
    openUserProfile: [];
  }
> &
  HandlerMethodsMap;

type IosBridgeParamsMap = {
  copyToClipboard: { text: string };
  invoke: { method: string; data: unknown };
  storage: { method: string; data: unknown };
  share: { text: string };
  getGeo: {};
  getQr: {};
  getSMSCode: {};
  selectContact: {};
  openSettings: {};
  closeApplication: {};
  setTitle: { text: string };
  enableScreenCapture: {};
  disableScreenCapture: {};
  vibrate: { pattern: number[] };
  setHeaderMenuItems: { itemsJsonArray: string };
  shareFile: { text: string; filename: string; base64Data: string };
  getUserStepInfo: {};
  getCustomBackArrowMode: {};
  setCustomBackArrowMode: { enabled: boolean };
  setCustomBackArrowVisible: { visible: boolean };
  openPayment: { transactionId: string };
  checkBiometry: {};
  openExternalUrl: { url: string };
  enableSwipeBack: {};
  disableSwipeBack: {};
  setNavigationItemMode: { mode: NavigationItemModeValue };
  getNavigationItemMode: {};
  isESimSupported: {};
  activateESim: { activationCode: string };
  readNFCData: {};
  readNFCPassport: {
    passportNumber: string;
    dateOfBirth: string;
    expirationDate: string;
  };
  subscribeUserStepInfo: {};
  unsubscribeUserStepInfo: {};
  openUserProfile: {};
};

export type IosParams<F extends RequestMethods> = IosBridgeParamsMap[F];

export type IosBridge = IosBridgeShape<RequestMethods, IosBridgeParamsMap> & HandlerMethodsMap;

export type UnsafeAndroidBridge = {
  [K in RequestMethods]: (reqId: string, ...args: unknown[]) => void;
} & HandlerMethodsMap;

export type UnsafeIosBridge = {
  [key in RequestMethods]: PostMessageMethod<{ [key: string]: unknown }>;
} & HandlerMethodsMap;

/**
 * @public
 * Represents an event handler for Aitu bridge events.
 */
export type AituEventHandler = (event: WindowEventMap['aituEvents']) => void;

declare global {
  interface Window {
    onAituBridgeBackArrowClick?: BackArrowClickHandlerType;
    onAituBridgeShake?: (() => void) | null;
    onAituBridgeHeaderMenuItemClick?: HeaderMenuItemClickHandlerType;
    onAituBridgeTabActive?: (tabname: string) => void;
    AndroidBridge?: AndroidBridge;
    webkit?: {
      messageHandlers?: IosBridge;
    };
  }

  interface WindowEventMap {
    aituEvents: CustomEvent<{ reqId: string; data: unknown; status: number | null; error: unknown }>;
  }
}

/**
 * @public
 * Represents an error that can occur during NFC passport operations.
 */
export interface NFCPassportError {
  /**
   * Error code indicating the type of NFC passport issue.
   *
   * - `nfc_passport_mismatch` — The passport does not match the requested parameters
   *   (date of birth, passport number, expiration date).
   * - `nfc_document_read_failure` — Document reading error
   *   (read errors, algorithm errors, unknown algorithms, other documents that are not passports, etc.).
   * - `nfc_session_timeout` — Session timeout: the document reading was not completed
   *   in time (depends on the OS).
   * - `nfc_permission_denied` — The user denied NFC permission or the device has no NFC chip.
   * - `nfc_session_cancelled` — The user cancelled the NFC session (iOS).
   */
  code: 'nfc_passport_mismatch' | 'nfc_document_read_failure' | 'nfc_session_timeout' | 'nfc_permission_denied' | 'nfc_session_cancelled';

  /**
   * Human-readable error message describing the issue.
   */
  msg: string;
}

/**
 * @public
 * Represents an error indicating that the app URL does not match the expected value.
 */
export interface AppUrlDoesntMatchError {
  code: 'url_does_not_match';
  msg: string;
}

/**
 * @public
 * Represents a permission denied error.
 */
export interface PermissionDeniedError {
  code: 'permission_denied';
  msg: string;
  meta: {
    can_retry: boolean;
  };
}
