/**
 * @since 0.0.1
 */

import * as O from 'fp-ts/lib/Option';
import * as TO from 'fp-ts/lib/TaskOption';
import * as S from 'fp-ts/lib/Semigroup';
import * as M from 'fp-ts/lib/Monoid';
import { pipe } from 'fp-ts/lib/function';

// -------------------------------------------------------------------------------------
// model
// -------------------------------------------------------------------------------------

/**
 * @category model
 * @since 0.0.1
 */
export type DynamicImport<T = any> = TO.TaskOption<T>;

// -------------------------------------------------------------------------------------
// constructors
// -------------------------------------------------------------------------------------

/**
 * @category constructors
 * @since 0.0.1
 */

export function fromModule<A = any>(name: string): TO.TaskOption<A> {
    return async () => {
        try {
            return O.some(await import(name));
        } catch {
            return O.none;
        }
    }
}

// -------------------------------------------------------------------------------------
// instances
// -------------------------------------------------------------------------------------

/**
 * @internal
 */
const _concat = <A>(first: DynamicImport<A>, second: DynamicImport<A>): TO.TaskOption<A> => pipe(
    first,
    TO.alt(() => second),
);

/**
 * @category instances
 * @since 0.0.1
 */
export const Semigroup: S.Semigroup<DynamicImport> = {
    concat: _concat,
};

/**
 * @category instances
 * @since 0.0.1
 */
export const Monoid: M.Monoid<DynamicImport> = {
    concat: Semigroup.concat,
    empty: TO.none,
};

// -------------------------------------------------------------------------------------
// utils
// -------------------------------------------------------------------------------------

/**
 * @category utils
 * @since 0.0.1
 */
export function firstSome<T = any>(...mas: ReadonlyArray<DynamicImport<T>>): DynamicImport<T> {
    return M.concatAll(Monoid)(mas);
}
