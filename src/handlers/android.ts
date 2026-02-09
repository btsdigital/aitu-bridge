import type { ActionResult, InvokableAction, ActionHandlerFactory, UnsafeAndroidBridge } from '../types';
import { waitResponse } from '../waitResponse';

import type { BridgeAction } from '../types';
import { isBrowser } from '../lib/isBrowser';
import { nullHandler } from './null';
import { callbacksHandler, isHandlerMethods } from './callbacks';

const makeArgs = (action: BridgeAction): unknown[] => {
  if (action.type === 'storage' || action.type === 'invoke') {
    const [method, data = {}] = action.payload;

    return [method, JSON.stringify(data)];
  }

  return Array.isArray(action.payload) ? action.payload : [];
};

export const androidHandlerFactory: ActionHandlerFactory = {
  isSupported: () => isBrowser() && !!window.AndroidBridge,
  makeActionHandler: () => ({
    handleAction: (action) => {
      const bridge = window?.AndroidBridge as UnsafeAndroidBridge;

      if (!bridge[action.type]) {
        return nullHandler.handleAction(action);
      }

      if (isHandlerMethods(action)) {
        return callbacksHandler.handleAction(action);
      }

      bridge[action.type](action.id, ...makeArgs(action));

      return waitResponse<ActionResult<InvokableAction>>(action.id);
    },
  }),
};
