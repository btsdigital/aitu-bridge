import type { AituEvent, BridgeMethodResult, PublicApiMethods } from './types';

export const waitResponse = <T extends PublicApiMethods>(
  reqId: string,
): Promise<BridgeMethodResult<T>> => {
  return new Promise<BridgeMethodResult<T>>((resolve, reject) => {
    const handler = (event: AituEvent) => {
      if (event.detail?.reqId !== reqId) {
        return;
      }

      const { data, error } = event.detail;

      if (data) {
        resolve(data as BridgeMethodResult<T>);
      } else {
        reject(error);
      }

      window.removeEventListener('aituEvents', handler);
    };

    window.addEventListener('aituEvents', handler);
  });
};
