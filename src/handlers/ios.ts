import type { ActionHandlerFactory, UnsafeIosBridge } from '../types';
import { waitResponse } from '../waitResponse';

import type { BridgeAction } from '../types';
import { isBrowser } from '../lib/isBrowser';
import { nullHandler } from './null';

const makeArgs = (action: BridgeAction): { [key: string]: unknown } => {
  if (action.type === 'storage') {
    const [method, data] = action.payload;

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

  return {};
};

export const iosHandlerFactory: ActionHandlerFactory = {
  isSupported: () => isBrowser() && !!window.webkit && !!window.webkit.messageHandlers,
  makeActionHandler: () => ({
    handleAction: <T>(action: BridgeAction) => {
      const targetFn = (window?.webkit?.messageHandlers as UnsafeIosBridge)?.[action.type]?.postMessage;

      if (targetFn) {
        targetFn({
          reqId: action.id,
          ...makeArgs(action),
        });

        return waitResponse<T>(action.id);
      }

      return nullHandler.handleAction(action);
    },
  }),
};
