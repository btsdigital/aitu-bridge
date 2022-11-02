declare function promisifyInvoke(invoke: any, subscribe: (fn: any) => void): (method: any, props?: any) => Promise<any | void>;
export default promisifyInvoke;
