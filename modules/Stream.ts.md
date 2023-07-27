---
title: Stream.ts
nav_order: 9
parent: Modules
---

## Stream overview

```ts
type Stream<T> = AsyncIterable<T>
```

Added in v0.0.10

---

<h2 class="text-delta">Table of contents</h2>

- [constructors](#constructors)
  - [from](#from)
  - [fromArrayLike](#fromarraylike)
  - [fromIterable](#fromiterable)
  - [lazy](#lazy)
- [conversions](#conversions)
  - [fromTaskEither](#fromtaskeither)
  - [of](#of)
  - [toArray](#toarray)
  - [toEitherArray](#toeitherarray)
- [filtering](#filtering)
  - [compact](#compact)
  - [filter](#filter)
  - [filterMap](#filtermap)
  - [filterMapWithIndex](#filtermapwithindex)
  - [filterWithIndex](#filterwithindex)
  - [partition](#partition)
  - [partitionMap](#partitionmap)
  - [partitionMapWithIndex](#partitionmapwithindex)
  - [partitionWithIndex](#partitionwithindex)
  - [separate](#separate)
- [instances](#instances)
  - [Applicative](#applicative)
  - [Chain](#chain)
  - [Compactable](#compactable)
  - [Filterable](#filterable)
  - [FilterableWithIndex](#filterablewithindex)
  - [Functor](#functor)
  - [FunctorWithIndex](#functorwithindex)
  - [Monad](#monad)
  - [Pointed](#pointed)
  - [Zero](#zero)
  - [getMonoid](#getmonoid)
  - [getSemigroup](#getsemigroup)
- [mapping](#mapping)
  - [map](#map)
  - [mapWithIndex](#mapwithindex)
- [model](#model)
  - [Stream (type alias)](#stream-type-alias)
  - [Streamable (type alias)](#streamable-type-alias)
- [sequencing](#sequencing)
  - [flatMap](#flatmap)
  - [flatten](#flatten)
- [type lambdas](#type-lambdas)
  - [URI](#uri)
  - [URI (type alias)](#uri-type-alias)
- [utils](#utils)
  - [ap](#ap)
  - [appendAll](#appendall)
  - [isArray](#isarray)
  - [isArrayLike](#isarraylike)
  - [isAsyncIterable](#isasynciterable)
  - [isIterable](#isiterable)
  - [isStream](#isstream)
  - [prependAll](#prependall)
  - [zero](#zero)

---

# constructors

## from

**Signature**

```ts
export declare const from: <A>(a: Streamable<A>) => Stream<A>
```

Added in v0.0.10

## fromArrayLike

**Signature**

```ts
export declare const fromArrayLike: <A>(a: ArrayLike<A>) => Stream<A>
```

Added in v0.0.10

## fromIterable

**Signature**

```ts
export declare const fromIterable: <A>(a: Iterable<A>) => Stream<A>
```

Added in v0.0.10

## lazy

**Signature**

```ts
export declare function lazy<A, B extends Streamable<A>>(
  f: (previousResult: O.Option<B>) => TO.TaskOption<B>
): Stream<A>
export declare function lazy<E, A, B extends Streamable<A>>(
  f: (previousResult: O.Option<B>) => TE.TaskEither<E, O.Option<B>>
): Stream<E.Either<E, A>>
```

Added in v0.0.10

# conversions

## fromTaskEither

**Signature**

```ts
export declare const fromTaskEither: <E, A>(ma: TE.TaskEither<E, Streamable<A>>) => Stream<E.Either<E, A>>
```

Added in v0.0.10

## of

**Signature**

```ts
export declare const of: <A>(a: A) => Stream<A>
```

Added in v0.0.10

## toArray

**Signature**

```ts
export declare const toArray: <A>(fa: Stream<A>) => T.Task<A[]>
```

Added in v0.0.10

## toEitherArray

**Signature**

```ts
export declare const toEitherArray: <E, A>(fa: Stream<E.Either<E, A>>) => TE.TaskEither<E, A[]>
```

Added in v0.0.10

# filtering

## compact

**Signature**

```ts
export declare const compact: <A>(fa: Stream<O.Option<A>>) => Stream<A>
```

Added in v0.0.10

## filter

**Signature**

```ts
export declare const filter: {
  <A, B extends A>(refinement: Refinement<A, B>): (as: Stream<A>) => Stream<B>
  <A>(predicate: Predicate<A>): <B extends A>(bs: Stream<B>) => Stream<B>
  <A>(predicate: Predicate<A>): (as: Stream<A>) => Stream<A>
}
```

Added in v0.0.10

## filterMap

**Signature**

```ts
export declare const filterMap: <A, B>(f: (a: A) => O.Option<B>) => (fa: Stream<A>) => Stream<B>
```

Added in v0.0.10

## filterMapWithIndex

**Signature**

```ts
export declare const filterMapWithIndex: <A, B>(f: (i: number, a: A) => O.Option<B>) => (fa: Stream<A>) => Stream<B>
```

Added in v0.0.10

## filterWithIndex

**Signature**

```ts
export declare const filterWithIndex: {
  <A, B extends A>(refinementWithIndex: RefinementWithIndex<number, A, B>): (as: Stream<A>) => Stream<B>
  <A>(predicateWithIndex: PredicateWithIndex<number, A>): <B extends A>(bs: Stream<B>) => Stream<B>
  <A>(predicateWithIndex: PredicateWithIndex<number, A>): (as: Stream<A>) => Stream<A>
}
```

Added in v0.0.10

## partition

**Signature**

```ts
export declare const partition: {
  <A, B extends A>(refinement: Refinement<A, B>): (as: Stream<A>) => Separated<Stream<A>, Stream<B>>
  <A>(predicate: Predicate<A>): <B extends A>(bs: Stream<B>) => Separated<Stream<B>, Stream<B>>
  <A>(predicate: Predicate<A>): (as: Stream<A>) => Separated<Stream<A>, Stream<A>>
}
```

Added in v0.0.10

## partitionMap

**Signature**

```ts
export declare const partitionMap: <A, B, C>(
  f: (a: A) => E.Either<B, C>
) => (fa: Stream<A>) => Separated<Stream<B>, Stream<C>>
```

Added in v0.0.10

## partitionMapWithIndex

**Signature**

```ts
export declare const partitionMapWithIndex: <A, B, C>(
  f: (i: number, a: A) => E.Either<B, C>
) => (fa: Stream<A>) => Separated<Stream<B>, Stream<C>>
```

Added in v0.0.10

## partitionWithIndex

**Signature**

```ts
export declare const partitionWithIndex: {
  <A, B extends A>(refinementWithIndex: RefinementWithIndex<number, A, B>): (
    as: Stream<A>
  ) => Separated<Stream<A>, Stream<B>>
  <A>(predicateWithIndex: PredicateWithIndex<number, A>): <B extends A>(
    bs: Stream<B>
  ) => Separated<Stream<B>, Stream<B>>
  <A>(predicateWithIndex: PredicateWithIndex<number, A>): (as: Stream<A>) => Separated<Stream<A>, Stream<A>>
}
```

Added in v0.0.10

## separate

**Signature**

```ts
export declare const separate: <A, B>(fa: Stream<E.Either<A, B>>) => Separated<Stream<A>, Stream<B>>
```

Added in v0.0.10

# instances

## Applicative

**Signature**

```ts
export declare const Applicative: Applicative1<'Stream'>
```

Added in v0.0.10

## Chain

**Signature**

```ts
export declare const Chain: Chain1<'Stream'>
```

Added in v0.0.10

## Compactable

**Signature**

```ts
export declare const Compactable: Compactable1<'Stream'>
```

Added in v0.0.10

## Filterable

**Signature**

```ts
export declare const Filterable: Filterable1<'Stream'>
```

Added in v0.0.10

## FilterableWithIndex

**Signature**

```ts
export declare const FilterableWithIndex: FilterableWithIndex1<'Stream', number>
```

Added in v0.0.10

## Functor

**Signature**

```ts
export declare const Functor: Functor1<'Stream'>
```

Added in v0.0.10

## FunctorWithIndex

**Signature**

```ts
export declare const FunctorWithIndex: FunctorWithIndex1<'Stream', number>
```

Added in v0.0.10

## Monad

**Signature**

```ts
export declare const Monad: Monad1<'Stream'>
```

Added in v0.0.10

## Pointed

**Signature**

```ts
export declare const Pointed: Pointed1<'Stream'>
```

Added in v0.0.10

## Zero

**Signature**

```ts
export declare const Zero: Zero1<'Stream'>
```

Added in v0.0.10

## getMonoid

**Signature**

```ts
export declare const getMonoid: <A = never>() => Monoid<Stream<A>>
```

Added in v0.0.10

## getSemigroup

**Signature**

```ts
export declare const getSemigroup: <A = never>() => Semigroup<Stream<A>>
```

Added in v0.0.10

# mapping

## map

**Signature**

```ts
export declare const map: <A, B>(f: (a: A) => B) => (fa: Stream<A>) => Stream<B>
```

Added in v0.0.10

## mapWithIndex

**Signature**

```ts
export declare const mapWithIndex: <A, B>(f: (i: number, a: A) => B) => (fa: Stream<A>) => Stream<B>
```

Added in v0.0.10

# model

## Stream (type alias)

**Signature**

```ts
export type Stream<A> = AsyncIterable<A>
```

Added in v0.0.10

## Streamable (type alias)

**Signature**

```ts
export type Streamable<A> = Array<A> | ArrayLike<A> | Iterable<A> | AsyncIterable<A>
```

Added in v0.0.10

# sequencing

## flatMap

**Signature**

```ts
export declare const flatMap: <A, B>(f: (a: A) => Stream<B>) => (fa: Stream<A>) => Stream<B>
```

Added in v0.0.10

## flatten

**Signature**

```ts
export declare const flatten: <A>(mma: Stream<Stream<A>>) => Stream<A>
```

Added in v0.0.10

# type lambdas

## URI

**Signature**

```ts
export declare const URI: 'Stream'
```

Added in v0.0.10

## URI (type alias)

**Signature**

```ts
export type URI = typeof URI
```

Added in v0.0.10

# utils

## ap

**Signature**

```ts
export declare const ap: <A>(fa: Stream<A>) => <B>(fab: Stream<(a: A) => B | Promise<B>>) => Stream<B>
```

Added in v0.0.10

## appendAll

**Signature**

```ts
export declare const appendAll: <A>(more: Stream<A>) => (ma: Stream<A>) => Stream<A>
```

Added in v0.0.10

## isArray

**Signature**

```ts
export declare const isArray: <A = unknown>(a: unknown) => a is A[]
```

Added in v0.0.10

## isArrayLike

**Signature**

```ts
export declare const isArrayLike: <A = unknown>(a: unknown) => a is ArrayLike<A>
```

Added in v0.0.10

## isAsyncIterable

**Signature**

```ts
export declare const isAsyncIterable: <A = unknown>(a: unknown) => a is Iterable<A>
```

Added in v0.0.10

## isIterable

**Signature**

```ts
export declare const isIterable: <A = unknown>(a: unknown) => a is Iterable<A>
```

Added in v0.0.10

## isStream

**Signature**

```ts
export declare const isStream: <A = unknown>(a: unknown) => a is Stream<A>
```

Added in v0.0.10

## prependAll

**Signature**

```ts
export declare const prependAll: <A>(more: Stream<A>) => (ma: Stream<A>) => Stream<A>
```

Added in v0.0.10

## zero

**Signature**

```ts
export declare const zero: <A>() => Stream<A>
```

Added in v0.0.10
