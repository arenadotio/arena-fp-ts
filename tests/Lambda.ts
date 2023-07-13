/* eslint-disable @typescript-eslint/no-empty-function */
import { describe, it, expect, jest, afterEach } from '@jest/globals';

import * as t from 'io-ts';

import * as TE from 'fp-ts/lib/TaskEither';
import * as TO from 'fp-ts/lib/TaskOption';

import { toAWSLambda, Lambda } from '../src/Lambda';
import { mockLambda } from '../src/Jest';

const captureExceptionSpy = jest.fn((_err: any, _context: any) => () => {});
const sentryInitSpy = jest.fn(() => {});
const incrementMetricSpy = jest.fn((_) => TO.none);

jest.mock('../src/DataDog', () => ({
  incrementMetric: (_: any) => incrementMetricSpy,
}));

jest.mock('../src/Sentry', () => ({
  captureException: jest.fn((_) => captureExceptionSpy),
  init: jest.fn((_logger: any, _options: any) => sentryInitSpy),
}));

jest.mock('@sentry/serverless', () => ({
  AWSLambda: {
    wrapHandler: (x: any) => x,
  },
}));

const TestEventCodec = t.type({
  foo: t.string,
});

const validEvent = { foo: 'bar' };
const invalidEvent = { bar: 'foo' };

const [successfulHandler, successfulHandlerSpy] = mockLambda(
  TestEventCodec,
  (state) => TE.right([undefined, state])
);

const [unsuccessfulHandler, unsuccessfulHandlerSpy] = mockLambda(
  TestEventCodec,
  (state) => TE.left([new Error('test error'), state])
);

const [incorrectHandler, incorrectHandlerSpy] = mockLambda(
  TestEventCodec,
  (_) => () => {
    throw new Error('test error');
  }
);

const run = <A>(event: unknown, handler: Lambda<A>) => {
  const fn = toAWSLambda(handler);
  return fn({ detail: event as any }, undefined as any, undefined as any);
};

describe('toLambda', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('when event is valid', () => {
    it('when the handler succeeds', async () => {
      await run(validEvent, successfulHandler);

      // Always
      expect(successfulHandlerSpy).toHaveBeenCalled();
      expect(incrementMetricSpy).toHaveBeenCalledTimes(2);
      expect(sentryInitSpy).toHaveBeenCalled();

      // On error
      expect(captureExceptionSpy).not.toHaveBeenCalled();
    });

    it('when the handler fails', async () => {
      await run(validEvent, unsuccessfulHandler);

      // Always
      expect(unsuccessfulHandlerSpy).toHaveBeenCalled();
      expect(incrementMetricSpy).toHaveBeenCalledTimes(2);
      expect(sentryInitSpy).toHaveBeenCalled();

      // On error
      expect(captureExceptionSpy).toHaveBeenCalled();
    });

    it('when the handler throws an exception', async () => {
      await run(validEvent, incorrectHandler);

      // Always
      expect(incorrectHandlerSpy).toHaveBeenCalled();
      expect(incrementMetricSpy).toHaveBeenCalledTimes(2);
      expect(sentryInitSpy).toHaveBeenCalled();

      // On error
      expect(captureExceptionSpy).toHaveBeenCalled();
    });
  });

  it('when event is invalid', async () => {
    await run(invalidEvent, successfulHandler);

    // Always
    expect(successfulHandlerSpy).not.toHaveBeenCalled();
    expect(incrementMetricSpy).toHaveBeenCalledTimes(2);
    expect(sentryInitSpy).toHaveBeenCalled();

    // On error
    expect(captureExceptionSpy).toHaveBeenCalled();
  });
});
