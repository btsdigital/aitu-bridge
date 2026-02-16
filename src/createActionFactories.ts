import type { Action, ActionHandler, AsyncAction, InvokableAction, SetHandlerAction } from './types';
import { waitResponse } from './waitResponse';

type Options<T extends Action> = {
  validate?: (...payload: T['payload']) => string | true;
  generateId?: (...payload: T['payload']) => string;
};

type ActionState =
  | {
      type: 'invalid';
      reason: string;
    }
  | {
      type: 'done';
      actionId: string;
    };

type SelectSyncAction<T> = T extends { __result: any } ? never : T;

type SelectAsyncAction<T> = T extends { __result: any } ? T : never;

export const createActionFactories = <T extends Action | AsyncAction>(env: {
  handler: ActionHandler<T>;
  generateId: (type: string) => string;
}) => {
  const dispatchAction = <Type extends T['type'], A extends T = Extract<T, { type: Type }>>(
    type: Type,
    payload: A['payload'],
    options?: Options<A>,
  ): ActionState => {
    const generateId = options?.generateId ?? (() => env.generateId(type));
    const validate = options?.validate ?? (() => true);

    const actionId = generateId(...payload);
    const validationResult = validate(...payload);

    if (typeof validationResult === 'string') {
      console.error(validationResult);

      return {
        type: 'invalid',
        reason: validationResult,
      };
    }

    env.handler.handleAction({ type, payload, id: actionId } as any);

    return {
      type: 'done',
      actionId,
    };
  };

  const createAction = <Type extends SelectAsyncAction<T>['type'], A extends AsyncAction = Extract<SelectAsyncAction<T>, { type: Type }>>(
    type: Type,
    options?: Options<A>,
  ) => {
    return <Payload extends A['payload'], Result = Extract<A, { payload: Payload }>['__result']>(...payload: Payload): Promise<Result> => {
      const state = dispatchAction(type, payload, options);

      if (state.type === 'invalid') {
        return new Promise(() => {});
      }

      return waitResponse(state.actionId);
    };
  };

  const createHandlerAction = <
    Type extends SelectSyncAction<T>['type'],
    Action extends SelectSyncAction<T> = Extract<SelectSyncAction<T>, { type: Type }>,
  >(
    type: Type,
    options?: Options<Action>,
  ) => {
    return <Payload extends Action['payload']>(...payload: Payload): void => {
      dispatchAction(type, payload, options);
    };
  };

  return {
    createHandlerAction,
    createAction,
  };
};
