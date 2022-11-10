import type { AituBridge } from './index';
interface WebBridge {
    execute(method: keyof AituBridge, reqId: string, ...payload: any[]): void;
    origin: string;
}
declare let WebBridge: WebBridge | null;
export default WebBridge;
