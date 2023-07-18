/**
 * ```
 * export interface State {
 *   appName: string;
 *   logger: L.Logger;
 * }
 * ```
 *
 * ```
 * export type Main<A> = SRTE.StateReaderTaskEither<
 *   State,
 *   A,
 *   [Error, State],
 *   void
 * >;
 * ```
 *
 * ```
 * export interface Lambda<A> {
 *   appName?: string;
 *   logger?: L.Logger;
 *   codec: Type<A, any, unknown>;
 *   main: Main<A>;
 * }
 * ````
 *
 * This module is used to transform a `Lambda<A>` into a function that
 * AWSLambda can call.
 *
 * The handler contains a main function that is implemented as a
 * StateReaderTaskEither<State, A, [Error, State], void>. Not that the left type
 * is also a tuple linking an Error with a new state in the same way that the
 * right type usually does. This allows the State to be uploaded at some point
 * during the handler event if it eventually fails.
 *
 * Before the handler is invoked, the input from AWS will be validated using
 * io-ts. If any validation errors are signaled, the handler will never be
 * called and an exception will be sent to Sentry.
 *
 * @example
 * import * as TE from 'fp-ts/lib/TaskEither'
 * import * as t from 'io-ts';
 *
 * import * as L from 'arena-fp-ts/Lambda';
 *
 * const myCoolLambda: L.Lambda<string> = {
 *   codec: t.string,
 *   main: (state) => (_event) => TE.left([new Error("oof I don't do anything"), state])
 * }
 *
 * export const app = L.toAWSLambda(myCoolLambda);
 *
 * @since 0.0.1
 */

import { Type, Decoder } from 'io-ts';
import * as t from 'io-ts';

import { flow, pipe } from 'fp-ts/lib/function';

import * as IO from 'fp-ts/lib/IO';
import * as IOE from 'fp-ts/lib/IOEither';
import * as TE from 'fp-ts/lib/TaskEither';
import * as E from 'fp-ts/lib/Either';
import * as T from 'fp-ts/lib/Task';
import * as SRTE from 'fp-ts/lib/StateReaderTaskEither';

import * as L from './Logger';
import * as V from './validator';
import * as Sentry from './Sentry';
import * as DD from './DataDog';

import { AWSLambda } from '@sentry/serverless';
import * as AWS from 'aws-lambda';
import { formatValidationErrors } from 'io-ts-reporters';

// -------------------------------------------------------------------------------------
// model
// -------------------------------------------------------------------------------------

/**
 * @category model
 * @since 0.0.6
 */
export type AWSHandler<A> = AWS.Handler<{ detail: A }, void>;

/**
 * @deprecated Use State
 * @category model
 * @since 0.0.1
 */
export interface LambdaState<A> {
  appName: string;
  logger: L.Logger;
  event: A;
}

/**
 * @deprecated Use Main<A>
 * @since 0.0.1
 */
export type Handler<A> = (
  state: LambdaState<A>
) => T.Task<readonly [E.Either<Error, void>, LambdaState<A>]>;

/**
 * @category model
 * @since 0.0.6
 */
export interface State {
  appName: string;
  logger: L.Logger;
}

/**
 * @category model
 * @since 0.0.6
 */
export type Main<A> = SRTE.StateReaderTaskEither<
  State,
  A,
  [Error, State],
  void
>;

/**
 * @category model
 * @since 0.0.6
 */
export interface Lambda<A> {
  appName?: string;
  logger?: L.Logger;
  sentryDsn?: string;
  sentryEnvironment?: string;
  sentryRelease?: string;
  codec: Type<A, any, unknown>;
  main: Main<A>;
}

// -------------------------------------------------------------------------------------
// conversions
// -------------------------------------------------------------------------------------

/**
 * @deprecated Use toAWSLambda()
 * @category conversions
 * @since 0.0.8
 */
export function toLambda<A>(
  appName: string,
  codec: Decoder<unknown, A>,
  handler: Handler<A>
): AWSHandler<A> {
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

/**
 * @category conversions
 * @since 0.0.6
 */
export function toAWSLambda<A>(lambda: Lambda<A>): AWSHandler<A> {
  const appName =
    lambda.appName || process.env.npm_package_config_appName || 'Unnamed App';
  const logger = lambda.logger || L.makeLogger(appName);
  const initialState: State = {
    appName,
    logger,
  };
  const EventCodec = t.type({
    detail: lambda.codec,
  });

  const debug = L.debug(logger);
  const error = L.error(logger);
  const incrementMetric = (name: string) =>
    pipe(
      DD.incrementMetric({
        metricName: name,
        extraTags: { app_name: appName },
      }),
      T.asUnit
    );

  const validateInput = (input: unknown): TE.TaskEither<[Error, State], A> =>
    pipe(
      debug('Validating Input'),
      IO.apSecond(() => EventCodec.decode(input)),
      IOE.map((event) => event.detail),
      IOE.mapError(formatValidationErrors),
      IO.tap((result) => {
        if (E.isLeft(result)) {
          return error({ errors: result.left }, 'Input Validation Failed');
        } else {
          return debug({ result: result.right }, 'Input Validation Succeeded');
        }
      }),
      IOE.mapError(
        (errors) =>
          [
            new Error(`Validation Failed: ${errors.join('; ')}`),
            initialState,
          ] as [Error, State]
      ),
      TE.fromIOEither
    );

  const initialize = IO.sequenceArray([
    debug('Logging initialized'),
    Sentry.init(logger, {
      dsn: lambda.sentryDsn,
      release: lambda.sentryRelease,
      environment: lambda.sentryEnvironment,
    }),
  ]);
  initialize();

  return AWSLambda.wrapHandler((input: unknown, _context, _callback) => {
    const program = pipe(
      TE.fromTask(incrementMetric('start')),
      TE.apSecond(validateInput(input)),
      TE.flatMap(lambda.main(initialState)),
      T.map(E.toUnion),
      T.flatMapIO(([result, { logger }]) => {
        const info = L.info(logger);
        const error = L.error(logger);

        if (result instanceof Error) {
          return pipe(
            IO.of(result),
            IO.tap((err) => error({ err }, 'Lambda failed!')),
            IO.tap(Sentry.captureException(logger))
          );
        } else {
          return info('Lambda finished successfully');
        }
      }),
      T.apFirst(incrementMetric('end'))
    );

    return program().catch((err) => {
      error(
        { err },
        `Running the lambda resulted in an exception. This should not be able to happen \
because the main function should only communicate errors with the Either monad.`
      );
      Sentry.captureException(logger)(err)();
      incrementMetric('end');
    });
  });
}
