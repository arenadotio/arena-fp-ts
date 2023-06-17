/**
 * A `Wrapper<F>` is a function that can be used to wrap a function with
 * stateful operations.
 *
 * @example
 * import { log } from 'fp-ts/lib/Console';
 * import { IO, Chain } from 'fp-ts/lib/IO';
 * import { wrapWithContextT } from 'arena-fp-ts/WrapperWithContext';
 *
 * const sqr = (x: number) => x * x;
 *
 * // I create a wrapper for the type I want by passing in an Chain instance
 * const wrapper = wrapWithContextT(Chain);
 *
 * // I want to run `sqr` between to operations contained in `IO<void>` types,
 * // so I need to lift `sqr` into an `IO<number>`.
 * const liftSqr: (x: number) => IO<number> = (x) => () => sqr(x);
 *
 * const wrappedWithContextFn = wrapper(
 *   (x) => log(`Going to find the sqr of ${x}`),
 *   liftSqr,
 *   (x, y) => log(`sqr of ${x} is ${y}`)
 * );
 *
 * const fn = wrappedWithContextFn(5)
 *
 * assert.deepStrictEqual(fn(), 25) // log messages sent to console
 *
 * @since 0.0.1
 */
import {
  HKT,
  Kind,
  Kind2,
  Kind3,
  Kind4,
  URIS,
  URIS2,
  URIS3,
  URIS4,
} from 'fp-ts/HKT';
import { sequenceT } from 'fp-ts/lib/Apply';
import {
  Chain,
  Chain1,
  Chain2,
  Chain2C,
  Chain3,
  Chain3C,
  Chain4,
} from 'fp-ts/lib/Chain';
import { flow, pipe } from 'fp-ts/lib/function';

// -------------------------------------------------------------------------------------
// model
// -------------------------------------------------------------------------------------

/**
 * @category model
 * @since 0.0.1
 */
export interface WrapperWithContext<F> {
  <A, B>(prolog: (a: A) => HKT<F, any>, ma: (a: A) => HKT<F, B>): (
    a: A
  ) => HKT<F, B>;
  <A, B>(
    prolog: (a: A) => HKT<F, any>,
    ma: (a: A) => HKT<F, B>,
    epolog: (a: A, b: B) => HKT<F, any>
  ): (a: A) => HKT<F, B>;
}

/**
 * @category model
 * @since 0.0.1
 */
export interface WrapperWithContext1<F extends URIS> {
  <A, B>(prolog: (a: A) => Kind<F, any>, ma: (a: A) => Kind<F, B>): (
    a: A
  ) => Kind<F, B>;
  <A, B>(
    prolog: (a: A) => Kind<F, any>,
    ma: (a: A) => Kind<F, B>,
    epolog: (a: A, b: B) => Kind<F, any>
  ): (a: A) => Kind<F, B>;
}

/**
 * @category model
 * @since 0.0.1
 */
export interface WrapperWithContext2<F extends URIS2> {
  <E, A, B>(prolog: (a: A) => Kind2<F, E, any>, ma: (a: A) => Kind2<F, E, B>): (
    a: A
  ) => Kind2<F, E, B>;
  <E, A, B>(
    prolog: (a: A) => Kind2<F, E, any>,
    ma: (a: A) => Kind2<F, E, B>,
    epolog: (a: A, b: B) => Kind2<F, E, any>
  ): (a: A) => Kind2<F, E, B>;
}

/**
 * @category model
 * @since 0.0.1
 */
export interface WrapperWithContext2C<F extends URIS2, E> {
  <A, B>(prolog: (a: A) => Kind2<F, E, any>, ma: (a: A) => Kind2<F, E, B>): (
    a: A
  ) => Kind2<F, E, B>;
  <A, B>(
    prolog: (a: A) => Kind2<F, E, any>,
    ma: (a: A) => Kind2<F, E, B>,
    epolog: (a: A, b: B) => Kind2<F, E, any>
  ): (a: A) => Kind2<F, E, B>;
}

/**
 * @category model
 * @since 0.0.1
 */
export interface WrapperWithContext3<F extends URIS3> {
  <R, E, A, B>(
    prolog: (a: A) => Kind3<F, R, E, any>,
    ma: (a: A) => Kind3<F, R, E, B>
  ): (a: A) => Kind3<F, R, E, B>;
  <R, E, A, B>(
    prolog: (a: A) => Kind3<F, R, E, any>,
    ma: (a: A) => Kind3<F, R, E, B>,
    epolog: (a: A, b: B) => Kind3<F, R, E, any>
  ): (a: A) => Kind3<F, R, E, B>;
}

/**
 * @category model
 * @since 0.0.1
 */
export interface WrapperWithContext3C<F extends URIS3, E> {
  <R, A, B>(
    prolog: (a: A) => Kind3<F, R, E, any>,
    ma: (a: A) => Kind3<F, R, E, B>
  ): (a: A) => Kind3<F, R, E, B>;
  <R, A, B>(
    prolog: (a: A) => Kind3<F, R, E, any>,
    ma: (a: A) => Kind3<F, R, E, B>,
    epolog: (a: A, b: B) => Kind3<F, R, E, any>
  ): (a: A) => Kind3<F, R, E, B>;
}

/**
 * @category model
 * @since 0.0.1
 */
export interface WrapperWithContext4<F extends URIS4> {
  <S, R, E, A, B>(
    prolog: (a: A) => Kind4<F, S, R, E, any>,
    ma: (a: A) => Kind4<F, S, R, E, B>
  ): (a: A) => Kind4<F, S, R, E, B>;
  <S, R, E, A, B>(
    prolog: (a: A) => Kind4<F, S, R, E, any>,
    ma: (a: A) => Kind4<F, S, R, E, B>,
    epolog: (a: A, b: B) => Kind4<F, S, R, E, any>
  ): (a: A) => Kind4<F, S, R, E, B>;
}

/**
 * @category type lambdas
 * @since 0.0.1
 */
export const URI = 'WrapperWithContext'

/**
 * @category type lambdas
 * @since 0.0.1
 */
export type URI = typeof URI

declare module 'fp-ts/lib/HKT' {
  interface URItoKind<A> {
    readonly [URI]: WrapperWithContext<A>;
  }
}

// -------------------------------------------------------------------------------------
// sequencing
// -------------------------------------------------------------------------------------

/**
 * @category utils
 * @since 0.0.1
 */
export function wrapWithContextT<F extends URIS4>(
  F: Chain4<F>
): WrapperWithContext4<F>;
export function wrapWithContextT<F extends URIS3>(
  F: Chain3<F>
): WrapperWithContext3<F>;
export function wrapWithContextT<F extends URIS3, E>(
  F: Chain3C<F, E>
): WrapperWithContext3C<F, E>;
export function wrapWithContextT<F extends URIS2>(
  F: Chain2<F>
): WrapperWithContext2<F>;
export function wrapWithContextT<F extends URIS2, E>(
  F: Chain2C<F, E>
): WrapperWithContext2C<F, E>;
export function wrapWithContextT<F extends URIS>(
  F: Chain1<F>
): WrapperWithContext1<F>;
export function wrapWithContextT<F extends URIS>(
  F: Chain<F>
): WrapperWithContext<F>;
export function wrapWithContextT<F extends URIS>(F: Chain<F>): any {
  const fn = <A, B>(
    prolog: (a: A) => HKT<F, any>,
    f: (a: A) => HKT<F, B>,
    epolog: ((a: A, b: B) => HKT<F, any>) | null = null
  ) => {
    const part1 = flow(
      (a: A) => [prolog(a), f(a)] as const,
      (args) => sequenceT(F)(...args),
      (m) => F.map(m, ([_first, second]) => second)
    )

    if (epolog) {
      const epologC = (a: A) => (b: B) =>
        pipe(epolog(a, b), (m) => F.map(m, (_) => b))
      return (a: A) => pipe(a, part1, (mb) => F.chain(mb, epologC(a)))
    } else {
      return part1
    }
  }

  return fn
}
