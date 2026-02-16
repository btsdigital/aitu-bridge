import type { ActionHandler, BridgeAction } from '../types';

export const nullHandler: ActionHandler<BridgeAction> = {
  supports: () => false,
  handleAction: (action) => {
    console.log(`--${action.type}-isUnknown`);
  },
};
