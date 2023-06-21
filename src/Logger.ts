/**
 * `Logger` is a type re-exported from `pino` and can be used to wrap calls to
 * `pino` in `IO<void>` instances. Using the `State` monad, logging functions
 * can be composed while preserving changes they make to the logger bindings.
 *
 * @example
 * import pino from 'pino';
 *
 * import { pipe } from 'fp-ts/lib/function';
 * import * as IO from 'fp-ts/lib/IO';
 * import * as S from 'fp-ts/lib/State';
 * import * as A from 'fp-ts/lib/Apply';
 *
 * import * as L from '@arenadotio/arena-fp-ts/Logger';
 *
 * // If you have some general business logic functions
 * const f = (s: string) => s.toUpperCase();
 * const g = (n: number) => n * n;
 * const h = (b: boolean) => !b;
 *
 * // Create functions which produce State monads that can perform the logging
 * const step1 = (
 *     s: string,
 * ): S.State<L.Logger, IO.IO<string>> =>(
 *     logger,
 * ) => {
 *     const log = L.info(logger);
 *     // Return a tuple of the result and the next logger
 *     return [
 *         // Result logs a message, then returns the value of f(s)
 *         pipe(
 *             log('In step one with arg %s', s),
 *             IO.apSecond(() => f(s)),
 *         ),
 *         // Create a new logger for step2
 *         logger.child({ step1: 'called' })
 *     ]
 * }
 *
 * const step2 = (
 *     n: number,
 * ): S.State<L.Logger, IO.IO<number>> =>(
 *     logger,
 * ) => {
 *     const log = L.debug(logger);
 *     // Return a tuple of the result and the next logger
 *     return [
 *         // Result logs a message, then returns the value of f(s)
 *         pipe(
 *             log('In step two with arg %d', n),
 *             IO.apSecond(() => g(n)),
 *         ),
 *         // Create a new logger for step2
 *         logger.child({ step2: 'called' })
 *     ]
 * }
 *
 * const step3 = (
 *     b: boolean,
 * ): S.State<L.Logger, IO.IO<boolean>> =>(
 *     logger,
 * ) => {
 *     const log = L.info(logger);
 *     // Return a tuple of the result and the next logger
 *     return [
 *         // Result logs a message, then returns the value of h(b)
 *         pipe(
 *             log('In step three with arg %s', String(b)),
 *             IO.apSecond(() => h(b)),
 *         ),
 *         // Create a new logger for step2
 *         logger.child({ step3: 'called' })
 *     ]
 * }
 *
 * // Sequence the State monads
 * const [ios, finalLogger] = pipe(
 *     pino(),
 *     S.sequenceArray<L.Logger, IO.IO<string | number | boolean>>([
 *         step1('foo'),
 *         step2(2),
 *         step3(true)
 *     ]),
 * );
 *
 * // Sequence the IOs into a single function
 * const program = pipe(
 *     // Convert the array into a tuple
 *     [ios[0]!, ...ios.slice(1)] as const,
 *     (args) => A.sequenceT(IO.Apply)(...args),
 * )
 *
 * assert.deepStrictEqual(program(), ['FOO', 4, false]);
 * assert.deepStrictEqual(
 *     finalLogger.bindings(),
 *     {
 *         step1: 'called',
 *         step2: 'called',
 *         step3: 'called',
 *     }
 * )
 *
 * @since 0.0.1
 */

import Pino from 'pino';
import { IO } from 'fp-ts/lib/IO';

// -------------------------------------------------------------------------------------
// model
// -------------------------------------------------------------------------------------

/**
 * @category model
 * @since 0.0.1
 */
export type PinoLogger = ReturnType<typeof Pino>;

/**
 * @category model
 * @since 0.0.1
 */
export type LogLevel = Pino.Level;

/**
 * @category model
 * @since 0.0.1
 */
interface LogFn {
  (obj: unknown, msg?: string, ...args: any[]): IO<void>;
  (msg: string, ...args: any[]): IO<void>;
}

/**
 * @category model
 * @since 0.0.1
 */
export type Logger = ReturnType<typeof Pino>;

// -------------------------------------------------------------------------------------
// utils
// -------------------------------------------------------------------------------------

/**
 * @category utils
 * @since 0.0.1
 */
export function fatal(logger: Logger): LogFn {
  return (...args: any): IO<void> =>
    () => {
      logger.fatal.apply(logger, args);
    };
}

/**
 * @category utils
 * @since 0.0.1
 */
export function error(logger: Logger): LogFn {
  return (...args: any): IO<void> =>
    () => {
      logger.error.apply(logger, args);
    };
}

/**
 * @category utils
 * @since 0.0.1
 */
export function warn(logger: Logger): LogFn {
  return (...args: any): IO<void> =>
    () => {
      logger.warn.apply(logger, args);
    };
}

/**
 * @category utils
 * @since 0.0.1
 */
export function info(logger: Logger): LogFn {
  return (...args: any): IO<void> =>
    () => {
      logger.info.apply(logger, args);
    };
}

/**
 * @category utils
 * @since 0.0.1
 */
export function debug(logger: Logger): LogFn {
  return (...args: any): IO<void> =>
    () => {
      logger.debug.apply(logger, args);
    };
}

/**
 * @category utils
 * @since 0.0.1
 */
export function trace(logger: Logger): LogFn {
  return (...args: any): IO<void> =>
    () => {
      logger.trace.apply(logger, args);
    };
}
