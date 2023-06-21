/**
 * ```ts
 * export interface Validator<A, B> {
 *   (f: (a: A) => B): (a: A) => Validation<B>;
 * }
 * ```
 *
 * `Validator<A, B>` is a type that can take a function A => B and provide
 * runtime validation to it.
 *
 * @example
 * import * as t from 'io-ts';
 * import { isLeft, isRight } from 'fp-ts/lib/Either';
 * import { pipe } from 'fp-ts/lib/function';
 * import { fromCodec } from '@arenadotio/arena-fp-ts/validator';
 *
 * const UserCodec = t.type({
 * name: t.string,
 *  password: t.string,
 * });
 *
 * type User = t.TypeOf<typeof UserCodec>;
 *
 * const ValidUser = { name: 'foo', password: 'bar' };
 * const InvalidUser = { name: 'foo' };
 *
 * const f = (user: User) => user.password; // User => string
 * const f2 = pipe(
 *   f,
 *   fromCodec(UserCodec),
 * );  // unknown => t.Validation<string>
 *
 * assert.deepStrictEqual(isRight(f2(ValidUser as any)), true);
 * assert.deepStrictEqual(isLeft(f2(InvalidUser as any)), true);
 *
 * @since 0.0.1
 */

import * as E from 'fp-ts/lib/Either'
import { flow } from 'fp-ts/lib/function'
import { Decoder, Validation } from 'io-ts'

// -------------------------------------------------------------------------------------
// model
// -------------------------------------------------------------------------------------

/**
 * @category model
 * @since 0.0.1
 */
export interface Validator<A, B> {
  (f: (a: A) => B): (a: A) => Validation<B>
}

// -------------------------------------------------------------------------------------
// constructors
// -------------------------------------------------------------------------------------

/**
 * @category constructors
 * @since 0.0.1
 */
export function fromCodec<A, B>(codec: Decoder<unknown, A>): Validator<A, B> {
  return (f) => flow(codec.decode, E.map(f))
}
