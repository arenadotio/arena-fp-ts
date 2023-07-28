/**
 * @since 0.0.11
 */
import { Refinement } from 'fp-ts/lib/Refinement';
import { Option } from 'fp-ts/lib/Option';
import { pipe } from 'fp-ts/lib/function';
import { Either } from 'fp-ts/lib/Either';

/**
 * @category refinements
 * @since 0.0.11
 */
export const isTagged: Refinement<unknown, { _tag: string }> = (
  u
): u is { _tag: string } => !!u && typeof u === 'object' && '_tag' in u;

/**
 * @category refinements
 * @since 0.0.11
 */
export const hasTag =
  <A extends [string, ...string[]]>(
    ...values: A
  ): Refinement<unknown, { _tag: A[number] }> =>
  (u: unknown): u is { _tag: A[number] } =>
    isTagged(u) && values.includes(u._tag);

/**
 * @category refinements
 * @since 0.0.11
 */
export const isOption = <A = unknown>(u: unknown): u is Option<A> =>
  pipe(u, hasTag('Some', 'None'));

/**
 * @category refinements
 * @since 0.0.11
 */
export const isEither = <E = unknown, A = unknown>(
  u: unknown
): u is Either<E, A> => pipe(u, hasTag('Left', 'Right'));
