import { createCounter } from './lib/createCounter';
import type { ActionHandler, ActionPayload, BridgeAction, ActionResult } from './types';

export const createActionFactory =
  (handler: ActionHandler) =>
  <Type extends BridgeAction['type']>(type: Type) => {
    const counter = createCounter(type + ':');

    return <T = ActionResult<Type>>(...payload: ActionPayload<Type>): T =>
      handler.handleAction({
        id: counter.next(),
        type,
        payload,
      } as BridgeAction) as T;
  };
