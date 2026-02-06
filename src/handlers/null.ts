import type { ActionHandler, ActionResult, BridgeAction } from '../types';
import { isHandlerMethods } from './callbacks';

export const nullHandler: ActionHandler<BridgeAction> = {
  handleAction: (action) => {
    console.log(`--${action.type}-isUnknown`);

    if (isHandlerMethods(action)) {
      return;
    }

    return new Promise<ActionResult<typeof action>>(() => {
      // TODO: reject promise to prevent eternal pending state
    });
  },
};
