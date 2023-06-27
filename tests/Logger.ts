import * as L from '../src/Logger';
import * as S from 'fp-ts/lib/State';
import * as A from 'fp-ts/lib/ReadonlyArray';
import { IO, Apply, map, apSecond } from 'fp-ts/lib/IO';
import { sequenceT } from 'fp-ts/lib/Apply';
import Pino from 'pino';
import { pipe } from 'fp-ts/lib/function';

describe('Logging', () => {
  const message = 'This is a message %o';
  const mergeObject = { foo: 'bar' };
  const interpolationValue = { bar: 'foo' };

  const spy = jest.fn();

  afterEach(() => {
    spy.mockClear();
  });

  // Logger invocation
  it.each(['fatal', 'error', 'warn', 'info', 'debug', 'trace'] as L.LogLevel[])(
    'Log level %s',
    (level) => {
      const logger = Pino({
        level: 'trace',
      });

      logger[level] = spy;

      const log = L[level](logger);

      const argsList = [
        [message],
        [message, interpolationValue],
        [mergeObject],
        [mergeObject, message],
        [mergeObject, message, interpolationValue],
      ] as const;

      for (const args of argsList) {
        const io = log.apply(null, args as any);
        io();
        expect(spy).toHaveBeenLastCalledWith(...args);
      }
    }
  );

  // Logger composition
  it('Can be composed', () => {
    const inc =
      (x: number): S.State<L.Logger, IO<number>> =>
      (logger) => {
        const log = L.info(logger);
        return [
          pipe(
            log('called with %d', x),
            apSecond(() => x + 1)
          ),
          logger.child({ ['inc' + x]: 'called' }),
        ];
      };

    const steps = [inc(1), inc(2), inc(3)];

    const messages: any[] = [];
    const initialLogger = Pino({
      hooks: {
        logMethod(args, method, _level) {
          messages.push(args);
          return method.apply(this, args);
        },
      },
    });

    const [program, finalLogger] = pipe(
      initialLogger,
      S.sequenceArray(steps),
      ([ios, finalLogger]) => {
        const result = pipe(
          /* eslint-disable @typescript-eslint/no-non-null-assertion */
          [ios[0]!, ...ios.slice(1)] as const,
          (args) => sequenceT(Apply)(...args),
          map(A.last)
        );

        return [result, finalLogger] as const;
      }
    );

    finalLogger.info('one last message');
    finalLogger.flush();

    expect(program()).toMatchObject({ value: 4 });
    expect(messages).toMatchSnapshot();
    expect(finalLogger.bindings()).toMatchSnapshot();
  });
});
