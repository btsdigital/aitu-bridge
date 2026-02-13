import { isBrowser } from '../lib/isBrowser';
import { isIframe } from '../lib/isIframe';
import type { ActionResult, InvokableAction, ActionHandlerFactory, BridgeAction } from '../types';
import { waitResponse } from '../waitResponse';
import { callbacksHandler, isHandlerMethods } from './callbacks';
import { nullHandler } from './null';

const makeArgs = (action: BridgeAction) => {
  if (action.type === 'storage' || action.type === 'invoke') {
    const [method, data = {}] = action.payload;
    return [method, data];
  }

  return action.payload;
};

export const webHandlerFactory: ActionHandlerFactory = {
  isSupported: () => isBrowser() && isIframe(),
  makeActionHandler: () => {
    const AITU_DOMAIN_PARAM = '__aitu-domain';

    const searchParams = new URLSearchParams(window.location.search);

    let aituOrigin = searchParams.get(AITU_DOMAIN_PARAM);

    if (aituOrigin) {
      localStorage.setItem('mini-app-domain', aituOrigin);
    } else {
      aituOrigin = localStorage.getItem('mini-app-domain');
    }

    if (!aituOrigin) {
      return nullHandler;
    }

    return {
      handleAction: (action) => {
        if (isHandlerMethods(action)) {
          return callbacksHandler.handleAction(action);
        }

        window?.top?.postMessage(
          {
            source: 'aitu-bridge',
            method: action.type,
            reqId: action.id,
            payload: [...makeArgs(action)],
          },
          aituOrigin,
        );
        return waitResponse<ActionResult<InvokableAction>>(action.id);
      },
    };
  },
};
