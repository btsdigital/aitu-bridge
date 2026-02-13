import type { ActionResult, InvokableAction, ActionHandlerFactory, UnsafeIosBridge } from '../types';
import { waitResponse } from '../waitResponse';

import type { BridgeAction } from '../types';
import { isBrowser } from '../lib/isBrowser';
import { nullHandler } from './null';
import { isHandlerMethods, callbacksHandler } from './callbacks';

const makeArgs = (action: BridgeAction): { [key: string]: unknown } => {
  if (action.type === 'storage' || action.type === 'invoke') {
    const [method, data = {}] = action.payload;

    return {
      method,
      data,
    };
  }

  if (action.type === 'activateESim') {
    const [activationCode] = action.payload;

    return {
      activationCode,
    };
  }

  if (action.type === 'readNFCPassport') {
    const [passportNumber, dateOfBirth, expirationDate] = action.payload;

    return {
      passportNumber,
      dateOfBirth,
      expirationDate,
    };
  }

  if (action.type === 'setCustomBackArrowMode') {
    const [enabled] = action.payload;

    return { enabled };
  }

  if (action.type === 'setCustomBackArrowVisible') {
    const [visible] = action.payload;

    return { visible };
  }

  if (action.type === 'setNavigationItemMode') {
    const [mode] = action.payload;

    return { mode };
  }

  if (action.type === 'share' || action.type === 'setTitle' || action.type === 'copyToClipboard') {
    const [text] = action.payload;

    return { text };
  }

  if (action.type === 'shareFile') {
    const [text, filename, base64Data] = action.payload;

    return {
      text,
      filename,
      base64Data,
    };
  }

  if (action.type === 'openExternalUrl') {
    const [url] = action.payload;

    return {
      url,
    };
  }

  if (action.type === 'openPayment') {
    const [transactionId] = action.payload;

    return {
      transactionId,
    };
  }

  return {};
};

export const iosHandlerFactory: ActionHandlerFactory = {
  isSupported: () => isBrowser() && !!window.webkit && !!window.webkit.messageHandlers,
  makeActionHandler: () => ({
    handleAction: (action) => {
      const bridge = window?.webkit?.messageHandlers as UnsafeIosBridge;

      if (!bridge[action.type]) {
        return nullHandler.handleAction(action);
      }

      if (isHandlerMethods(action)) {
        return callbacksHandler.handleAction(action);
      }

      bridge[action.type].postMessage({
        reqId: action.id,
        ...makeArgs(action),
      });

      return waitResponse<ActionResult<InvokableAction>>(action.id);
    },
  }),
};
