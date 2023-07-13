/**
 * In addition to the various types and utility functions, this module registers
 * new matchers into Jest's `expect` module along with the matchers provided by
 * `@relmify/jest-fp-ts`. Importing this module at the type of any test file
 * will make these matchers available, but you can also add to your
 * `jest.config.js`:
 *
 * ```
 * module.exports = {
 *   ...
 *   setupFilesAfterEnv: ['arena-fp-ts/Jest'],
 *   ...
 * };
 * ```
 *
 * @since 0.0.5
 */
import { matchers } from '@relmify/jest-fp-ts';

import * as SRTE from 'fp-ts/lib/StateReaderTaskEither';
import * as RTE from 'fp-ts/lib/ReaderTaskEither';
import * as TE from 'fp-ts/lib/TaskEither';
import * as A from 'fp-ts/lib/Array';
import * as O from 'fp-ts/lib/Option';

import * as L from './Logger';

import { Type } from 'io-ts';

import { expect } from '@jest/globals';
import { equals } from '@relmify/jest-fp-ts/dist/predicates/equals';
import { isEitherOrThese } from '@relmify/jest-fp-ts/dist/predicates/isEitherOrThese';
import {
  EitherOrThese,
  fold,
  isRight,
} from '@relmify/jest-fp-ts/dist/eitherOrThese/eitherOrThese';
import { constFalse, flow, pipe } from 'fp-ts/lib/function';
import {
  matcherHint,
  printDiffOrStringify,
  printExpected,
  printReceived,
} from 'jest-matcher-utils';
import { State } from './Lambda';

// -------------------------------------------------------------------------------------
// model
// -------------------------------------------------------------------------------------

/**
 * @category models
 * @since 0.0.5
 */
export type StateReaderTaskEitherPropertyNames<T> = {
  [K in keyof T]: T[K] extends SRTE.StateReaderTaskEither<any, any, any, any>
    ? K
    : never;
}[keyof T] &
  string;

// -------------------------------------------------------------------------------------
// utils
// -------------------------------------------------------------------------------------

/**
 * Spies on a StateReaderTaskEither and mocks the ReaderTaskEither that it
 * returns.
 *
 * ```
 * import { pipe } from 'fp-ts/lib/function';
 * import * as TE from 'fp-ts/lib/TaskEither';
 * import * as E from 'fp-ts/lib/Either';
 * import { mockStateReaderTaskEither } from 'arena-fp-ts/Jest';
 *
 * import * as fakeModule from 'my-fake-module';
 *
 * describe(mockStateReaderTaskEither, () => {
 *     it('can mock on StateReaderTaskEither return values', async () => {
 *         const [spy] = mockStateReaderTaskEither(fakeModule, 'testFunction');
 *         spy.mockReturnValue(TE.of([10, 'foo']));
 *
 *         const program = pipe(
 *             1,
 *             fakeModule.testFunction('some state'),
 *         );
 *         const result = await program();
 *
 *         expect(E.isRight(result) && result.right).toEqual([10, 'foo']);
 *     });
 *
 *     it('can spy on reader arguments', async () => {
 *         const [spy] = mockStateReaderTaskEither(fakeModule, 'testFunction');
 *
 *         const program = pipe(
 *             1,
 *             fakeModule.testFunction('some state'),
 *         );
 *         await program();
 *
 *         expect(spy).toHaveBeenCalledWith(1);
 *     });
 *
 *     it('can spy on state arguments', async () => {
 *         const [_, spy] = mockStateReaderTaskEither(fakeModule, 'testFunction');
 *
 *         const program = pipe(
 *             1,
 *             fakeModule.testFunction('some state'),
 *         );
 *         await program();
 *
 *         expect(spy).toHaveBeenCalledWith('some state');
 *     });
 * });
 * ```
 *
 * @category utils
 * @since 0.0.5
 */
export function mockStateReaderTaskEither<
  S,
  R,
  E,
  A,
  T extends Record<string, unknown>,
  M extends StateReaderTaskEitherPropertyNames<Required<T>>
>(
  object: T,
  property: M
): Required<T>[M] extends SRTE.StateReaderTaskEither<any, any, any, any>
  ? [
      jest.SpyInstance<TE.TaskEither<E, [A, S]>, [S]>,
      jest.SpyInstance<RTE.ReaderTaskEither<R, E, [A, S]>, [S]>
    ]
  : never {
  const fn = jest.fn(() => TE.of(undefined));

  const spy = jest.spyOn(object, property as any);

  spy.mockReturnValue(fn as any);

  return [fn, spy] as any;
}

/**
 * @category utils
 * @since 0.0.6
 */
export function mockLambda<A>(
  codec: Type<A, any, unknown>,
  returnValue: (state: State) => TE.TaskEither<[Error, State], [void, State]>
): [
  {
    codec: Type<A, any, unknown>;
    main: jest.Mock<
      RTE.ReaderTaskEither<A, [Error, State], [void, State]>,
      [State]
    >;
  },
  jest.Mock<TE.TaskEither<[Error, State], [void, State]>, [A]>
] {
  const appName = 'mock';
  const logger = L.makeLogger(appName);
  const state: State = {
    appName,
    logger,
  };
  const ret = returnValue(state);
  const rte = jest.fn((_: A) => ret);
  const main = jest.fn((_: State) => rte);

  return [
    {
      codec,
      main,
    },
    rte,
  ] as any;
}

// -------------------------------------------------------------------------------------
// Jest matchers
// -------------------------------------------------------------------------------------

/** @internal */
const applyPredicateRightTuple =
  (accessor: (as: unknown[]) => O.Option<unknown>) =>
  (predicate: (rightResultValue: unknown) => boolean) =>
  (received: EitherOrThese<unknown, unknown>): boolean =>
    pipe(
      received,
      fold(
        constFalse,
        flow(
          O.fromPredicate(Array.isArray),
          O.flatMap(accessor),
          O.filter(predicate),
          O.isSome
        ),
        constFalse
      )
    );

/** @internal */
const applyEqualsRightTupleMatcher =
  (matcherName: string, accessor: (as: unknown[]) => O.Option<unknown>) =>
  (received: unknown, expected: unknown): any => {
    const applyPredicate = pipe(
      equals(expected),
      applyPredicateRightTuple(accessor)
    );

    if (!isEitherOrThese(received)) {
      return {
        pass: false,
        message: () =>
          [
            matcherHint(matcherName, 'received', 'expected'),
            '\n',
            'Received value is not an Either or These.',
            `Received: ${printReceived(received)}`,
          ].join('\n'),
      };
    } else if (!isRight(received)) {
      return {
        pass: false,
        message: () =>
          [
            matcherHint(matcherName, 'received', 'expected'),
            '\n',
            'Received value is not Right.',
            `Received: ${printReceived(received)}`,
          ].join('\n'),
      };
    } else if (!Array.isArray(received.right) || received.right.length !== 2) {
      return {
        pass: false,
        message: () =>
          [
            matcherHint(matcherName, 'received', 'expected'),
            '\n',
            'Received value is not a tuple: [result, state].',
            `Received: ${printReceived(received.right)}`,
          ].join('\n'),
      };
    } else if (!applyPredicate(received)) {
      return {
        pass: false,
        message: () =>
          [
            matcherHint(matcherName, 'received', 'expected'),
            '\n',
            printDiffOrStringify(
              expected,
              O.toNullable(accessor(received.right as any)),
              'Expected',
              'Received.right',
              true
            ),
          ].join('\n'),
      };
    } else {
      return {
        pass: true,
        message: () =>
          [
            matcherHint('.not.' + matcherName, 'received', 'expected'),
            '\n',
            `Expected: not ${printExpected(expected)}`,
          ].join('\n'),
      };
    }
  };

/**
 * Checks that the received value is a `Right` `Either` or `These` and that its
 * value is a tuple `[result, state]`. It finally checks that the `result` is
 * equal to the expected value using Jest's `toEqual()`.
 *
 * This is useful when testing the `State` monad or its derivatives.
 *
 * ```
 * describe('toHaveRightValueWithResult', () => {
 *   it('matches against a right result value', () => {
 *     expect(E.right([{ foo: 'bar' }, 'some state'])).toHaveRightValueWithResult({
 *       foo: 'bar',
 *     });
 *   });
 * });
 * ```
 *
 * @category matchers
 * @since 0.0.5
 */
export const toHaveRightValueWithResult = applyEqualsRightTupleMatcher(
  'toHaveRightValueWithResult',
  A.head
);

/**
 * Checks that the received value is a `Right` `Either` or `These` and that its
 * value is a tuple `[result, state]`. It finally checks that the `state` is
 * equal to the expected value using Jest's `toEqual()`.
 *
 * This is useful when testing the `State` monad or its derivatives.
 *
 * ```
 * describe('toHaveRightValueWithState', () => {
 *   it('matches against a right result value', () => {
 *     expect(E.right([{ foo: 'bar' }, 'some state'])).toHaveRightValueWithState(
 *       'some state'
 *     );
 *   });
 * });
 * ```
 *
 * @category matchers
 * @since 0.0.5
 */
export const toHaveRightValueWithState = applyEqualsRightTupleMatcher(
  'toHaveRightValueWithState',
  A.lookup(1)
);

/** @internal */
type Matchers<T = typeof matchers> = {
  [K in keyof T]: T[K] extends (...args: [any, ...infer R]) => any
    ? (...args: R) => any
    : never;
};

/** @internal */
type CustomMatchers<R = unknown> = Matchers & {
  /**
   * Use `.toHaveRightValueWithResult` to check if a value is an `Either` or
   * `These`, that it is `Right`, its value is a tuple `[result, state]`, and
   * that the `result` is equal to an expected value.
   *
   * Equality is checked with Jest's `.toEqual()` comparison.
   */
  toHaveRightValueWithResult(expected: unknown): R;

  /**
   * Use `.toHaveRightValueWithResult` to check if a value is an `Either` or
   * `These`, that it is `Right`, its value is a tuple `[result, state]`, and
   * that the `state` is equal to an expected value.
   *
   * Equality is checked with Jest's `.toEqual()` comparison.
   */
  toHaveRightValueWithState(expected: unknown): R;
};

expect.extend({
  toHaveRightValueWithResult,
  toHaveRightValueWithState,
  ...matchers,
});

declare module 'expect' {
  /* eslint-disable-next-line @typescript-eslint/no-empty-interface */
  interface Matchers<R> extends CustomMatchers<R> {}
}
