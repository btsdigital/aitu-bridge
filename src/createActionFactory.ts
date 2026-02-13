import { createCounter, type Counter } from './lib/createCounter';
import type { ActionHandler, ActionPayload, BridgeAction } from './types';

export const createActionFactory =
  (handler: ActionHandler) =>
  <Type extends BridgeAction['type']>(
    type: Type,
    options?: {
      generateId: (ctx: { payload: ActionPayload<Type>; counter: Counter }) => string;
    },
  ) => {
    const counter = createCounter(type + ':');

    return <Payload extends ActionPayload<Type>, Action extends BridgeAction = Extract<BridgeAction, { type: Type; payload: Payload }>>(
      ...payload: Payload
    ): Action['__result'] => {
      const id = options?.generateId ? options.generateId({ payload: payload as ActionPayload<Type>, counter }) : counter.next();

      return handler.handleAction({
        id,
        type,
        payload,
      } as Action) as Action['__result'];
    };
  };
