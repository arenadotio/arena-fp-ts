/* eslint-disable @typescript-eslint/no-empty-function */

import Pino from 'pino';

import * as t from 'io-ts';

import * as E from 'fp-ts/lib/Either';
import * as T from 'fp-ts/lib/Task';
import * as TO from 'fp-ts/lib/TaskOption';

import { toLambda } from '../src/Lambda';

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

const logger = Pino();

const TestEventCodec = t.type({
  foo: t.string,
});

const validEvent = { detail: { foo: 'bar' } };
const invalidEvent = { detail: { bar: 'foo' } };

const successfulHandler = jest.fn((state) =>
  T.of([E.right(undefined), { ...state, logger }])
);

const unsuccessfulHandler = jest.fn((state) =>
  T.of([E.left(new Error('test error')), { ...state, logger }])
);

const run = (event: unknown, handler: any) => {
  const fn: any = toLambda('test', TestEventCodec, handler);
  return expect(fn(event)).resolves.not.toThrow();
};

describe('toLambda', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('when event is valid', () => {
    it('when the handler succeeds', async () => {
      await run(validEvent, successfulHandler);

      // Always
      expect(successfulHandler).toHaveBeenCalled();
      expect(incrementMetricSpy).toHaveBeenCalledTimes(2);
      expect(sentryInitSpy).toHaveBeenCalled();

      // On error
      expect(captureExceptionSpy).not.toHaveBeenCalled();
    });

    it('when the handler fails', async () => {
      await run(validEvent, unsuccessfulHandler);

      // Always
      expect(unsuccessfulHandler).toHaveBeenCalled();
      expect(incrementMetricSpy).toHaveBeenCalledTimes(2);
      expect(sentryInitSpy).toHaveBeenCalled();

      // On error
      expect(captureExceptionSpy).toHaveBeenCalled();
    });
  });

  it('when event is invalid', async () => {
    await run(invalidEvent, successfulHandler);

    // Always
    expect(successfulHandler).not.toHaveBeenCalled();
    expect(incrementMetricSpy).toHaveBeenCalledTimes(2);
    expect(sentryInitSpy).toHaveBeenCalled();

    // On error
    expect(captureExceptionSpy).toHaveBeenCalled();
  });
});
