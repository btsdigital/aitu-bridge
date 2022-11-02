declare function promisifyStorage(storage: any, subscribe: (fn: any) => void): {
    setItem: (keyName: string, keyValue: string) => Promise<void>;
    getItem: (keyName: string) => Promise<string | null>;
    clear: () => Promise<void>;
};
export default promisifyStorage;
