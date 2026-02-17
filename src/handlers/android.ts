import type { ActionResult, InvokableAction, ActionHandlerFactory, UnsafeAndroidBridge, RequestMethods, HandlerMethods } from '../types';
import { waitResponse } from '../waitResponse';

import type { BridgeAction } from '../types';
import { isBrowser } from '../lib/isBrowser';
import { nullHandler } from './null';
import { setCallbacks, isHandlerMethods } from './callbacks';

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
    supports: (methodName: string) => typeof window?.AndroidBridge?.[methodName as RequestMethods | HandlerMethods] === 'function',
    handleAction: (action) => {
      const bridge = window?.AndroidBridge as UnsafeAndroidBridge;

      if (!bridge[action.type]) {
        return nullHandler.handleAction(action);
      }

      if (isHandlerMethods(action)) {
        return setCallbacks(action);
      }

      bridge[action.type](action.id, ...makeArgs(action));

      return waitResponse<ActionResult<InvokableAction>>(action.id);
    },
  }),
};
