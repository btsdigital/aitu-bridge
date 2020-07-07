import promisifyInvoke from './promisifyInvoke';

type AituInvoke = <T>(method: T, data: any) => void;

interface AituBridge {
  invoke: AituInvoke;
  sub: any;
}

const invokeMethod = 'invoke';

const android = typeof window !== 'undefined' && (window as any).AndroidBridge;
const ios = typeof window !== 'undefined' && (window as any).IosBridge;

const buildBridge = (): AituBridge => {
  const subs = [];

  if (typeof window !== 'undefined') {
    window.addEventListener('aituEvents', (e: any) => {
      const dataStr = JSON.stringify(e.detail);
      console.log('subs_data', dataStr);
      [...subs].map((fn) => fn.call(null, e));
    })
  }

  const invoke = (req1, method, data = {}) => {
    if (android && android[invokeMethod]) {
      android[invokeMethod](req1, method, JSON.stringify(data));
    }

    if (ios && ios[invokeMethod]) {
      ios[invokeMethod].postMessage(req1, method, data);
    }

    console.log('=----------------------=');
    console.log('invoke method: ', method);
    console.log('params: ', data);
  };

  const sub = (listener: any) => {
    subs.push(listener);
  }

  const invokePromise = promisifyInvoke(invoke, sub);

  return {
    invoke: invokePromise,
    sub
  }
}

const bridge = buildBridge();

export default bridge;