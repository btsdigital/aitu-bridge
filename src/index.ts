import promisifyInvoke from './promisifyInvoke';
import promisifyStorage from './promisifyStorage';
import promisifyMethod from './promisifyMethod';

type InvokeRequest = 'GetMe' | 'GetPhone' | 'GetContacts';

type SetItemType = (keyName: string, keyValue: string) => Promise<void>;
type GetItemType = (keyName: string) => Promise<string | null>;

// interface GetPhoneResponse { phone: string }
// interface GetMeResponse { name: string; lastname: string }
interface ResponseObject {
  phone?: string;
  name?: string;
  lastname?: string;
}

// interface GetGeoResponse {}
// interface OpenSettingsResponse {}

type BridgeInvoke<T extends InvokeRequest> = (method: T, data?: {}) => Promise<ResponseObject>;
type BridgeGetGeo = () => Promise<any>;
type BridgeOpenSettings = () => Promise<any>;

interface BridgeStorage {
  setItem: SetItemType,
  getItem: GetItemType
}

interface AituBridge {
  invoke: BridgeInvoke<InvokeRequest>;
  storage: BridgeStorage;
  getGeo: BridgeGetGeo;
  openSettings: BridgeOpenSettings;
  isSupported: () => boolean;
  sub: any;
}

const invokeMethod = 'invoke';
const storageMethod = 'storage';
const getGeoMethod = 'getGeo';
const openSettingsMethod = 'openSettings';

const android = typeof window !== 'undefined' && (window as any).AndroidBridge;
const ios = typeof window !== 'undefined' && (window as any).webkit && (window as any).webkit.messageHandlers;

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
    } else if (typeof window !== 'undefined') {
      console.log('--invoke-isWeb');
    }
  };

  const storage = (reqId, method, data = {}) => {
    const isAndroid = android && android[storageMethod];
    const isIos = ios && ios[storageMethod];

    if (isAndroid) {
      android[storageMethod](reqId, method, JSON.stringify(data));
    } else if (isIos) {
      ios[storageMethod].postMessage({ reqId, method, data });
    } else if (typeof window !== 'undefined') {
      console.log('--storage-isWeb');
    }
  }

  const getGeo = (reqId, data = {}) => {
    const isAndroid = android && android[getGeoMethod];
    const isIos = ios && ios[getGeoMethod];

    if (isAndroid) {
      android[getGeoMethod](reqId, JSON.stringify(data));
    } else if (isIos) {
      ios[getGeoMethod].postMessage({ reqId, data });
    } else if (typeof window !== 'undefined') {
      console.log('--getGeo-isWeb');
    }
  }

  const openSettings = (reqId, method, data = {}) => {
    const isAndroid = android && android[openSettingsMethod];
    const isIos = ios && ios[openSettingsMethod];

    if (isAndroid) {
      android[openSettingsMethod](reqId, method, JSON.stringify(data));
    } else if (isIos) {
      ios[openSettingsMethod].postMessage({ reqId, method, data });
    } else if (typeof window !== 'undefined') {
      console.log('--openSettings-isWeb');
    }
  }

  const isSupported = () => {
    return android || ios;
  }

  const sub = (listener: any) => {
    subs.push(listener);
  }

  const invokePromise = promisifyInvoke(invoke, sub);
  const storagePromise = promisifyStorage(storage, sub);
  const getGeoPromise = promisifyMethod(getGeo, sub);
  const openSettingsPromise = promisifyMethod(openSettings, sub);

  return {
    invoke: invokePromise,
    storage: storagePromise,
    getGeo: getGeoPromise,
    openSettings: openSettingsPromise,
    isSupported,
    sub
  }
}

const bridge = buildBridge();

export default bridge;
