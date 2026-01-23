import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { waitResponse } from './waitResponse';
import { createEvent, dispatchEvent, withTimeout } from '../tests/test-utils';

describe('waitResponse', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it('should resolve and reject with correct data', async () => {
    const eventA = createEvent({ reqId: 'req-1', data: 'success', error: null });
    const eventB = createEvent({ reqId: 'req-2', data: { someData: 'kekus' }, error: null });
    const eventC = createEvent({ reqId: 'req-3', data: null, error: { code: 'some_error', msg: 'some_msg' } });
    const eventD = createEvent({ reqId: 'req-4', data: null, error: { code: 'some_error2', msg: 'some_msg2' } });
    const eventE = createEvent({
      reqId: 'req-5',
      data: {
        first: 'test',
        second: {
          third: 'test',
        },
      },
      error: null,
    });

    const promiseA = waitResponse(eventA.detail.reqId);
    const promiseB = waitResponse(eventB.detail.reqId);
    const promiseC = waitResponse(eventC.detail.reqId);
    const promiseD = waitResponse(eventD.detail.reqId);
    const promiseE = waitResponse(eventE.detail.reqId);

    dispatchEvent(eventA, { delayMs: 50 });
    dispatchEvent(eventB, { delayMs: 100 });
    dispatchEvent(eventC, { delayMs: 200 });
    dispatchEvent(eventD, { delayMs: 25 });
    dispatchEvent(eventE, { delayMs: 150 });

    vi.advanceTimersByTime(200);

    await expect(promiseA).resolves.toEqual(eventA.detail.data);
    await expect(promiseB).resolves.toEqual(eventB.detail.data);
    await expect(promiseC).rejects.toEqual(eventC.detail.error);
    await expect(promiseD).rejects.toEqual(eventD.detail.error);
    await expect(promiseE).resolves.toEqual(eventE.detail.data);
  });

  it('should ignore events with different reqId', async () => {
    const awaitedReqId = 'test-789';
    const timeoutMs = 5_000;

    const event = createEvent({
      reqId: 'different-id',
      data: { result: 'wrong' },
      error: null,
    });

    const promise = withTimeout(waitResponse(awaitedReqId), timeoutMs);

    dispatchEvent(event);

    vi.advanceTimersByTime(timeoutMs);

    await expect(promise).rejects.toStrictEqual('timeout');
  });

  it('should remove event listener after resolving', async () => {
    const removeEventListenerSpy = vi.spyOn(window, 'removeEventListener');
    const reqId = 'test-cleanup';

    const promise = waitResponse(reqId);

    const event = createEvent({
      reqId,
      data: 'success',
      error: null,
    });

    dispatchEvent(event);

    await promise;

    expect(removeEventListenerSpy).toHaveBeenCalledWith('aituEvents', expect.any(Function));
    expect(removeEventListenerSpy).toHaveBeenCalledTimes(1);
  });
});
