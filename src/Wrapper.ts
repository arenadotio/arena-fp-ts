/**
 * A `Wrapper<F>` is a function that can be used to wrap a function with
 * stateful operations.
 *
 * @example
 * import { log } from 'fp-ts/lib/Console';
 * import { IO, Apply } from 'fp-ts/lib/IO';
 * import { wrapT } from 'arena-fp-ts/Wrapper';
 *
 * const sqr = (x: number) => x * x;
 *
 * // I create a wrapper for the type I want by passing in an Apply instance
 * const wrapper = wrapT(Apply);
 *
 * // I want to run `sqr` between to operations contained in `IO<void>` types,
 * // so I need to lift `sqr` into an `IO<number>`.
 * const liftSqr: (x: number) => IO<number> = (x) => () => sqr(x);
 *
 * const wrappedFn = wrapper(
 *  log('About to call sqr'),
 *  liftSqr(5),
 *  log('Finished sqr'),
 * );
 *
 * assert.deepStrictEqual(wrappedFn(), 25) // log messages sent to console
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
import {
  Apply,
  Apply1,
  Apply2,
  Apply2C,
  Apply3,
  Apply3C,
  Apply4,
  sequenceT,
} from 'fp-ts/lib/Apply';

// -------------------------------------------------------------------------------------
// model
// -------------------------------------------------------------------------------------

/**
 * @category model
 * @since 0.0.1
 */
export interface Wrapper<F> {
  <A>(prolog: HKT<F, any>, ma: HKT<F, A>): HKT<F, A>
  <A>(prolog: HKT<F, any>, ma: HKT<F, A>, epolog: HKT<F, any>): HKT<F, A>
}

/**
 * @category model
 * @since 0.0.1
 */
export interface Wrapper1<F extends URIS> {
  <A>(prolog: Kind<F, any>, ma: Kind<F, A>): Kind<F, A>
  <A>(prolog: Kind<F, any>, ma: Kind<F, A>, epolog: Kind<F, any>): Kind<F, A>
}

/**
 * @category model
 * @since 0.0.1
 */
export interface Wrapper2<F extends URIS2> {
  <E, A>(prolog: Kind2<F, E, any>, ma: Kind2<F, E, A>): Kind2<F, E, A>;
  <E, A>(
    prolog: Kind2<F, E, any>,
    ma: Kind2<F, E, A>,
    epolog: Kind2<F, E, any>
  ): Kind2<F, E, A>;
}

/**
 * @category model
 * @since 0.0.1
 */
export interface Wrapper2C<F extends URIS2, E> {
  <A>(prolog: Kind2<F, E, any>, ma: Kind2<F, E, A>): Kind2<F, E, A>;
  <A>(
    prolog: Kind2<F, E, any>,
    ma: Kind2<F, E, A>,
    epolog: Kind2<F, E, any>
  ): Kind2<F, E, A>;
}

/**
 * @category model
 * @since 0.0.1
 */
export interface Wrapper3<F extends URIS3> {
  <R, E, A>(prolog: Kind3<F, R, E, any>, ma: Kind3<F, R, E, A>): Kind3<
    F,
    R,
    E,
    A
  >;
  <R, E, A>(
    prolog: Kind3<F, R, E, any>,
    ma: Kind3<F, R, E, A>,
    epolog: Kind3<F, R, E, any>
  ): Kind3<F, R, E, A>;
}

/**
 * @category model
 * @since 0.0.1
 */
export interface Wrapper3C<F extends URIS3, E> {
  <R, A>(prolog: Kind3<F, R, E, any>, ma: Kind3<F, R, E, A>): Kind3<F, R, E, A>;
  <R, A>(
    prolog: Kind3<F, R, E, any>,
    ma: Kind3<F, R, E, A>,
    epolog: Kind3<F, R, E, any>
  ): Kind3<F, R, E, A>;
}

/**
 * @category model
 * @since 0.0.1
 */
export interface Wrapper4<F extends URIS4> {
  <S, R, E, A>(prolog: Kind4<F, S, R, E, any>, ma: Kind4<F, S, R, E, A>): Kind4<
    F,
    S,
    R,
    E,
    A
  >;
  <S, R, E, A>(
    prolog: Kind4<F, S, R, E, any>,
    ma: Kind4<F, S, R, E, A>,
    epolog: Kind4<F, S, R, E, any>
  ): Kind4<F, S, R, E, A>;
}

/**
 * @category type lambdas
 * @since 0.0.1
 */
export const URI = 'Wrapper'

/**
 * @category type lambdas
 * @since 0.0.1
 */
export type URI = typeof URI

declare module 'fp-ts/lib/HKT' {
  interface URItoKind<A> {
    readonly [URI]: Wrapper<A>;
  }
}

// -------------------------------------------------------------------------------------
// sequencing
// -------------------------------------------------------------------------------------

/**
 * @category utils
 * @since 0.0.1
 */
export function wrapT<F extends URIS4>(F: Apply4<F>): Wrapper4<F>
export function wrapT<F extends URIS3>(F: Apply3<F>): Wrapper3<F>
export function wrapT<F extends URIS3, E>(F: Apply3C<F, E>): Wrapper3C<F, E>
export function wrapT<F extends URIS2>(F: Apply2<F>): Wrapper2<F>
export function wrapT<F extends URIS2, E>(F: Apply2C<F, E>): Wrapper2C<F, E>
export function wrapT<F extends URIS>(F: Apply1<F>): Wrapper1<F>
export function wrapT<F extends URIS>(F: Apply<F>): Wrapper<F>
export function wrapT<F extends URIS>(F: Apply<F>): any {
  const sequencer = sequenceT(F)

  const fn: any = <A>(
    prolog: HKT<F, any>,
    ma: HKT<F, A>,
    epolog: HKT<F, any> | null = null
  ): any => {
    const args = [prolog, ma, ...(epolog ? [epolog] : [])] as const

    return F.map(sequencer(...args), ([_first, second]) => second)
  }

  return fn
}
