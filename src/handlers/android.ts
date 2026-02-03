import type { ActionHandlerFactory, UnsafeAndroidBridge } from '../types';
import { waitResponse } from '../waitResponse';

import type { BridgeAction } from '../types';
import { isBrowser } from '../lib/isBrowser';
import { nullHandler } from './null';

const makeArgs = (action: BridgeAction): unknown[] => {
  if (action.type === 'storage') {
    const [storageMethod, data] = action.payload;

    return [storageMethod, JSON.stringify(data)];
  }

  return Array.isArray(action.payload) ? action.payload : [];
};

export const androidHandlerFactory: ActionHandlerFactory = {
  isSupported: () => isBrowser() && !!window.AndroidBridge,
  makeActionHandler: () => ({
    handleAction: <T>(action: BridgeAction) => {
      const targetFn = (window?.AndroidBridge as UnsafeAndroidBridge)?.[action.type];

      if (targetFn) {
        targetFn(action.id, ...makeArgs(action));

        return waitResponse<T>(action.id);
      }

      return nullHandler.handleAction(action);
    },
  }),
};
