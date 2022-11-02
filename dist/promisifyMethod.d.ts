declare function promisifyMethod(method: any, subscribe: (fn: any) => void): (...args: any[]) => Promise<any | void>;
export default promisifyMethod;
