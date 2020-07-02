type AituInvoke = <T>(method: T, data: any) => void;

interface AituBridge {
  invoke: AituInvoke;
}

const android = typeof window !== 'undefined' && (window as any).AndroidBridge;
const ios = typeof window !== 'undefined' && (window as any).IosBridge;

const bridge: AituBridge = {
  invoke(method, data = {}) {
    data.userId = '123-345-123';
    data.testBoolean = true;

    if (android && android[method]) {
      android[method](JSON.stringify(data));
    }

    if (ios && ios[method]) {
      ios[method].postMessage(data);
    }

    console.log('=----------------------=');
    console.log('invoke method: ', method);
    console.log('params: ', data);
  }
}

export default bridge;