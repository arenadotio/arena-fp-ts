---
title: Wrapper.ts
nav_order: 4
parent: Modules
---

## Wrapper overview

A `Wrapper<F>` is a function that can be used to wrap a function with
stateful operations.

**Example**

```ts
import { log } from 'fp-ts/lib/Console'
import { IO, Apply } from 'fp-ts/lib/IO'
import { wrapT } from 'arena-fp-ts/Wrapper'

const sqr = (x: number) => x * x

// I create a wrapper for the type I want by passing in an Apply instance
const wrapper = wrapT(Apply)

// I want to run `sqr` between to operations contained in `IO<void>` types,
// so I need to lift `sqr` into an `IO<number>`.
const liftSqr: (x: number) => IO<number> = (x) => () => sqr(x)

const wrappedFn = wrapper(log('About to call sqr'), liftSqr(5), log('Finished sqr'))

assert.deepStrictEqual(wrappedFn(), 25) // log messages sent to console
```

Added in v0.0.1

---

<h2 class="text-delta">Table of contents</h2>

- [model](#model)
  - [Wrapper (interface)](#wrapper-interface)
  - [Wrapper1 (interface)](#wrapper1-interface)
  - [Wrapper2 (interface)](#wrapper2-interface)
  - [Wrapper2C (interface)](#wrapper2c-interface)
  - [Wrapper3 (interface)](#wrapper3-interface)
  - [Wrapper3C (interface)](#wrapper3c-interface)
  - [Wrapper4 (interface)](#wrapper4-interface)
- [type lambdas](#type-lambdas)
  - [URI](#uri)
  - [URI (type alias)](#uri-type-alias)
- [utils](#utils)
  - [wrapT](#wrapt)

---

# model

## Wrapper (interface)

**Signature**

```ts
export interface Wrapper<F> {
  <A>(prolog: HKT<F, any>, ma: HKT<F, A>): HKT<F, A>
  <A>(prolog: HKT<F, any>, ma: HKT<F, A>, epolog: HKT<F, any>): HKT<F, A>
}
```

Added in v0.0.1

## Wrapper1 (interface)

**Signature**

```ts
export interface Wrapper1<F extends URIS> {
  <A>(prolog: Kind<F, any>, ma: Kind<F, A>): Kind<F, A>
  <A>(prolog: Kind<F, any>, ma: Kind<F, A>, epolog: Kind<F, any>): Kind<F, A>
}
```

Added in v0.0.1

## Wrapper2 (interface)

**Signature**

```ts
export interface Wrapper2<F extends URIS2> {
  <E, A>(prolog: Kind2<F, E, any>, ma: Kind2<F, E, A>): Kind2<F, E, A>
  <E, A>(prolog: Kind2<F, E, any>, ma: Kind2<F, E, A>, epolog: Kind2<F, E, any>): Kind2<F, E, A>
}
```

Added in v0.0.1

## Wrapper2C (interface)

**Signature**

```ts
export interface Wrapper2C<F extends URIS2, E> {
  <A>(prolog: Kind2<F, E, any>, ma: Kind2<F, E, A>): Kind2<F, E, A>
  <A>(prolog: Kind2<F, E, any>, ma: Kind2<F, E, A>, epolog: Kind2<F, E, any>): Kind2<F, E, A>
}
```

Added in v0.0.1

## Wrapper3 (interface)

**Signature**

```ts
export interface Wrapper3<F extends URIS3> {
  <R, E, A>(prolog: Kind3<F, R, E, any>, ma: Kind3<F, R, E, A>): Kind3<F, R, E, A>
  <R, E, A>(prolog: Kind3<F, R, E, any>, ma: Kind3<F, R, E, A>, epolog: Kind3<F, R, E, any>): Kind3<F, R, E, A>
}
```

Added in v0.0.1

## Wrapper3C (interface)

**Signature**

```ts
export interface Wrapper3C<F extends URIS3, E> {
  <R, A>(prolog: Kind3<F, R, E, any>, ma: Kind3<F, R, E, A>): Kind3<F, R, E, A>
  <R, A>(prolog: Kind3<F, R, E, any>, ma: Kind3<F, R, E, A>, epolog: Kind3<F, R, E, any>): Kind3<F, R, E, A>
}
```

Added in v0.0.1

## Wrapper4 (interface)

**Signature**

```ts
export interface Wrapper4<F extends URIS4> {
  <S, R, E, A>(prolog: Kind4<F, S, R, E, any>, ma: Kind4<F, S, R, E, A>): Kind4<F, S, R, E, A>
  <S, R, E, A>(prolog: Kind4<F, S, R, E, any>, ma: Kind4<F, S, R, E, A>, epolog: Kind4<F, S, R, E, any>): Kind4<
    F,
    S,
    R,
    E,
    A
  >
}
```

Added in v0.0.1

# type lambdas

## URI

**Signature**

```ts
export declare const URI: 'Wrapper'
```

Added in v0.0.1

## URI (type alias)

**Signature**

```ts
export type URI = typeof URI
```

Added in v0.0.1

# utils

## wrapT

**Signature**

```ts
export declare function wrapT<F extends URIS4>(F: Apply4<F>): Wrapper4<F>
export declare function wrapT<F extends URIS3>(F: Apply3<F>): Wrapper3<F>
export declare function wrapT<F extends URIS3, E>(F: Apply3C<F, E>): Wrapper3C<F, E>
export declare function wrapT<F extends URIS2>(F: Apply2<F>): Wrapper2<F>
export declare function wrapT<F extends URIS2, E>(F: Apply2C<F, E>): Wrapper2C<F, E>
export declare function wrapT<F extends URIS>(F: Apply1<F>): Wrapper1<F>
export declare function wrapT<F extends URIS>(F: Apply<F>): Wrapper<F>
```

Added in v0.0.1
