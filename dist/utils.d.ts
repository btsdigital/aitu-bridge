export declare function promisifyStorage(storage: any, subscribe: (fn: any) => void): {
    setItem: (keyName: string, keyValue: string) => Promise<void>;
    getItem: (keyName: string) => Promise<string | null>;
    clear: () => Promise<void>;
};
export declare function promisifyInvoke(invoke: any, subscribe: (fn: any) => void): (invokeMethodName: string, props?: any) => Promise<any | void>;
export declare function promisifyMethod(method: Function, methodName: string, subscribe: (fn: any) => void): (...args: any[]) => Promise<any | void>;
