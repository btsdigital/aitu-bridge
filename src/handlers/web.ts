import { isBrowser } from '../lib/isBrowser';
import { isIframe } from '../lib/isIframe';
import { setCallbacks, isHandlerMethods } from './callbacks';
import type { InvokableAction, ActionHandlerFactory } from '../types';
import { nullHandler } from './null';

const makeArgs = (action: InvokableAction) => {
  if (action.type === 'storage' || action.type === 'invoke') {
    const [method, data = {}] = action.payload;
    return [method, data];
  }

  if (action.type === 'setHeaderMenuItems') {
    const [items] = action.payload;

    return [JSON.stringify(items)];
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

    window.addEventListener('message', (event) => {
      if (event.origin === aituOrigin && event.data) {
        // dispatch aitu events
        window.dispatchEvent(new CustomEvent('aituEvents', { detail: event.data }));

        // try to detect handler call
        if (typeof event.data !== 'string' || event.data === '') {
          return;
        }

        try {
          const message = JSON.parse(event.data);

          if (message && message['method']) {
            if (message.method === 'setCustomBackArrowOnClickHandler') {
              window.onAituBridgeBackArrowClick?.();
            } else if (message.method === 'setHeaderMenuItemClickHandler') {
              window.onAituBridgeHeaderMenuItemClick?.(message.param);
            }
          }
        } catch (e) {
          console.log('Error parsing message data: ' + e);
        }
      }
    });

    return {
      // TODO: implement supports method
      supports: () => false,
      handleAction: (action) => {
        if (isHandlerMethods(action)) {
          return setCallbacks(action);
        }

        if (action.type === 'getUserStepInfo' || action.type === 'openExternalUrl' || action.type === 'openPayment') {
          return nullHandler.handleAction(action);
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
      },
    };
  },
};
