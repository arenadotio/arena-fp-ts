/**
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
// export type Logger = {
//     log: (level: LogLevel) => LoggerIO<LogFnArgs>;
// }

export type Logger = ReturnType<typeof Pino>;

// -------------------------------------------------------------------------------------
// constructors
// -------------------------------------------------------------------------------------

/**
 * @category constructors
 * @since 0.0.1
 */
// export const fromPinoLogger: (logger: PinoLogger) => Logger = (
//     logger
// ) => {
//     return {
//         log: (
//             level
//         ) => ([
//             messageOrMergeObject,
//             message,
//             ...interpolationArgs
//         ]) => () => {
//             logger[level](
//                 messageOrMergeObject,
//                 message,
//                 ...interpolationArgs
//             );
//         },
//     }
// };

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
