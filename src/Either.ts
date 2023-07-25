/**
 * @since 0.0.10
 */

import * as E from 'fp-ts/lib/Either';
import { flow, LazyArg } from 'fp-ts/lib/function';
import { Validation } from 'io-ts';
import { formatValidationErrors } from 'io-ts-reporters';
import * as Str from 'fp-ts-std/String';

// -------------------------------------------------------------------------------------
// models
// -------------------------------------------------------------------------------------

/**
 * @category models
 * @since 0.0.10
 */
export type Either<A> = E.Either<Error, A>;

// -------------------------------------------------------------------------------------
// utils
// -------------------------------------------------------------------------------------

/**
 * @category utils
 * @since 0.0.10
 */
export const fromValidation: <A>(ma: Validation<A>) => Either<A> = flow(
  E.mapLeft(formatValidationErrors),
  E.mapLeft(Str.unlines),
  E.mapLeft(Str.prepend('Validation Failed\n')),
  E.mapLeft((str) => new Error(str))
);

/**
 * @category utils
 * @since 0.0.10
 */
export const tryCatch = <A>(f: LazyArg<A>) => E.tryCatch(f, E.toError);
