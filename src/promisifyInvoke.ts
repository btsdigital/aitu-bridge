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
      const invokeId = id;
      promiseControllers[invokeId] = controller;
      return invokeId;
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

function promisifyInvoke(invoke, subscribe: (fn: any) => void) {
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

  return function promisifiedFunc(method: any, props: any = {}): Promise<any | void> {
    return new Promise((resolve, reject) => {
      const reqId = requestResolver.add({ resolve, reject }, props.reqId);

      invoke(reqId, method, props);
    });
  };
}

export default promisifyInvoke;
