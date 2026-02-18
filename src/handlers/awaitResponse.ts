export function awaitResponse(actionId: string) {
  return {
    type: 'awaitResponse',
    actionId,
  } as const;
}
