/**
 * ```
 * export interface LambdaState<A> {
 *   appName: string;
 *   logger: L.Logger;
 *   event: A;
 * }
 * ```
 *
 * ```
 * export type Handler<A> = (
 *   state: LambdaState<A>
 * ) => T.Task<[E.Either<Error, void>, LambdaState<A>]>;
 * ```
 *
 * This module is used to transform a `Handler<A>` into a function that
 * AWSLambda can call.
 *
 * The handler must return a tuple containing its result and a (possibly
 * changed) state object. If the result is an Either.right, its value is ignored
 * and the handle is believed to have succeeded. If the result is an
 * Either.left, then its value will be captured in Sentry.
 *
 * Before the handler is invoke, the input from AWS will be validated using
 * io-ts. If any validation errors are signaled, the handler will never be
 * called and an exception will be sent to Sentry.
 *
 * @example
 * import * as E from 'fp-ts/lib/Either'
 * import * as T from 'fp-ts/lib/Task';
 * import * as t from 'io-ts';
 *
 * import * as L from '@arenadotio/arena-fp-ts/Lambda';
 *
 * const myCoolHandler: L.Handler<string> = (
 *   state: L.LambdaState<string>
 * ) => T.of([E.left(new Error("I don't do anything")), state]);
 *
 * export const app = L.toLambda('my-cool-handler', t.string, myCoolHandler);
 *
 * @since 0.0.1
 */

import { Decoder } from 'io-ts';

import { flow, pipe } from 'fp-ts/lib/function';
import * as IO from 'fp-ts/lib/IO';
import * as TE from 'fp-ts/lib/TaskEither';
import * as E from 'fp-ts/lib/Either';
import * as T from 'fp-ts/lib/Task';

import * as L from './Logger';
import * as V from './validator';
import * as Sentry from './Sentry';
import * as DD from './DataDog';

import { AWSLambda } from '@sentry/serverless';
import * as AWS from 'aws-lambda';

// -------------------------------------------------------------------------------------
// model
// -------------------------------------------------------------------------------------

/**
 * @category model
 * @since 0.0.1
 */
export type AWSHandler = AWS.Handler<any, void>;

/**
 * @category model
 * @since 0.0.1
 */
export interface LambdaState<A> {
  appName: string;
  logger: L.Logger;
  event: A;
}

/**
 * @category model
 * @since 0.0.1
 */
export type Handler<A> = (
  state: LambdaState<A>
) => T.Task<readonly [E.Either<Error, void>, LambdaState<A>]>;

// -------------------------------------------------------------------------------------
// conversions
// -------------------------------------------------------------------------------------

/**
 * @category conversions
 * @since 0.0.1
 */
export function toLambda<A>(
  appName: string,
  codec: Decoder<unknown, A>,
  handler: Handler<A>
): AWSHandler {
  // Create logger instance and reporting functions
  const logger = L.makeLogger(appName);
  const debug = L.debug(logger);
  const info = L.info(logger);
  const error = Sentry.captureException(logger);

  const incrementMetric = (name: string) =>
    pipe(
      DD.incrementMetric({
        metricName: name,
        extraTags: { app_name: appName },
      }),
      T.asUnit
    );

  // Log that we've started running and initialize sentry
  const initialize = pipe(
    debug('Logger created'),
    IO.apSecond(Sentry.init(logger))
  );

  initialize();

  // Tries to create a LambdaState from the input AWS passed in
  const getInitialState = pipe(
    (event: A): LambdaState<A> => ({ appName, logger, event }),
    V.fromCodec(codec),
    (f) => flow(f, TE.fromEither)
  );

  // Task a validate state and executes the handler
  const run: (state: LambdaState<A>) => T.Task<void> = (state) => {
    const task = pipe(
      T.fromIO(info('Running handler')),
      T.flatMap((_) => handler(state)),
      T.flatMap(([result, { logger }]) => {
        if (E.isLeft(result)) {
          const error = Sentry.captureException(logger);
          return T.fromIO(error(result.left));
        } else {
          const info = L.info(logger);
          return T.fromIO(info('Handler finished successfully'));
        }
      })
    );

    return T.asUnit(task);
  };

  // Parse input from AWS and run the handler if valid
  const processEvent = flow(
    getInitialState,
    TE.fold(flow(error, T.fromIO), run)
  );

  return AWSLambda.wrapHandler((input: unknown, _context, _callback) => {
    const event =
      input && typeof input === 'object' && 'detail' in input
        ? input.detail
        : null;

    const program = T.sequenceSeqArray([
      incrementMetric('start'),
      T.fromIO(info({ event }, 'Received event')),
      processEvent(event),
      T.fromIO(info({ event }, 'Finished processing event')),
      incrementMetric('end'),
    ]);

    return T.asUnit(program)();
  });
}
