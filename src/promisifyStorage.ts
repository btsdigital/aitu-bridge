function createCounter() {
    return {
      current: 0,
      next() {
        return ++this.current;
      },
    };
  }
  
  function createRequestResolver() {
    type PromiseController = {
      resolve: (value: any) => any;
      reject: (reason: any) => any;
    };
  
    const counter = createCounter();
    const promiseControllers: Record<string, PromiseController | null> = {};
  
    return {
      add(controller: PromiseController, customId?: number | string): number | string {
        const id = customId != null ? customId : counter.next();
        const storageId = `s${id}`;
        promiseControllers[storageId] = controller;
        return storageId;
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
  
  function promisifyStorage(storage, subscribe: (fn: any) => void) {
    const requestResolver = createRequestResolver();
  
    subscribe((event) => {
      if (!event.detail) {
        return;
      }
  
      if ('reqId' in event.detail) {
        const { reqId, data, error } = event.detail;
  
        if (reqId) {
          requestResolver.resolve(reqId, data, (error) => !(error), error);
        }
      }
    });

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
      removeItem: (keyName: string): Promise<void> => {
        return new Promise((resolve, reject) => {
          const reqId = requestResolver.add({ resolve, reject });
          storage(reqId, 'removeItem', { keyName });
        });
      },
      key: (index: number): Promise<string | null> => {
        return new Promise((resolve, reject) => {
          const reqId = requestResolver.add({ resolve, reject });
          storage(reqId, 'key', { index });
        });
      },
      clear: (): Promise<void> => {
        return new Promise((resolve, reject) => {
          const reqId = requestResolver.add({ resolve, reject });
          storage(reqId, 'key', {});
        });
      },
    }
  }
  
  export default promisifyStorage;
  