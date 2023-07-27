/**
 * @since 0.0.7
 */

import { flow, LazyArg, pipe } from 'fp-ts/lib/function';
import { Validation } from 'io-ts';
import { formatValidationErrors } from 'io-ts-reporters';
import * as Str from 'fp-ts-std/String';
import * as TE from 'fp-ts/lib/TaskEither';
import * as E from 'fp-ts/lib/Either';

// -------------------------------------------------------------------------------------
// models
// -------------------------------------------------------------------------------------

/**
 * @category models
 * @since 0.0.7
 */
export type TaskEither<A> = TE.TaskEither<Error, A>;

// -------------------------------------------------------------------------------------
// utils
// -------------------------------------------------------------------------------------

/**
 * @internal
 */
export const errorFromValidation: <A>(ma: Validation<A>) => E.Either<Error, A> =
  flow(
    E.mapLeft(formatValidationErrors),
    E.mapLeft(Str.unlines),
    E.mapLeft(Str.prepend('Validation Failed\n')),
    E.mapLeft((str) => new Error(str))
  );

/**
 * @category mapping
 * @since 0.0.7
 */
export const flatMapValidation =
  <A, B>(f: (a: A) => Validation<B>) =>
  (self: TaskEither<A>): TaskEither<B> =>
    pipe(self, TE.map(f), TE.flatMapEither(errorFromValidation));

// -------------------------------------------------------------------------------------
// utils
// -------------------------------------------------------------------------------------

/**
 * @category utils
 * @since 0.0.7
 */
export const tryCatch = <A>(f: LazyArg<Promise<A>>): TaskEither<A> =>
  TE.tryCatch(f, E.toError);
