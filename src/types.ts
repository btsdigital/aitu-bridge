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
  setShakeHandler: AituBridge['setShakeHandler'];
  setTabActiveHandler: AituBridge['setTabActiveHandler'];
  setCustomBackArrowOnClickHandler: AituBridge['setCustomBackArrowOnClickHandler'];
  setHeaderMenuItemClickHandler: AituBridge['setHeaderMenuItemClickHandler'];
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

export type AituEvent = CustomEvent<{ reqId: string; data: unknown; status?: number; error: unknown }>;

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
    aituEvents: AituEvent;
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

/**
 * @public
 */
export enum EInvokeRequest {
  getMe = 'GetMe',
  getPhone = 'GetPhone',
  getContacts = 'GetContacts',
  getUserProfile = 'GetUserProfile',
  enableNotifications = 'AllowNotifications',
  disableNotifications = 'DisableNotifications',
  enablePrivateMessaging = 'EnablePrivateMessaging',
  disablePrivateMessaging = 'DisablePrivateMessaging',
}

/**
 * @public
 * Represents phone number response.
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
 * Represents a header menu item.
 */
export interface HeaderMenuItem {
  id: string;
  icon: HeaderMenuIcon;
  badge?: string;
}

/**
 * @public
 * Represents user steps per day.
 */
export interface UserStepsPerDay {
  /**
   * The date for which the number of steps was received, in the format DD.MM.YYYY.
   */
  date: string;
  /**
   * The number of steps taken by the user on the specified date.
   */
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
 * Represents biometry check response.
 */
export type BiometryResponse = SuccessResponse | 'unavailable' | 'cancelled';

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

/**
 * @public
 * Generic bridge invocation type.
 */
export type BridgeInvoke<T extends EInvokeRequest, R> = (method: T, data?: {}) => Promise<R>;

/**
 * @public
 * Interface for persistent key-value storage.
 */
export interface BridgeStorage {
  setItem: (keyName: string, keyValue: string) => Promise<void>;
  getItem: (keyName: string) => Promise<string | null>;
  clear: () => Promise<void>;
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
   * @returns A promise that resolves with a {@link SuccessResponse} indicating the result of the operation.
   */
  openUserProfile: () => Promise<SuccessResponse>;

  /**
   * Opens the system share dialog with a text payload.
   *
   * @param text - Text to share
   * @returns A promise resolving to a {@link SuccessResponse} indicating the result of the sharing operation.
   */
  share: (text: string) => Promise<SuccessResponse>;

  /**
   * Sets the title displayed in the mini-app header.
   *
   * @param text - Header title
   * @returns A promise resolving to a {@link SuccessResponse} indicating the result of the operation.
   */
  setTitle: (text: string) => Promise<SuccessResponse>;

  /**
   * Copies the specified text to the system clipboard.
   *
   * @param text - Text to copy
   * @returns A promise resolving to a {@link SuccessResponse} indicating the result of the copy operation.
   */
  copyToClipboard: (text: string) => Promise<SuccessResponse>;

  /**
   * Shares an image with an optional text description.
   *
   * @deprecated Use {@link AituBridge.shareFile} instead.
   * @param text - Description text
   * @param image - Image data encoded in Base64
   * @returns A promise resolving to a {@link SuccessResponse} indicating the result of the sharing operation.
   */
  shareImage: (text: string, image: string) => Promise<SuccessResponse>;

  /**
   * Shares a file via the system sharing interface.
   *
   * @param text - Description text
   * @param filename - Name of the file
   * @param base64Data - File data encoded in Base64
   * @returns A promise resolving to a {@link SuccessResponse} indicating the result of the sharing operation.
   */
  shareFile: (text: string, filename: string, base64Data: string) => Promise<SuccessResponse>;

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
   * @returns A promise resolving to a SuccessResponse indicating the result of the operation.
   */
  openSettings: () => Promise<SuccessResponse>;

  /**
   * Closes the current mini-app.
   * @returns A promise resolving to a SuccessResponse indicating the result of the operation.
   */
  closeApplication: () => Promise<SuccessResponse>;

  /**
   * Registers a handler that is triggered when the device is shaken.
   * @param handler - Shake event handler
   */
  setShakeHandler: (handler: (() => void) | null) => void;

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
  sub: (listener: AituEventHandler) => void;

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
   * @returns A promise resolving to a {@link SuccessResponse} indicating the result of the operation.
   */
  setHeaderMenuItems: (items: Array<HeaderMenuItem>) => Promise<SuccessResponse>;

  /**
   * Registers a click handler for header menu items.
   * @param handler - Header menu item click handler
   */
  setHeaderMenuItemClickHandler: (handler: HeaderMenuItemClickHandlerType) => void;

  /**
   * Enables or disables custom back arrow handling.
   *
   * @deprecated Use {@link AituBridge.setNavigationItemMode} instead.
   * @param enabled - Whether custom handling is enabled
   * @returns A promise resolving to a SuccessResponse indicating the result of the operation.
   */
  setCustomBackArrowMode: (enabled: boolean) => Promise<SuccessResponse>;

  /**
   * Returns whether custom back arrow mode is enabled.
   *
   * @deprecated Use {@link AituBridge.getNavigationItemMode} instead.
   * @returns A promise resolving to a boolean indicating the current mode.
   */
  getCustomBackArrowMode: () => Promise<boolean>;

  /**
   * Controls the visibility of the custom back arrow.
   *
   * @deprecated Use {@link AituBridge.setNavigationItemMode} instead.
   * @param visible - Arrow visibility state
   * @returns A promise resolving to a {@link SuccessResponse} indicating the result of the operation.
   */
  setCustomBackArrowVisible: (visible: boolean) => Promise<SuccessResponse>;
  /**
   * Opens the payment interface for a specified transaction.
   * @param transactionId - Transaction identifier
   * @returns A promise resolving to a {@link SuccessResponse} indicating the result of the payment operation.
   */
  openPayment: (transactionId: string) => Promise<SuccessResponse>;
  /**
   * Sets a custom handler for back arrow click events.
   * @param handler - Back arrow click handler
   */
  setCustomBackArrowOnClickHandler: (handler: BackArrowClickHandlerType) => void;
  /**
   * Checks biometric authentication status.
   * @returns  A promise resolving to a {@link BiometryResponse} indicating the result of the check.
   */
  checkBiometry: () => Promise<BiometryResponse>;

  /**
   * Opens an external URL outside the mini-app context.
   *
   * @param url - External URL to open
   * @returns A promise resolving to a {@link SuccessResponse} indicating the result of the operation.
   */
  openExternalUrl: (url: string) => Promise<SuccessResponse>;

  /**
   * Enables swipe-back navigation gesture.
   * @returns A promise resolving to a {@link SuccessResponse} when the gesture is enabled.
   */
  enableSwipeBack: () => Promise<SuccessResponse>;

  /**
   * Disables swipe-back navigation gesture.
   * @returns A promise resolving to a {@link SuccessResponse} when the gesture is disabled.
   */
  disableSwipeBack: () => Promise<SuccessResponse>;

  /**
   * Sets the navigation item display mode.
   *
   * @param mode - Navigation item mode
   * @returns A promise that resolves when the mode is set.
   */
  setNavigationItemMode: (mode: NavigationItemMode) => Promise<void>;

  /**
   * Returns the current navigation item mode.
   * @returns A promise resolving to the current {@link NavigationItemMode}.
   */
  getNavigationItemMode: () => Promise<NavigationItemMode>;

  /**
   * Retrieves step count data from HealthKit or Google Fit over the past 10 days.
   * @returns A promise resolving to a {@link UserStepInfoResponse} containing the user's step data.
   */
  getUserStepInfo: () => Promise<UserStepInfoResponse>;

  /**
   * Checks whether eSIM is supported on the device.
   * @returns A promise resolving to a {@link SuccessResponse} indicating if eSIM is supported.
   */
  isESimSupported: () => Promise<SuccessResponse>;

  /**
   * Activates an eSIM using the provided activation code.
   *
   * @param activationCode - eSIM activation code
   * @returns A promise resolving to a {@link SuccessResponse} indicating the result of the activation.
   */
  activateESim: (activationCode: string) => Promise<SuccessResponse>;

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
   * @returns A promise that resolves with a `SuccessResponse` indicating
   *          whether the subscription was successfully created.
   */
  subscribeUserStepInfo: () => Promise<SuccessResponse>;
  /**
   * Unsubscribes from user step updates from HealthKit/Google Fit.
   *
   * Stops the active step-count subscription created by
   * {@link AituBridge.subscribeUserStepInfo}. Once unsubscribed, no further step updates
   * will be delivered.
   *
   * @returns A promise that resolves with a `SuccessResponse` indicating
   *          whether the unsubscription was successful.
   */
  unsubscribeUserStepInfo: () => Promise<SuccessResponse>;
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

/**
 * @internal
 */
export type PublicApiMethods = Exclude<keyof Pick<AituBridge, RequestMethods>, 'storage'>;

/**
 * @internal
 */
export type BridgeMethodResult<T extends PublicApiMethods> = Awaited<ReturnType<AituBridge[T]>>;

export type Action<Type extends string = string, Payload extends unknown[] = unknown[], Result = unknown> = {
  type: Type;
  payload: Payload;
} & { id: string; __result: Result };

export type AsyncAction<Type extends string = string, Payload extends unknown[] = unknown[], Result = unknown> = Action<
  Type,
  Payload,
  Promise<Result>
>;

type SelectActionByType<T> = Extract<BridgeAction, { type: T }>;

/**
 * @internal
 */
export type EmptyResponse = Record<string, never>;

/**
 * @internal
 */
export type ActionResult<T> = SelectActionByType<T>['__result'];

/**
 * @internal
 */
export type ActionPayload<T> = SelectActionByType<T>['payload'];

export type SetHandlerAction =
  | Action<'setHeaderMenuItemClickHandler', Parameters<AituBridge['setHeaderMenuItemClickHandler']>, void>
  | Action<'setCustomBackArrowOnClickHandler', Parameters<AituBridge['setCustomBackArrowOnClickHandler']>, void>
  | Action<'setTabActiveHandler', Parameters<AituBridge['setTabActiveHandler']>, void>
  | Action<'setShakeHandler', Parameters<AituBridge['setShakeHandler']>, void>;

export type InvokableAction =
  | AsyncAction<'storage', [operation: 'getItem', data: { keyName: string }], string | null>
  | AsyncAction<'storage', [operation: 'setItem', data: { keyName: string; keyValue: string }], SuccessResponse>
  | AsyncAction<'storage', [operation: 'clear'], SuccessResponse>
  | AsyncAction<'invoke', [method: EInvokeRequest.getMe], GetMeResponse>
  | AsyncAction<'invoke', [method: EInvokeRequest.getPhone], GetPhoneResponse>
  | AsyncAction<'invoke', [method: EInvokeRequest.getContacts], GetContactsResponse>
  | AsyncAction<'invoke', [method: EInvokeRequest.getUserProfile, data: { id: string }], GetUserProfileResponse>
  | AsyncAction<'invoke', [method: EInvokeRequest.enableNotifications], EmptyResponse>
  | AsyncAction<'invoke', [method: EInvokeRequest.disableNotifications], EmptyResponse>
  | AsyncAction<'invoke', [method: EInvokeRequest.enablePrivateMessaging, data: { appId: string }], EmptyResponse>
  | AsyncAction<'invoke', [method: EInvokeRequest.disablePrivateMessaging, data: { appId: string }], EmptyResponse>
  | AsyncAction<'activateESim', [activationCode: string], SuccessResponse>
  | AsyncAction<'readNFCData', never, string>
  | AsyncAction<'openUserProfile', never, SuccessResponse>
  | AsyncAction<'openSettings', never, SuccessResponse>
  | AsyncAction<'closeApplication', never, SuccessResponse>
  | AsyncAction<'enableSwipeBack', never, SuccessResponse>
  | AsyncAction<'disableSwipeBack', never, SuccessResponse>
  | AsyncAction<'isESimSupported', never, SuccessResponse>
  | AsyncAction<'subscribeUserStepInfo', never, SuccessResponse>
  | AsyncAction<'unsubscribeUserStepInfo', never, SuccessResponse>
  | AsyncAction<'readNFCPassport', [passportNumber: string, dateOfBirth: string, expirationDate: string], PassportDataResponse>
  | AsyncAction<'enableScreenCapture', never, Record<string, never>>
  | AsyncAction<'disableScreenCapture', never, Record<string, never>>
  | AsyncAction<'getCustomBackArrowMode', never, boolean>
  | AsyncAction<'setCustomBackArrowMode', [enabled: boolean], SuccessResponse>
  | AsyncAction<'setCustomBackArrowVisible', [visible: boolean], SuccessResponse>
  | AsyncAction<'getNavigationItemMode', never, NavigationItemMode>
  | AsyncAction<'setNavigationItemMode', [mode: NavigationItemMode], SuccessResponse>
  | AsyncAction<'share', [text: string], SuccessResponse>
  | AsyncAction<'shareFile', [text: string, filename: string, base64Data: string], SuccessResponse>
  | AsyncAction<'getGeo', never, GetGeoResponse>
  | AsyncAction<'getQr', never, string>
  | AsyncAction<'getSMSCode', never, string>
  | AsyncAction<'selectContact', never, SelectContactResponse>
  | AsyncAction<'setTitle', [title: string], SuccessResponse>
  | AsyncAction<'copyToClipboard', [text: string], SuccessResponse>
  | AsyncAction<'checkBiometry', never, BiometryResponse>
  | AsyncAction<'getUserStepInfo', never, UserStepInfoResponse>;

/**
 * @internal
 */
export type BridgeAction = InvokableAction | SetHandlerAction;

/**
 * @internal
 */
export type ActionHandler<T extends BridgeAction = BridgeAction> = {
  handleAction: (action: T) => T['__result'];
};

/**
 * @internal
 */
export interface ActionHandlerFactory {
  isSupported: () => boolean;
  makeActionHandler(): ActionHandler<BridgeAction>;
}
