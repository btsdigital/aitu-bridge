import promisifyInvoke from './promisifyInvoke';
import promisifyStorage from './promisifyStorage';

type InvokeRequest = 'GetMe' | 'GetPhone';

type SetItemType = (keyName: string, keyValue: string) => Promise<void>;
type GetItemType = (keyName: string) => Promise<string | null>;

// interface GetPhoneResponse { phone: string }
// interface GetMeResponse { name: string; lastname: string }
interface ResponseObject {
  phone?: string;
  name?: string;
  lastname?: string;
}

type BridgeInvoke<T extends InvokeRequest> = (method: T, data?: {}) => Promise<ResponseObject>;

interface BridgeStorage {
  setItem: SetItemType,
  getItem: GetItemType
}

interface AituBridge {
  invoke: BridgeInvoke<InvokeRequest>;
  storage: BridgeStorage;
  isSupported: () => boolean;
  sub: any;
}

const invokeMethod = 'invoke';
const storageMethod = 'storage';

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

  const isSupported = () => {
    return android || ios;
  }

  const sub = (listener: any) => {
    subs.push(listener);
  }

  const invokePromise = promisifyInvoke(invoke, sub);
  const storagePromise = promisifyStorage(storage, sub);

  return {
    invoke: invokePromise,
    storage: storagePromise,
    isSupported,
    sub
  }
}

const bridge = buildBridge();

export default bridge;
