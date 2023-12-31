/**
 * ```ts
 * type Stream<T> = AsyncIterable<T>;
 * ```
 *
 * This module provides a monadic interface over AsyncIterables. Unlike other
 * collections, the elements of a Stream are not all stored in memory at the
 * same time.
 *
 * @since 0.0.10
 */

import { Applicative1 } from 'fp-ts/lib/Applicative';
import { Chain1 } from 'fp-ts/lib/Chain';
import { Functor1 } from 'fp-ts/lib/Functor';
import { Monad1 } from 'fp-ts/lib/Monad';
import { Pointed1 } from 'fp-ts/lib/Pointed';
import { Predicate } from 'fp-ts/lib/Predicate';
import { Refinement } from 'fp-ts/lib/Refinement';
import * as T from 'fp-ts/lib/Task';
import * as TE from 'fp-ts/lib/TaskEither';
import * as O from 'fp-ts/lib/Option';
import * as TO from 'fp-ts/lib/TaskOption';
import * as E from 'fp-ts/lib/Either';
import * as A from 'fp-ts/lib/Array';
import {
  FilterableWithIndex1,
  PredicateWithIndex,
  RefinementWithIndex,
} from 'fp-ts/lib/FilterableWithIndex';
import { Separated } from 'fp-ts/lib/Separated';
import { Filterable1 } from 'fp-ts/lib/Filterable';
import { identity, pipe } from 'fp-ts/lib/function';
import { Compactable1 } from 'fp-ts/lib/Compactable';
import { Apply1 } from 'fp-ts/lib/Apply';
import { FunctorWithIndex1 } from 'fp-ts/lib/FunctorWithIndex';
import { Zero1 } from 'fp-ts/lib/Zero';
import { Semigroup } from 'fp-ts/lib/Semigroup';
import { Monoid } from 'fp-ts/lib/Monoid';
import { isEither } from './Refinements';

import { Mutex } from 'async-mutex';

/**
 * @category type lambdas
 * @since 0.0.10
 */
export const URI = 'Stream';

/**
 * @category type lambdas
 * @since 0.0.10
 */
export type URI = typeof URI;

declare module 'fp-ts/lib/HKT' {
  interface URItoKind<A> {
    readonly [URI]: Stream<A>;
  }
}

// -------------------------------------------------------------------------------------
// model
// -------------------------------------------------------------------------------------

/**
 * @category model
 * @since 0.0.10
 */
export type Stream<A> = AsyncIterable<A>;

/**
 * @category model
 * @since 0.0.10
 */
export type Streamable<A> =
  | Array<A>
  | ArrayLike<A>
  | Iterable<A>
  | AsyncIterable<A>;

// -------------------------------------------------------------------------------------
// Refinements
// -------------------------------------------------------------------------------------

/**
 * @since 0.0.10
 */
export const isArray = <A = unknown>(a: unknown): a is Array<A> =>
  Array.isArray(a);

/**
 * @since 0.0.10
 */
export const isArrayLike = <A = unknown>(a: unknown): a is ArrayLike<A> =>
  !!a && typeof a === 'object' && 'length' in a;

/**
 * @since 0.0.10
 */
export const isIterable = <A = unknown>(a: unknown): a is Iterable<A> =>
  !!a && typeof a === 'object' && Symbol.iterator in a;

/**
 * @since 0.0.10
 */
export const isAsyncIterable = <A = unknown>(a: unknown): a is Iterable<A> =>
  !!a && typeof a === 'object' && Symbol.asyncIterator in a;

/**
 * @since 0.0.10
 */
export const isStream = <A = unknown>(a: unknown): a is Stream<A> =>
  isAsyncIterable(a);

// -------------------------------------------------------------------------------------
// constructors
// -------------------------------------------------------------------------------------

/**
 * @category constructors
 * @since 0.0.10
 */
export const fromIterable = <A>(a: Iterable<A>): Stream<A> => /*#__PURE__*/ ({
  async *[Symbol.asyncIterator]() {
    yield* a;
  },
});

/**
 * @category constructors
 * @since 0.0.10
 */
export const fromArrayLike = <A>(a: ArrayLike<A>): Stream<A> => /*#__PURE__*/ ({
  async *[Symbol.asyncIterator]() {
    for (let i = 0; i < a.length; i++) {
      yield a[i];
    }
  },
});

/**
 * @category constructors
 * @since 0.0.10
 */
export const from = <A>(a: Streamable<A>): Stream<A> => /*#__PURE__*/ {
  if (isArray(a)) return fromIterable(a);
  if (isIterable(a)) return fromIterable(a);
  if (isArrayLike(a)) return fromArrayLike(a);
  return a; // Already an AsyncIterable
};

/**
 * @category constructors
 * @since 0.0.10
 */
export function lazy<A, B extends Streamable<A>>(
  f: (previousResult: O.Option<B>) => TO.TaskOption<B>
): Stream<A>;
export function lazy<E, A, B extends Streamable<A>>(
  f: (previousResult: O.Option<B>) => TE.TaskEither<E, O.Option<B>>
): Stream<E.Either<E, A>>;
export function lazy<E, A, B extends Streamable<A>>(
  f: (
    previousResult: O.Option<B>
  ) => TO.TaskOption<B> | TE.TaskEither<E, O.Option<B>>
): Stream<E.Either<E, A> | A> /*#__PURE__*/ {
  return {
    async *[Symbol.asyncIterator]() {
      let previousResult: O.Option<B> = O.none;
      do {
        // Use previousResult to fetch the next streamable
        const fetchNext = f(previousResult);
        const result = await fetchNext();

        // check for error
        if (isEither(result) && E.isLeft(result)) {
          // communicate error by yielding the left
          yield result;
          // Nothing more to stream
          return;
        }

        // Set previousResult
        if (isEither(result)) {
          previousResult = result.right;
        } else {
          previousResult = result;
        }

        if (O.isSome(previousResult)) {
          // If result is Either, then map values in the result to Rights.
          // Otherwise, yield the results directly
          const mapValues: (a: A) => E.Either<E, A> | A = isEither(result)
            ? E.right<E, A>
            : identity;

          // Use mapValues to create a new stream of values
          const stream = pipe(from(previousResult.value), map(mapValues));

          // yield values
          yield* stream;
        }
      } while (O.isSome(previousResult));
    },
  };
}

// -------------------------------------------------------------------------------------
// conversions
// -------------------------------------------------------------------------------------

/**
 * @category conversions
 * @since 0.0.10
 */
export const of = <A>(a: A): Stream<A> => /*#__PURE__*/ ({
  async *[Symbol.asyncIterator]() {
    yield a;
  },
});

/**
 * @category conversions
 * @since 0.0.10
 */
export const fromTaskEither = <E, A>(
  ma: TE.TaskEither<E, Streamable<A>>
): Stream<E.Either<E, A>> => /*#__PURE__*/ ({
  async *[Symbol.asyncIterator]() {
    const either = await ma();
    if (E.isLeft(either)) {
      yield either;
    } else {
      yield* pipe(either.right, from, map<A, E.Either<E, A>>(E.right));
    }
  },
});

/**
 * @category conversions
 * @since 0.0.10
 */
export const toArray =
  <A>(fa: Stream<A>): T.Task<Array<A>> =>
  async () => /*#__PURE__*/ {
    const arr: A[] = [];
    for await (const a of fa) {
      arr.push(a);
    }
    return arr;
  };

/**
 * @category conversions
 * @since 0.0.10
 */
export const toEitherArray = <E, A>(
  fa: Stream<E.Either<E, A>>
): TE.TaskEither<E, A[]> =>
  /*#__PURE__*/ pipe(toArray(fa), T.map(A.sequence(E.Applicative)));

// -------------------------------------------------------------------------------------
// mapping
// -------------------------------------------------------------------------------------

/**
 * @category mapping
 * @since 0.0.10
 */
export const mapWithIndex: <A, B>(
  f: (i: number, a: A) => B
) => (fa: Stream<A>) => Stream<B> = (f) => (fa) => /*#__PURE__*/ ({
  async *[Symbol.asyncIterator]() {
    let i = 0;
    for await (const a of fa) {
      yield await f(i, a);
      i++;
    }
  },
});

/**
 * @category mapping
 * @since 0.0.10
 */
export const map: <A, B>(f: (a: A) => B) => (fa: Stream<A>) => Stream<B> =
  /*#__PURE__*/
  (f) => (fa) =>
    pipe(
      fa,
      mapWithIndex((_, a) => f(a))
    );

/**
 * @category sequencing
 * @since 0.0.10
 */
export const flatMap = <A, B>(f: (a: A) => Stream<B>) => /*#__PURE__*/ {
  return (fa: Stream<A>): Stream<B> => ({
    async *[Symbol.asyncIterator]() {
      for await (const a of fa) {
        yield* f(a);
      }
    },
  });
};

/**
 * @category sequencing
 * @since 0.0.10
 */
export const flatten = <A>(
  mma: Stream<Stream<A>>
): Stream<A> => /*#__PURE__*/ ({
  async *[Symbol.asyncIterator]() {
    for await (const ma of mma) {
      yield* ma;
    }
  },
});

// -------------------------------------------------------------------------------------
// filtering
// -------------------------------------------------------------------------------------

/**
 * @category filtering
 * @since 0.0.10
 */
export const filterWithIndex: {
  <A, B extends A>(refinementWithIndex: RefinementWithIndex<number, A, B>): (
    as: Stream<A>
  ) => Stream<B>;
  <A>(predicateWithIndex: PredicateWithIndex<number, A>): <B extends A>(
    bs: Stream<B>
  ) => Stream<B>;
  <A>(predicateWithIndex: PredicateWithIndex<number, A>): (
    as: Stream<A>
  ) => Stream<A>;
} =
  /*#__PURE__*/


    <A>(predicate: PredicateWithIndex<number, A>) =>
    (fa: Stream<A>) => ({
      async *[Symbol.asyncIterator]() {
        let i = 0;
        for await (const a of fa) {
          if (predicate(i, a)) {
            yield a;
          }
          i++;
        }
      },
    });

/**
 * @category filtering
 * @since 0.0.10
 */
export const filter: {
  <A, B extends A>(refinement: Refinement<A, B>): (as: Stream<A>) => Stream<B>;
  <A>(predicate: Predicate<A>): <B extends A>(bs: Stream<B>) => Stream<B>;
  <A>(predicate: Predicate<A>): (as: Stream<A>) => Stream<A>;
} = <A>(f: Predicate<A>) => filterWithIndex<A>((_, a) => f(a));

/**
 * @category filtering
 * @since 0.0.10
 */
export const filterMapWithIndex =
  <A, B>(f: (i: number, a: A) => O.Option<B>) =>
  (fa: Stream<A>): Stream<B> => ({
    async *[Symbol.asyncIterator]() {
      let i = 0;
      for await (const a of fa) {
        const optionB = f(i, a);
        if (O.isSome(optionB)) {
          yield optionB.value;
        }
        i++;
      }
    },
  });

/**
 * @category filtering
 * @since 0.0.10
 */
export const filterMap: <A, B>(
  f: (a: A) => O.Option<B>
) => /*#__PURE__*/ (fa: Stream<A>) => Stream<B> = (f) =>
  filterMapWithIndex((_, a) => f(a));

/**
 * @category filtering
 * @since 0.0.10
 */
export const partitionWithIndex: {
  <A, B extends A>(refinementWithIndex: RefinementWithIndex<number, A, B>): (
    as: Stream<A>
  ) => Separated<Stream<A>, Stream<B>>;
  <A>(predicateWithIndex: PredicateWithIndex<number, A>): <B extends A>(
    bs: Stream<B>
  ) => Separated<Stream<B>, Stream<B>>;
  <A>(predicateWithIndex: PredicateWithIndex<number, A>): (
    as: Stream<A>
  ) => Separated<Stream<A>, Stream<A>>;
} =
  /*#__PURE__*/


    <A>(f: PredicateWithIndex<number, A>) =>
    (fa: Stream<A>) =>
      pipe(
        fa,
        mapWithIndex((i, a) => (f(i, a) ? E.right(a) : E.left(a))),
        separate
      );

/**
 * @category filtering
 * @since 0.0.10
 */
export const partition: {
  <A, B extends A>(refinement: Refinement<A, B>): (
    as: Stream<A>
  ) => Separated<Stream<A>, Stream<B>>;
  <A>(predicate: Predicate<A>): <B extends A>(
    bs: Stream<B>
  ) => Separated<Stream<B>, Stream<B>>;
  <A>(predicate: Predicate<A>): (
    as: Stream<A>
  ) => Separated<Stream<A>, Stream<A>>;
} = <A>(
  predicate: Predicate<A>
): ((as: Stream<A>) => Separated<Stream<A>, Stream<A>>) =>
  /*#__PURE__*/ partitionWithIndex((_, a) => predicate(a));

/**
 * @category filtering
 * @since 0.0.10
 */
export const partitionMapWithIndex =
  <A, B, C>(f: (i: number, a: A) => E.Either<B, C>) =>
  (fa: Stream<A>): Separated<Stream<B>, Stream<C>> =>
    /*#__PURE__*/ pipe(fa, mapWithIndex(f), separate);

/**
 * @category filtering
 * @since 0.0.10
 */
export const partitionMap: <A, B, C>(
  f: (a: A) => E.Either<B, C>
) => (fa: Stream<A>) => Separated<Stream<B>, Stream<C>> = (f) =>
  /*#__PURE__*/ partitionMapWithIndex((_, a) => f(a));

/**
 * @category filtering
 * @since 0.0.10
 */
export const compact: <A>(fa: Stream<O.Option<A>>) => Stream<A> =
  /*#__PURE__*/ filterMap(identity);

/**
 * @category filtering
 * @since 0.0.10
 */
export const separate = <A, B>(
  fa: Stream<E.Either<A, B>>
): Separated<Stream<A>, Stream<B>> => /*#__PURE__*/ {
  const cache: E.Either<A, B>[] = [];
  const it = fa[Symbol.asyncIterator]();
  const lock = new Mutex();

  const findNext = <C extends E.Either<A, B>>(
    refinement: Refinement<E.Either<A, B>, C>
  ): Promise<O.Option<C>> =>
    lock.runExclusive(async (): Promise<O.Option<C>> => {
      for (let idx = 0; idx < cache.length; idx++) {
        // avoiding cache.findIndx to make it easier for tsc to recognize the
        // refinement.
        const cur = cache[idx];
        if (refinement(cur)) {
          cache.splice(idx, 1);
          return O.some(cur);
        }
      }

      let cur: IteratorResult<E.Either<A, B>> = await it.next();
      while (!cur.done) {
        if (refinement(cur.value)) {
          return O.some(cur.value);
        }

        cache.push(cur.value);
        cur = await it.next();
      }

      return O.none;
    });

  const returnFn = async <C>(value?: C) => {
    cache.splice(0, cache.length);
    return { done: true, value };
  };

  const buildIterator = <C extends E.Either<A, B>, D>(
    refinement: Refinement<E.Either<A, B>, C>,
    getter: (c: C) => D
  ): AsyncIterator<D> => ({
    next: async (..._args) => {
      const a = await findNext(refinement);
      if (O.isSome(a)) {
        return {
          done: false,
          value: getter(a.value),
        };
      } else {
        return {
          done: true,
          value: undefined,
        };
      }
    },
    return: returnFn,
    throw: returnFn,
  });

  return {
    left: {
      [Symbol.asyncIterator]: () => buildIterator(E.isLeft, (e) => e.left),
    },
    right: {
      [Symbol.asyncIterator]: () => buildIterator(E.isRight, (e) => e.right),
    },
  };
};

// -------------------------------------------------------------------------------------
// utils
// -------------------------------------------------------------------------------------

/**
 * @category utils
 * @since 0.0.10
 */
export const ap = <A>(fa: Stream<A>) => /*#__PURE__*/ {
  return <B>(fab: Stream<(a: A) => B | Promise<B>>): Stream<B> => ({
    async *[Symbol.asyncIterator]() {
      for await (const a of fa) {
        for await (const f of fab) {
          yield await f(a);
        }
      }
    },
  });
};

/**
 * @category utils
 * @since 0.0.10
 */
export const zero: <A>() => Stream<A> = <A>() =>
  /*#__PURE__*/ fromIterable<A>([]);

/**
 * @category utils
 * @since 0.0.10
 */
export const prependAll =
  /*#__PURE__*/


    <A>(more: Stream<A>) =>
    (ma: Stream<A>): Stream<A> =>
      getSemigroup<A>().concat(more, ma);

/**
 * @category utils
 * @since 0.0.10
 */
export const appendAll =
  /*#__PURE__*/


    <A>(more: Stream<A>) =>
    (ma: Stream<A>): Stream<A> =>
      getSemigroup<A>().concat(ma, more);

// -------------------------------------------------------------------------------------
// instances
// ------------------------------------------------------------------------------------

const _map: Monad1<URI>['map'] = (fa, f) => pipe(fa, map(f));
const _mapWithIndex: FunctorWithIndex1<URI, number>['mapWithIndex'] = (fa, f) =>
  pipe(fa, mapWithIndex(f));
const _chain: Chain1<URI>['chain'] = (fa, f) => pipe(fa, flatMap(f));
const _ap: Apply1<URI>['ap'] = (fab, fa) => pipe(fab, ap(fa));
const _filter: Filterable1<URI>['filter'] = <A>(
  fa: Stream<A>,
  predicate: Predicate<A>
) => pipe(fa, filter(predicate));
const _filterWithIndex: FilterableWithIndex1<URI, number>['filterWithIndex'] = <
  A
>(
  fa: Stream<A>,
  f: PredicateWithIndex<number, A>
) => pipe(fa, filterWithIndex(f));
const _filterMap: Filterable1<URI>['filterMap'] = (fa, f) =>
  pipe(fa, filterMap(f));
const _filterMapWithIndex: FilterableWithIndex1<
  URI,
  number
>['filterMapWithIndex'] = <A, B>(
  fa: Stream<A>,
  f: (i: number, a: A) => O.Option<B>
) => pipe(fa, filterMapWithIndex(f));
const _partition: Filterable1<URI>['partition'] = <A>(
  fa: Stream<A>,
  predicate: Predicate<A>
) => pipe(fa, partition(predicate));
const _partitionMap: Filterable1<URI>['partitionMap'] = (fa, f) =>
  pipe(fa, partitionMap(f));
const _partitionWithIndex: FilterableWithIndex1<
  URI,
  number
>['partitionWithIndex'] = <A>(
  fa: Stream<A>,
  predicateWithIndex: (i: number, a: A) => boolean
) => pipe(fa, partitionWithIndex(predicateWithIndex));
const _partitionMapWithIndex: FilterableWithIndex1<
  URI,
  number
>['partitionMapWithIndex'] = <A, B, C>(
  fa: Stream<A>,
  f: (i: number, a: A) => E.Either<B, C>
) => pipe(fa, partitionMapWithIndex(f));

/**
 * @category instances
 * @since 0.0.10
 */
export const getSemigroup = <A = never>(): Semigroup<Stream<A>> => ({
  concat: <A>(first: Stream<A>, second: Stream<A>): Stream<A> =>
    pipe(fromIterable([first, second]), (x) => x, flatten),
});

/**
 * @category instances
 * @since 0.0.10
 */
export const getMonoid = <A = never>(): Monoid<Stream<A>> => ({
  concat: getSemigroup<A>().concat,
  empty: zero(),
});

/**
 * @category instances
 * @since 0.0.10
 */
export const Monad: Monad1<URI> = {
  URI,
  map: _map,
  ap: _ap,
  of,
  chain: _chain,
};

/**
 * @category instances
 * @since 0.0.10
 */
export const Compactable: Compactable1<URI> = {
  URI,
  compact,
  separate,
};

/**
 * @category instances
 * @since 0.0.10
 */
export const Pointed: Pointed1<URI> = {
  URI,
  of,
};

/**
 * @category instances
 * @since 0.0.10
 */
export const Functor: Functor1<URI> = {
  URI,
  map: _map,
};

/**
 * @category instances
 * @since 0.0.10
 */
export const FunctorWithIndex: FunctorWithIndex1<URI, number> = {
  URI,
  map: _map,
  mapWithIndex: _mapWithIndex,
};

/**
 * @category instances
 * @since 0.0.10
 */
export const Applicative: Applicative1<URI> = {
  URI,
  map: _map,
  ap: _ap,
  of,
};

/**
 * @category instances
 * @since 0.0.10
 */
export const Chain: Chain1<URI> = {
  URI,
  map: _map,
  ap: _ap,
  chain: _chain,
};

/**
 * @category instances
 * @since 0.0.10
 */
export const Filterable: Filterable1<URI> = {
  URI,
  map: _map,
  compact,
  separate,
  filter: _filter,
  filterMap: _filterMap,
  partition: _partition,
  partitionMap: _partitionMap,
};

/**
 * @category instances
 * @since 0.0.10
 */
export const FilterableWithIndex: FilterableWithIndex1<URI, number> = {
  URI,
  map: _map,
  mapWithIndex: _mapWithIndex,
  compact,
  separate,
  filter: _filter,
  filterMap: _filterMap,
  partition: _partition,
  partitionMap: _partitionMap,
  partitionMapWithIndex: _partitionMapWithIndex,
  partitionWithIndex: _partitionWithIndex,
  filterMapWithIndex: _filterMapWithIndex,
  filterWithIndex: _filterWithIndex,
};

/**
 * @category instances
 * @since 0.0.10
 */
export const Zero: Zero1<URI> = {
  URI,
  zero,
};
