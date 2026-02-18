import type { Action, ActionHandler, AituEvent, AsyncAction } from './types';

type Options<T extends Action> = {
  validate?: (...payload: T['payload']) => string | true;
  generateId?: (...payload: T['payload']) => string;
};

type ActionResult =
  | void
  | {
      type: 'awaitResponse';
      actionId: string;
    };

type SelectSyncAction<T> = T extends { __result: any } ? never : T;

type SelectAsyncAction<T> = T extends { __result: any } ? T : never;

export const createActionFactories = <T extends Action | AsyncAction>(env: {
  handler: ActionHandler<T>;
  generateId: (type: string) => string;
}) => {
  const awaitResponse = <Result>(reqId: string): Promise<Result> => {
    return new Promise<Result>((resolve, reject) => {
      const handler = (event: AituEvent) => {
        if (event.detail?.reqId !== reqId) {
          return;
        }

        const { data, error } = event.detail;

        if (error) {
          reject(error);
        } else {
          resolve(data as Result);
        }

        window.removeEventListener('aituEvents', handler);
      };

      window.addEventListener('aituEvents', handler);
    });
  };

  const dispatchAction = <Type extends T['type'], A extends T = Extract<T, { type: Type }>>(
    type: Type,
    payload: A['payload'],
    options?: Options<A>,
  ): ActionResult => {
    const generateId = options?.generateId ?? (() => env.generateId(type));
    const validate = options?.validate ?? (() => true);

    const actionId = generateId(...payload);
    const validationResult = validate(...payload);

    if (typeof validationResult === 'string') {
      console.error(validationResult);

      return;
    }

    return env.handler.handleAction({ type, payload, id: actionId } as any);
  };

  const createAction = <Type extends SelectAsyncAction<T>['type'], A extends AsyncAction = Extract<SelectAsyncAction<T>, { type: Type }>>(
    type: Type,
    options?: Options<A>,
  ) => {
    return <Payload extends A['payload'], Result = Extract<A, { payload: Payload }>['__result']>(...payload: Payload): Promise<Result> => {
      const result = dispatchAction(type, payload, options);

      if (result?.type === 'awaitResponse') {
        return awaitResponse(result.actionId);
      }

      return new Promise(() => {});
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
