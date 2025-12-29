/**
 * Aitu Bridge is a JavaScript library designed to simplify integration with the Aitu Superapp.
 * It allows your application to access platform features such as retrieving a user’s phone number or geolocation.
 * {@link https://docs.aitu.io/aituapps/aitu.apps/methods | Read the official documentation to learn more.}
 * @packageDocumentation
 */
export * from './error';

export type {
  BackArrowClickHandlerType,
  HeaderMenuItemClickHandlerType,
  NFCPassportError,
  PermissionDeniedError,
  AppUrlDoesntMatchError,
  AituEventHandler,
  EInvokeRequest,
  GetPhoneResponse,
  GetMeResponse,
  ResponseObject,
  GetGeoResponse,
  GetContactsResponse,
  SelectContactResponse,
  GetUserProfileResponse,
  HeaderMenuIcon,
  NavigationItemMode,
  HeaderMenuItem,
  UserStepsPerDay,
  UserStepInfoResponse,
  SuccessResponse,
  ResponseType,
  BiometryResponse,
  PassportDataResponse,
  BridgeInvoke,
  BridgeStorage,
  AituBridge,
} from './types';

import { buildBridge } from './buildBridge';
/**
 * @public
 * AituBridge instance for interacting with the Aitu mini-app environment.
 */
const bridge = buildBridge();

export default bridge;
