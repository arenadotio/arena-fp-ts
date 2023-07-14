/**
 * Functions to capture exception in sentry:
 *
 * @example
 * import * as E from 'fp-ts/lib/Either';
 * import * as IO from 'fp-ts/lib/IO';
 * import { pipe } from 'fp-ts/lib/function';
 * import * as L from 'arena-fp-ts/Logger';
 * import * as Sentry from 'arena-fp-ts/Sentry';
 *
 * export function foo(logger: L.Logger, data: E.Either<Error, number>) {
 *    if(E.isLeft(data)) {
 *      // oh no, this is an error
 *      const program = pipe(
 *        Sentry.init(logger),
 *        IO.apSecond(Sentry.captureException(logger)(data.left)),
 *      )
 *
 *      program();
 *    }
 * }
 *
 * @since 0.0.1
 */

import {
  Scope,
  captureException as _captureException,
  withScope as _withScope,
  init as _init,
  NodeOptions,
} from '@sentry/node';

import { RewriteFrames } from '@sentry/integrations';
import { CaptureContext, Primitive } from '@sentry/types';
import { pipe } from 'fp-ts/lib/function';

import * as IO from 'fp-ts/lib/IO';
import * as RIO from 'fp-ts/lib/ReaderIO';
import * as R from 'fp-ts/lib/Reader';

import * as L from './Logger';

// -------------------------------------------------------------------------------------
// constructors
// -------------------------------------------------------------------------------------

/**
 * @internal
 */
export const getNodeOptions: R.Reader<
  Partial<NodeOptions> | undefined,
  NodeOptions
> = (options?): NodeOptions => ({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.releaseEnv || process.env.PGD_ENVIRONMENT,
  release: process.env.releaseName || process.env.SENTRY_RELEASE,
  autoSessionTracking: false,
  debug: true,
  enableTracing: false,
  tracesSampleRate: 0,
  integrations: [
    new RewriteFrames({
      root: __dirname || process.cwd(),
    }),
  ],
  ...(options || {}),
});

// -------------------------------------------------------------------------------------
// utils
// -------------------------------------------------------------------------------------

/**
 * @internal
 */
export const init = (
  logger: L.Logger,
  options?: Partial<NodeOptions>
): IO.IO<void> => {
  const debug = L.debug(logger);
  const info = L.info(logger);

  return pipe(
    getNodeOptions(options),
    (options) =>
      IO.of({ ...options, initialScope: { tags: logger.bindings() } }),
    IO.tap((options) => debug({ options }, 'Initializing Sentry')),
    IO.tap((options) => () => _init(options)),
    IO.tap((options) => info({ options }, 'Sentry initialized'))
  );
};
/**
 * @internal
 */
const setTags =
  (tags: Record<string, Primitive>): RIO.ReaderIO<Scope, void> =>
  (scope: Scope): IO.IO<void> =>
  () => {
    scope.setTags(tags);
  };

/**
 * @internal
 */
const withScope =
  (initializeScope: RIO.ReaderIO<Scope, void>) =>
  <A>(action: IO.IO<A>): IO.IO<void> =>
  () =>
    _withScope((scope) => {
      const program = pipe(
        initializeScope(scope),
        IO.apSecond(action),
        IO.asUnit
      );

      return program();
    });

/**
 * @internal
 */
const setLoggerBindings =
  (logger: L.Logger): RIO.ReaderIO<Scope, void> =>
  (scope: Scope): IO.IO<void> =>
    pipe(scope, setTags(logger.bindings()));

/**
 * @category utils
 * @since 0.0.1
 */
export const captureException =
  (logger: L.Logger) =>
  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  (err: any, context?: CaptureContext): IO.IO<void> =>
  () => {
    const ex: Error = err instanceof Error ? err : new Error(String(err));
    const log = L.error(logger);
    const capture: IO.IO<string> = () => _captureException(ex, context);

    const program = pipe(
      log({ err: ex }, ex.message),
      IO.apSecond(capture),
      withScope(setLoggerBindings(logger))
    );

    return program();
  };
