export type InvokeRequest = 'GetMe' | 'GetPhone';
export type StorageRequest = 'setItem' | 'getItem' | 'removeItem' | 'key' | 'clear';

type SetItemType = (keyName: string, keyValue: string) => Promise<void>;
type GetItemType = (keyName: string) => Promise<string | null>;
type RemoveItemType = (keyName: string) => Promise<void>;
type KeyType = (index: number) => Promise<string | null>;
type ClearType = () => Promise<void>;

// interface GetPhoneResponse { phone: string }
// interface GetMeResponse { name: string; lastname: string }
interface ResponseObject {
  phone?: string;
  name?: string;
  lastname?: string;
}

type BridgeInvoke<T extends InvokeRequest> = (method: T, data?: {}) => Promise<ResponseObject>;

export interface BridgeStorage {
  setItem: SetItemType,
  getItem: GetItemType,
  removeItem: RemoveItemType,
  key: KeyType,
  clear: ClearType
}

export interface AituBridge {
  invoke: BridgeInvoke<InvokeRequest>;
  storage: BridgeStorage;
  isSupported: () => boolean;
  sub: any;
}