import type { ActionHandler } from '../types';

export const nullHandler: ActionHandler = {
  handleAction: (action) => {
    console.log(`--${action.type}-isUnknown`);

    return new Promise(() => {
      // TODO: reject promise to prevent eternal pending state
    });
  },
};
