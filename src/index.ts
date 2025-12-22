import { promisifyMethod, promisifyStorage, promisifyInvoke } from './utils';

import WebBridge from './webBridge';
export * from './error';

declare const VERSION: string;

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
 * Represents a permission denied error.
 */
export interface PermissionDeniedError {
  code: 'permission_denied';
  msg: string;
  meta: {
    can_retry: boolean;
  };
}

/**
 * @public
 * Represents a vibration pattern response.
 */
export interface GetPhoneResponse {
  phone: string;
  sign: string;
}

/**
 * @public
 * Represents user information response.
 */
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

/**
 * @public
 * Represents a generic response object.
 */
export interface ResponseObject {
  phone?: string;
  name?: string;
  lastname?: string;
}

/**
 * @public
 * Represents a geographic location response.
 */
export interface GetGeoResponse {
  latitude: number;
  longitude: number;
}

/**
 * @public
 * Represents a contacts list response.
 */
export interface GetContactsResponse {
  contacts: Array<{
    first_name: string;
    last_name: string;
    phone: string;
  }>;
  sign: string;
}

/**
 * @public
 * Represents a selected contact response.
 */
export interface SelectContactResponse {
  phone: string;
  name: string;
  lastname: string;
}

/**
 * @public
 * Represents a user profile response.
 */
export interface GetUserProfileResponse {
  name: string;
  lastname?: string;
  phone?: string;
  avatar?: string;
  avatarThumb?: string;
}

const MAX_HEADER_MENU_ITEMS_COUNT = 3;

/**
 * @public
 * Represents header menu item icons.
 */
export enum HeaderMenuIcon {
  Search = 'Search',
  ShoppingCart = 'ShoppingCart',
  Menu = 'Menu',
  Share = 'Share',
  Notifications = 'Notifications',
  Help = 'Help',
  Error = 'Error',
  Person = 'Person',
  Sort = 'Sort',
  Filter = 'Filter',
  Close = 'Close',
  SystemNotifications = 'SystemNotifications',
}

/**
 * @public
 * Represents navigation item display modes.
 */
export enum NavigationItemMode {
  SystemBackArrow = 'SystemBackArrow',
  CustomBackArrow = 'CustomBackArrow',
  NoItem = 'NoItem',
  UserProfile = 'UserProfile',
}

/**
 * @public
 * Represents a vibration pattern response.
 */
export interface HeaderMenuItem {
  id: string;
  icon: HeaderMenuIcon;
  badge?: string;
}

/**
 * @public
 * Represents a vibration pattern response.
 */
export interface UserStepsPerDay {
  date: string;
  steps: number;
}

/**
 * @public
 * Represents a user step information response.
 */
export interface UserStepInfoResponse {
  steps: UserStepsPerDay[];
}

/**
 * @public
 * Represents a successful response.
 */
export type SuccessResponse = 'success';

/**
 * @public
 * Represents the status of a response.
 *
 * - `success` — The operation completed successfully.
 * - `failed` — The operation failed.
 */
export type ResponseType = SuccessResponse | 'failed';

/**
 * @public
 * Represents biometry check response.
 */
type BiometryResponse = ResponseType | 'unavailable' | 'cancelled';

/**
 * @public
 * Represents passport data read from an NFC chip.
 */
export interface PassportDataResponse {
  documentNumber: string;
  dateOfBirth: string;
  dateOfExpiry: string;
  firstName: string;
  lastName: string;
  gender: string;
  nationality: string;
  documentType: string;
}

type BridgeInvoke<T extends EInvokeRequest, R> = (method: T, data?: {}) => Promise<R>;

interface BridgeStorage {
  setItem: SetItemType;
  getItem: GetItemType;
  clear: ClearType;
}

/**
 * @public
 * Main interface for interacting with the Aitu Bridge API.
 */
export interface AituBridge {
  /**
   * Version of the Aitu Bridge API available in SemVer format.
   */
  version: string;

  /**
   * Low-level bridge invocation method used internally
   * to communicate with native Aitu functionality.
   */
  invoke: BridgeInvoke<EInvokeRequest, ResponseObject>;

  /**
   * Provides access to persistent key-value storage
   * scoped to the current mini-app.
   */
  storage: BridgeStorage;

  /**
   * Returns basic information about the currently authorized user.
   * @returns A promise resolving to a {@link GetMeResponse} containing user details.
   */
  getMe: () => Promise<GetMeResponse>;

  /**
   * Requests the user's phone number after explicit user confirmation.
   * @returns A promise resolving to a {@link GetPhoneResponse} containing the phone number.
   */
  getPhone: () => Promise<GetPhoneResponse>;

  /**
   * Requests access to the user's contact list.
   * @returns A promise resolving to a {@link GetContactsResponse} containing the contacts.
   */
  getContacts: () => Promise<GetContactsResponse>;

  /**
   * Retrieves the user's current geographic location.
   * @returns A promise resolving to a {@link GetGeoResponse} containing latitude and longitude.
   */
  getGeo: () => Promise<GetGeoResponse>;

  /**
   * Opens the native contact picker UI and allows the user
   * to select a single contact.
   * @returns A promise resolving to a {@link SelectContactResponse} containing the selected contact details.
   */
  selectContact: () => Promise<SelectContactResponse>;

  /**
   * Opens the device camera and scans a QR code.
   * @returns A string with the result of scanning the QR code is returned.
   */
  getQr: () => Promise<string>;

  /**
   * Requests an SMS verification code from the user.
   * @returns A string with code is returned.
   */
  getSMSCode: () => Promise<string>;

  /**
   * Retrieves public profile information for a specific user.
   *
   * @param userId - Aitu user identifier
   * @returns A promise resolving to a {@link GetUserProfileResponse} containing the user's profile data.
   */
  getUserProfile: (userId: string) => Promise<GetUserProfileResponse>;
  /**
   * Opens the user's profile within the host application.
   * @returns A promise that resolves with a {@link ResponseType} indicating the result of the operation.
   */
  openUserProfile: () => Promise<ResponseType>;

  /**
   * Opens the system share dialog with a text payload.
   *
   * @param text - Text to share
   * @returns A promise resolving to a {@link ResponseType} indicating the result of the sharing operation.
   */
  share: (text: string) => Promise<ResponseType>;

  /**
   * Sets the title displayed in the mini-app header.
   *
   * @param text - Header title
   * @returns A promise resolving to a {@link ResponseType} indicating the result of the operation.
   */
  setTitle: (text: string) => Promise<ResponseType>;

  /**
   * Copies the specified text to the system clipboard.
   *
   * @param text - Text to copy
   * @returns A promise resolving to a {@link ResponseType} indicating the result of the copy operation.
   */
  copyToClipboard: (text: string) => Promise<ResponseType>;

  /**
   * Shares an image with an optional text description.
   *
   * @deprecated Use {@link shareFile} instead.
   * @param text - Description text
   * @param image - Image data encoded in Base64
   * @returns A promise resolving to a {@link ResponseType} indicating the result of the sharing operation.
   */
  shareImage: (text: string, image: string) => Promise<ResponseType>;

  /**
   * Shares a file via the system sharing interface.
   *
   * @param text - Description text
   * @param filename - Name of the file
   * @param base64Data - File data encoded in Base64
   * @returns A promise resolving to a {@link ResponseType} indicating the result of the sharing operation.
   */
  shareFile: (text: string, filename: string, base64Data: string) => Promise<ResponseType>;

  /**
   * Enables push notifications for the mini-app.
   */
  enableNotifications: () => Promise<{}>;

  /**
   * Disables push notifications for the mini-app.
   */
  disableNotifications: () => Promise<{}>;

  /**
   * Enables private messaging between the mini-app and the user.
   *
   * @param appId - Mini-app identifier
   */
  enablePrivateMessaging: (appId: string) => Promise<string>;

  /**
   * Disables private messaging between the mini-app and the user.
   *
   * @param appId - Mini-app identifier
   */
  disablePrivateMessaging: (appId: string) => Promise<string>;

  /**
   * Opens the Aitu application settings screen.
   * @returns A promise resolving to a ResponseType indicating the result of the operation.
   */
  openSettings: () => Promise<ResponseType>;

  /**
   * Closes the current mini-app.
   * @returns A promise resolving to a ResponseType indicating the result of the operation.
   */
  closeApplication: () => Promise<ResponseType>;

  /**
   * Registers a handler that is triggered when the device is shaken.
   * @param handler - Shake event handler
   */
  setShakeHandler: (handler: any) => void;

  /**
   * Registers a handler that is triggered when a tab becomes active.
   *
   * @param handler - Callback with active tab name
   */
  setTabActiveHandler: (handler: (tabname: string) => void) => void;

  /**
   * Triggers device vibration using a custom vibration pattern.
   *
   * @param pattern - Array of vibration durations in milliseconds
   * @returns A promise resolving to a {@link SuccessResponse} indicating the result of the vibration operation.
   */
  vibrate: (pattern: number[]) => Promise<SuccessResponse>;

  /**
   * Indicates whether the current environment supports Aitu Bridge.
   * @returns A boolean indicating support status.
   */
  isSupported: () => boolean;

  /**
   * Checks whether a specific bridge method is supported.
   *
   * @param method - Method name
   * @returns A boolean indicating support status.
   */
  supports: (method: string) => boolean;
  /**
   * Subscribes to Aitu Bridge events.
   */
  sub: any;

  /**
   * Enables protection against screenshots and screen recording.
   */
  enableScreenCapture: () => Promise<{}>;

  /**
   * Disables protection against screenshots and screen recording.
   */
  disableScreenCapture: () => Promise<{}>;

  /**
   * Sets custom menu items in the mini-app header.
   *
   * @param items - Header menu configuration
   * @returns A promise resolving to a ResponseType indicating the result of the operation.
   */
  setHeaderMenuItems: (items: Array<HeaderMenuItem>) => Promise<ResponseType>;

  /**
   * Registers a click handler for header menu items.
   * @param handler - Header menu item click handler
   */
  setHeaderMenuItemClickHandler: (handler: HeaderMenuItemClickHandlerType) => void;

  /**
   * Enables or disables custom back arrow handling.
   *
   * @param enabled - Whether custom handling is enabled
   * @returns A promise resolving to a ResponseType indicating the result of the operation.
   */
  setCustomBackArrowMode: (enabled: boolean) => Promise<ResponseType>;

  /**
   * Returns whether custom back arrow mode is enabled.
   * @returns A promise resolving to a boolean indicating the current mode.
   */
  getCustomBackArrowMode: () => Promise<boolean>;

  /**
   * Controls the visibility of the custom back arrow.
   *
   * @param visible - Arrow visibility state
   * @returns A promise resolving to a ResponseType indicating the result of the operation.
   */
  setCustomBackArrowVisible: (visible: boolean) => Promise<ResponseType>;
  /**
   * Opens the payment interface for a specified transaction.
   * @param transactionId
   * @returns A promise resolving to a ResponseType indicating the result of the payment operation.
   */
  openPayment: (transactionId: string) => Promise<ResponseType>;
  /**
   * Sets a custom handler for back arrow click events.
   * @param handler - Back arrow click handler
   */
  setCustomBackArrowOnClickHandler: (handler: BackArrowClickHandlerType) => void;
  /**
   * Checks biometric authentication status.
   * @returns  A promise resolving to a BiometryResponse indicating the result of the check.
   */
  checkBiometry: () => Promise<BiometryResponse>;

  /**
   * Opens an external URL outside the mini-app context.
   *
   * @param url - External URL to open
   * @returns A promise resolving to a ResponseType indicating the result of the operation.
   */
  openExternalUrl: (url: string) => Promise<ResponseType>;

  /**
   * Enables swipe-back navigation gesture.
   * @returns A promise that resolves when the gesture is enabled.
   */
  enableSwipeBack: () => Promise<ResponseType>;

  /**
   * Disables swipe-back navigation gesture.
   * @returns A promise that resolves when the gesture is disabled.
   */
  disableSwipeBack: () => Promise<ResponseType>;

  /**
   * Sets the navigation item display mode.
   *
   * @param mode - Navigation item mode
   * @returns A promise that resolves when the mode is set.
   */
  setNavigationItemMode: (mode: NavigationItemMode) => Promise<void>;

  /**
   * Returns the current navigation item mode.
   * @returns A promise resolving to the current NavigationItemMode.
   */
  getNavigationItemMode: () => Promise<NavigationItemMode>;

  /**
   * Retrieves step count data from HealthKit or Google Fit.
   * @returns A promise resolving to a UserStepInfoResponse containing the user's step data.
   */
  getUserStepInfo: () => Promise<UserStepInfoResponse>;

  /**
   * Checks whether eSIM is supported on the device.
   * @returns A promise resolving to a ResponseType indicating if eSIM is supported.
   */
  isESimSupported: () => Promise<ResponseType>;

  /**
   * Activates an eSIM using the provided activation code.
   *
   * @param activationCode - eSIM activation code
   * @returns A promise resolving to a ResponseType indicating the result of the activation.
   */
  activateESim: (activationCode: string) => Promise<ResponseType>;

  /**
   * Reads raw data from an NFC tag.
   * @returns A promise resolving to a string containing the raw NFC data.
   */
  readNFCData: () => Promise<string>;
  /**
   * Subscribes to user step updates from HealthKit/Google Fit.
   *
   * Establishes a real-time subscription that listens for step count changes
   * from the underlying health data provider. The promise resolves once the
   * subscription request has been processed. To stop receiving updates, call
   * {@link AituBridge.unsubscribeUserStepInfo}.
   *
   * @returns A promise that resolves with a `ResponseType` indicating
   *          whether the subscription was successfully created.
   */
  subscribeUserStepInfo: () => Promise<ResponseType>;
  /**
   * Unsubscribes from user step updates from HealthKit/Google Fit.
   *
   * Stops the active step-count subscription created by
   * {@link AituBridge.subscribeUserStepInfo}. Once unsubscribed, no further step updates
   * will be delivered.
   *
   * @returns A promise that resolves with a `ResponseType` indicating
   *          whether the unsubscription was successful.
   */
  unsubscribeUserStepInfo: () => Promise<ResponseType>;
  /**
   * Reads data from the NFC chip of an ePassport using BAC (Basic Access Control).
   *
   * Initiates a BAC-protected NFC read operation on an ePassport. The caller must
   * provide the passport number, date of birth, and expiration date—values taken
   * from the machine-readable zone (MRZ). These values are used to derive the
   * cryptographic access keys required by BAC to open a secure session with the
   * passport’s NFC chip.
   *
   * Once BAC is successfully established, the function retrieves data groups
   * from the chip, typically including the holder’s biographical information
   * (DG1) and, if supported and permitted, biometric data such as the facial
   * image (DG2).
   *
   * @param passportNumber - Passport number taken from the MRZ.
   * @param dateOfBirth - Holder’s date of birth (MRZ format: YYMMDD).
   * @param expirationDate - Passport expiration date (MRZ format: YYMMDD).
   *
   * @returns A promise resolving to a `PassportDataResponse` containing the decoded
   *          data groups read from the passport’s NFC chip.
   *
   * @throws {@link NFCPassportError} When an NFC passport operation fails. Possible codes:
   * - `nfc_passport_mismatch` — Passport does not match the provided MRZ values.
   * - `nfc_document_read_failure` — General failure to read the document.
   * - `nfc_session_timeout` — NFC session timed out before completion.
   * - `nfc_permission_denied` — NFC permission denied or NFC unavailable.
   * - `nfc_session_cancelled` — User cancelled the NFC session (iOS).
   */
  readNFCPassport: (passportNumber: string, dateOfBirth: string, expirationDate: string) => Promise<PassportDataResponse>;
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
const openPaymentMethod = 'openPayment';
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
const web = typeof window !== 'undefined' && window.top !== window && WebBridge;

const buildBridge = (): AituBridge => {
  const subs = [];

  if (typeof window !== 'undefined') {
    window.addEventListener('aituEvents', (e: any) => {
      [...subs].map((fn) => fn.call(null, e));
    });
  }

  const invoke = (reqId, method, data = {}) => {
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
  };

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
  };

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
  };

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
  };

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
  };

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
  };

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
  };

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
  };

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
  };

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
  };

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
  };

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
  };

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
  };

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
  };

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
  };

  const isSupported = () => {
    const iosSup = ios && (window as any).webkit.messageHandlers.invoke;
    return Boolean(android || iosSup || web);
  };

  // TODO: implement web support
  const supports = (method) =>
    (android && typeof android[method] === 'function') ||
    (ios && ios[method] && typeof ios[method].postMessage === 'function') ||
    (web && typeof web[method] === 'function');

  const sub = (listener: any) => {
    subs.push(listener);
  };

  const createMethod = <Params extends unknown[], Result>(
    name: string,
    options?: {
      transformToObject?: (args: Params) => Record<string, Params[number]>;
      isWebSupported?: boolean;
    }
  ) => {
    const method = (reqId: string, ...args: Params) => {
      const isAndroid = !!android && !!android[name];
      const isIos = !!ios && !!ios[name];
      const isWeb = !!options?.isWebSupported && !!web;

      if (isAndroid) {
        android[name](reqId, ...args);
      } else if (isIos) {
        ios[name].postMessage({
          reqId,
          ...options?.transformToObject?.(args),
        });
      } else if (isWeb) {
        web.execute(name as unknown as keyof AituBridge, reqId, ...args);
      } else if (typeof window !== 'undefined') {
        console.log(`--${name}-isUnknown`);
      }
    };

    return promisifyMethod(method, name, sub) as (...args: Params) => Promise<Result>;
  };

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
  };

  const setHeaderMenuItemClickHandler = (handler: HeaderMenuItemClickHandlerType) => {
    const isAndroid = android && android[setHeaderMenuItemClickHandlerMethod];
    const isIos = ios && ios[setHeaderMenuItemClickHandlerMethod];

    if (isAndroid || isIos || web) {
      (window as any).onAituBridgeHeaderMenuItemClick = handler;
    } else if (typeof window !== 'undefined') {
      console.log('--setHeaderMenuItemClickHandler-isUnknown');
    }
  };

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
  };

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
  };

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
  };

  const setCustomBackArrowOnClickHandler = (handler: BackArrowClickHandlerType) => {
    const isAndroid = android && android[setCustomBackArrowOnClickHandlerMethod];
    const isIos = ios && ios[setCustomBackArrowOnClickHandlerMethod];

    if (isAndroid || isIos || web) {
      (window as any).onAituBridgeBackArrowClick = handler;
    } else if (typeof window !== 'undefined') {
      console.log('--setCustomBackArrowOnClickHandler-isUnknown');
    }
  };

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
  };

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
  };

  const openExternalUrl = (reqId, url: string) => {
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
  };

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
  };

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
  };

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
  };

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
  };

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
  const isESimSupported = createMethod<never, ResponseType>('isESimSupported');
  const activateESim = createMethod<[activationCode: string], ResponseType>('activateESim', {
    transformToObject: ([activationCode]) => ({
      activationCode,
    }),
  });
  const readNFCData = createMethod<never, string>('readNFCData');

  const readNFCPassport = createMethod<[passportNumber: string, dateOfBirth: string, expirationDate: string], PassportDataResponse>(
    'readNFCPassport',
    {
      transformToObject: ([passportNumber, dateOfBirth, expirationDate]) => ({
        passportNumber,
        dateOfBirth,
        expirationDate,
      }),
    }
  );

  const subscribeUserStepInfo = createMethod<never, ResponseType>('subscribeUserStepInfo');

  const unsubscribeUserStepInfo = createMethod<never, ResponseType>('unsubscribeUserStepInfo');

  const openUserProfile = createMethod<never, ResponseType>('openUserProfile');

  return {
    version: VERSION,
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
    openUserProfile,
    selectContact: selectContactPromise,
    enableNotifications,
    disableNotifications,
    enablePrivateMessaging: (appId: string) => invokePromise(EInvokeRequest.enablePrivateMessaging, { appId }),
    disablePrivateMessaging: (appId: string) => invokePromise(EInvokeRequest.disablePrivateMessaging, { appId }),
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
    isESimSupported,
    activateESim,
    readNFCData,
    subscribeUserStepInfo,
    unsubscribeUserStepInfo,
    readNFCPassport,
  };
};

/**
 * @public
 * AituBridge instance for interacting with the Aitu mini-app environment.
 */
const bridge = buildBridge();

export default bridge;
