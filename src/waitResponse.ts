import type { AituEvent } from './types';

export const waitResponse = <Result>(reqId: string): Promise<Result> => {
  return new Promise<Result>((resolve, reject) => {
    const handler = (event: AituEvent) => {
      if (event.detail?.reqId !== reqId) {
        return;
      }

      const { data, error } = event.detail;

      if (error) {
        reject(error);
      } else {
        resolve(data as Result);
      }

      window.removeEventListener('aituEvents', handler);
    };

    window.addEventListener('aituEvents', handler);
  });
};
