declare enum EInvokeRequest {
    getMe = "GetMe",
    getPhone = "GetPhone",
    getContacts = "GetContacts",
    getUserProfile = "GetUserProfile",
    enableNotifications = "AllowNotifications",
    disableNotifications = "DisableNotifications"
}
declare type SetItemType = (keyName: string, keyValue: string) => Promise<void>;
declare type GetItemType = (keyName: string) => Promise<string | null>;
declare type ClearType = () => Promise<void>;
declare type HeaderMenuItemClickHandlerType = (id: string) => Promise<void>;
declare type BackArrowClickHandlerType = () => Promise<void>;
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
export declare enum HeaderMenuIcon {
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
declare type OpenSettingsResponse = 'success' | 'failed';
declare type ShareResponse = 'success' | 'failed';
declare type CopyToClipboardResponse = 'success' | 'failed';
declare type ResponseType = 'success' | 'failed';
declare type BridgeInvoke<T extends EInvokeRequest, R> = (method: T, data?: {}) => Promise<R>;
interface BridgeStorage {
    setItem: SetItemType;
    getItem: GetItemType;
    clear: ClearType;
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
declare const bridge: AituBridge;
export default bridge;
