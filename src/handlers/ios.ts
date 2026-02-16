import type { InvokableAction, ActionHandlerFactory, UnsafeIosBridge, RequestMethods, HandlerMethods } from '../types';

import { isBrowser } from '../lib/isBrowser';
import { nullHandler } from './null';
import { isHandlerMethods, setCallbacks } from './callbacks';

const makeArgs = ({ type, payload }: InvokableAction): { [key: string]: unknown } => {
  switch (type) {
    case 'storage':
    case 'invoke': {
      const [method, data = {}] = payload;
      return {
        method,
        data,
      };
    }
    case 'activateESim': {
      const [activationCode] = payload;
      return {
        activationCode,
      };
    }
    case 'readNFCPassport': {
      const [passportNumber, dateOfBirth, expirationDate] = payload;
      return {
        passportNumber,
        dateOfBirth,
        expirationDate,
      };
    }
    case 'setCustomBackArrowMode': {
      const [enabled] = payload;
      return { enabled };
    }
    case 'setCustomBackArrowVisible': {
      const [visible] = payload;
      return { visible };
    }
    case 'setNavigationItemMode': {
      const [mode] = payload;
      return { mode };
    }
    case 'share':
    case 'setTitle':
    case 'copyToClipboard': {
      const [text] = payload;
      return { text };
    }
    case 'shareFile': {
      const [text, filename, base64Data] = payload;
      return {
        text,
        filename,
        base64Data,
      };
    }
    case 'openExternalUrl': {
      const [url] = payload;
      return {
        url,
      };
    }
    case 'openPayment': {
      const [transactionId] = payload;
      return {
        transactionId,
      };
    }
    case 'setHeaderMenuItems': {
      const [items] = payload;
      return {
        itemsJsonArray: JSON.stringify(items),
      };
    }
    default:
      return {};
  }
};

export const iosHandlerFactory: ActionHandlerFactory = {
  isSupported: () => isBrowser() && !!window.webkit && !!window.webkit.messageHandlers,
  makeActionHandler: () => ({
    supports: (methodName: string) =>
      typeof window.webkit?.messageHandlers?.[methodName as RequestMethods | HandlerMethods]?.postMessage === 'function',
    handleAction: (action) => {
      const bridge = window?.webkit?.messageHandlers as UnsafeIosBridge;

      if (!bridge[action.type]) {
        return nullHandler.handleAction(action);
      }

      if (isHandlerMethods(action)) {
        return setCallbacks(action);
      }

      bridge[action.type].postMessage({
        reqId: action.id,
        ...makeArgs(action),
      });
    },
  }),
};
