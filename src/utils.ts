function createCounter(prefix = 'm:') {
    return {
        current: 0,
        next() {
            return prefix + ++this.current;
        },
    };
}

function createRequestResolver(prefix: string) {
    type PromiseController = {
        resolve: (value: any) => any;
        reject: (reason: any) => any;
    };

    const counter = createCounter(prefix);
    const promiseControllers: Record<string, PromiseController | null> = {};

    return {
        add(controller: PromiseController, customId = ''): number | string {
            const id = customId + counter.next()
            promiseControllers[id] = controller;
            return id;
        },

        resolve<T>(reqId: number | string, data: T, isSuccess: (data: T) => boolean, error: any) {
            const requestPromise = promiseControllers[reqId];

            if (requestPromise) {
                if (isSuccess(error)) {
                    requestPromise.resolve(data);
                } else {
                    requestPromise.reject(error);
                }

                promiseControllers[reqId] = null;
            }
        },
    };
}

function handleSubscribe(subscribe: (handler: (event: any) => void) => void, requestResolver: ReturnType<typeof createRequestResolver>) {
    subscribe(event => {
        if (!event.detail) {
            return;
        }

        if ('reqId' in event.detail) {
            const { reqId, data, error } = event.detail;

            if (reqId) {
                requestResolver.resolve(reqId, data, (error) => !(error), error);
            }
        }
    })
}

export function promisifyStorage(storage, subscribe: (fn: any) => void) {
    const requestResolver = createRequestResolver('storage:');

    handleSubscribe(subscribe, requestResolver)

    return {
        setItem: (keyName: string, keyValue: string): Promise<void> => {
            return new Promise((resolve, reject) => {
                const reqId = requestResolver.add({ resolve, reject });
                storage(reqId, 'setItem', { keyName, keyValue });
            });
        },
        getItem: (keyName: string): Promise<string | null> => {
            return new Promise((resolve, reject) => {
                const reqId = requestResolver.add({ resolve, reject });
                storage(reqId, 'getItem', { keyName });
            });
        },
        clear: (): Promise<void> => {
            return new Promise((resolve, reject) => {
                const reqId = requestResolver.add({ resolve, reject });
                storage(reqId, 'clear', {});
            });
        },
    }
}

export function promisifyInvoke(invoke, subscribe: (fn: any) => void) {
    const requestResolver = createRequestResolver('invoke:');

    handleSubscribe(subscribe, requestResolver)

    return function promisifiedFunc(invokeMethodName: string, props: any = {}): Promise<any | void> {
        return new Promise((resolve, reject) => {
            const reqId = requestResolver.add({ resolve, reject }, invokeMethodName + ':');

            invoke(reqId, invokeMethodName, props);
        });
    };
}

export function promisifyMethod(method: Function, methodName: string, subscribe: (fn: any) => void) {
    const requestResolver = createRequestResolver(methodName + ':');

    handleSubscribe(subscribe, requestResolver)

    return function promisifiedFunc(...args: any[]): Promise<any | void> {
        return new Promise((resolve, reject) => {
            const reqId = requestResolver.add({ resolve, reject });
            method(reqId, ...args);
        });
    };
}



