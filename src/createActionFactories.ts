import type { Action, ActionHandler, BridgeAction, InvokableAction, SetHandlerAction } from './types';
import { waitResponse } from './waitResponse';

type Options<T extends Action> = {
  validate?: (...payload: T['payload']) => string | true;
  generateId?: (payload: T['payload']) => string;
};

export const createActionFactories = <T extends BridgeAction>(env: { handler: ActionHandler<T>; generateId: (type: string) => string }) => {
  const createHandlerAction = <T extends SetHandlerAction['type'], A extends SetHandlerAction = Extract<SetHandlerAction, { type: T }>>(
    type: T,
    options?: Options<A>,
  ) => {
    const generateId = options?.generateId ?? (() => env.generateId(type));
    const validate = options?.validate ?? (() => true);

    return (...payload: A['payload']) => {
      const actionId = generateId(payload);
      const validationResult = validate(...payload);

      if (typeof validationResult === 'string') {
        console.error(validationResult);

        return;
      }

      env.handler.handleAction({ type, payload, id: actionId } as any);
    };
  };

  const createAction = <T extends InvokableAction['type'], A extends InvokableAction = Extract<InvokableAction, { type: T }>>(
    type: T,
    options?: Options<A>,
  ) => {
    const generateId = options?.generateId ?? (() => env.generateId(type));
    const validate = options?.validate ?? (() => true);

    return <Payload extends A['payload'], Result = Extract<A, { payload: Payload }>['__result']>(...payload: Payload): Promise<Result> => {
      const actionId = generateId(payload);
      const validationResult = validate(...payload);

      if (typeof validationResult === 'string') {
        console.error(validationResult);

        return new Promise(() => {});
      }

      env.handler.handleAction({ type, payload, id: actionId } as any);

      return waitResponse<Result>(actionId);
    };
  };

  return {
    createHandlerAction,
    createAction,
  };
};
