import type { ActionHandler, BridgeAction, SetHandlerAction } from '../types';

export function isHandlerMethods(action: BridgeAction): action is SetHandlerAction {
  return ['setHeaderMenuItemClickHandler', 'setCustomBackArrowOnClickHandler', 'setTabActiveHandler', 'setShakeHandler'].includes(
    action.type,
  );
}

export const callbacksHandler: ActionHandler<SetHandlerAction> = {
  handleAction: (action) => {
    switch (action.type) {
      case 'setShakeHandler': {
        window.onAituBridgeShake = action.payload[0];
        break;
      }
      case 'setCustomBackArrowOnClickHandler': {
        window.onAituBridgeBackArrowClick = action.payload[0];
        break;
      }
      case 'setHeaderMenuItemClickHandler': {
        window.onAituBridgeHeaderMenuItemClick = action.payload[0];
        break;
      }
      case 'setTabActiveHandler': {
        window.onAituBridgeTabActive = action.payload[0];
        break;
      }
    }
  },
};
