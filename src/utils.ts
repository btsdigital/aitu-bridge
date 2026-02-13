import type { AituEventHandler } from "./types";

import { createCounter } from './lib/createCounter';

function createRequestResolver(prefix: string) {
    type PromiseController = {
        resolve: (value: any) => any;
        reject: (reason: any) => any;
    };

    const counter = createCounter(prefix);
    const promiseControllers: Record<string, PromiseController | null> = {};

    return {
        add(controller: PromiseController, customId = ''): string {
            const id = customId + counter.next()
            promiseControllers[id] = controller;
            return id;
        },

        resolve<T>(reqId: string, data: T, isSuccess: (data: T) => boolean, error: any) {
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

function handleSubscribe(subscribe: (handler: AituEventHandler) => void, requestResolver: ReturnType<typeof createRequestResolver>) {
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


export function promisifyMethod<Result, Fn extends (...args: any[]) => any = (...args: any) => any>(method: Fn, methodName: string, subscribe: (fn: AituEventHandler) => void) {
    const requestResolver = createRequestResolver(methodName + ':');

    handleSubscribe(subscribe, requestResolver)

    return function promisifiedFunc(...args: Parameters<Fn>): Promise<Result> {
        return new Promise((resolve, reject) => {
            const reqId = requestResolver.add({ resolve, reject });
            method(reqId, ...args);
        });
    };
}



