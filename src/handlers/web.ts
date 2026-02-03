import { isBrowser } from '../lib/isBrowser';
import { isIframe } from '../lib/isIframe';
import type { ActionHandlerFactory, BridgeAction } from '../types';
import { waitResponse } from '../waitResponse';
import { nullHandler } from './null';

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
      handleAction: <T>(action: BridgeAction) => {
        window?.top?.postMessage(
          {
            source: 'aitu-bridge',
            method: action.type,
            reqId: action.id,
            payload: [...action.payload],
          },
          aituOrigin,
        );
        return waitResponse<T>(action.id);
      },
    };
  },
};
