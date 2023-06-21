---
title: WrapperWithContext.ts
nav_order: 4
parent: Modules
---

## WrapperWithContext overview

A `Wrapper<F>` is a function that can be used to wrap a function with
stateful operations.

**Example**

```ts
import { log } from 'fp-ts/lib/Console'
import { IO, Chain } from 'fp-ts/lib/IO'
import { wrapWithContextT } from '@arenadotio/arena-fp-ts/WrapperWithContext'

const sqr = (x: number) => x * x

// I create a wrapper for the type I want by passing in an Chain instance
const wrapper = wrapWithContextT(Chain)

// I want to run `sqr` between to operations contained in `IO<void>` types,
// so I need to lift `sqr` into an `IO<number>`.
const liftSqr: (x: number) => IO<number> = (x) => () => sqr(x)

const wrappedWithContextFn = wrapper(
  (x) => log(`Going to find the sqr of ${x}`),
  liftSqr,
  (x, y) => log(`sqr of ${x} is ${y}`)
)

const fn = wrappedWithContextFn(5)

assert.deepStrictEqual(fn(), 25) // log messages sent to console
```

Added in v0.0.1

---

<h2 class="text-delta">Table of contents</h2>

- [model](#model)
  - [WrapperWithContext (interface)](#wrapperwithcontext-interface)
  - [WrapperWithContext1 (interface)](#wrapperwithcontext1-interface)
  - [WrapperWithContext2 (interface)](#wrapperwithcontext2-interface)
  - [WrapperWithContext2C (interface)](#wrapperwithcontext2c-interface)
  - [WrapperWithContext3 (interface)](#wrapperwithcontext3-interface)
  - [WrapperWithContext3C (interface)](#wrapperwithcontext3c-interface)
  - [WrapperWithContext4 (interface)](#wrapperwithcontext4-interface)
- [type lambdas](#type-lambdas)
  - [URI](#uri)
  - [URI (type alias)](#uri-type-alias)
- [utils](#utils)
  - [wrapWithContextT](#wrapwithcontextt)

---

# model

## WrapperWithContext (interface)

**Signature**

```ts
export interface WrapperWithContext<F> {
  <A, B>(prolog: (a: A) => HKT<F, any>, ma: (a: A) => HKT<F, B>): (a: A) => HKT<F, B>
  <A, B>(prolog: (a: A) => HKT<F, any>, ma: (a: A) => HKT<F, B>, epolog: (a: A, b: B) => HKT<F, any>): (
    a: A
  ) => HKT<F, B>
}
```

Added in v0.0.1

## WrapperWithContext1 (interface)

**Signature**

```ts
export interface WrapperWithContext1<F extends URIS> {
  <A, B>(prolog: (a: A) => Kind<F, any>, ma: (a: A) => Kind<F, B>): (a: A) => Kind<F, B>
  <A, B>(prolog: (a: A) => Kind<F, any>, ma: (a: A) => Kind<F, B>, epolog: (a: A, b: B) => Kind<F, any>): (
    a: A
  ) => Kind<F, B>
}
```

Added in v0.0.1

## WrapperWithContext2 (interface)

**Signature**

```ts
export interface WrapperWithContext2<F extends URIS2> {
  <E, A, B>(prolog: (a: A) => Kind2<F, E, any>, ma: (a: A) => Kind2<F, E, B>): (a: A) => Kind2<F, E, B>
  <E, A, B>(
    prolog: (a: A) => Kind2<F, E, any>,
    ma: (a: A) => Kind2<F, E, B>,
    epolog: (a: A, b: B) => Kind2<F, E, any>
  ): (a: A) => Kind2<F, E, B>
}
```

Added in v0.0.1

## WrapperWithContext2C (interface)

**Signature**

```ts
export interface WrapperWithContext2C<F extends URIS2, E> {
  <A, B>(prolog: (a: A) => Kind2<F, E, any>, ma: (a: A) => Kind2<F, E, B>): (a: A) => Kind2<F, E, B>
  <A, B>(prolog: (a: A) => Kind2<F, E, any>, ma: (a: A) => Kind2<F, E, B>, epolog: (a: A, b: B) => Kind2<F, E, any>): (
    a: A
  ) => Kind2<F, E, B>
}
```

Added in v0.0.1

## WrapperWithContext3 (interface)

**Signature**

```ts
export interface WrapperWithContext3<F extends URIS3> {
  <R, E, A, B>(prolog: (a: A) => Kind3<F, R, E, any>, ma: (a: A) => Kind3<F, R, E, B>): (a: A) => Kind3<F, R, E, B>
  <R, E, A, B>(
    prolog: (a: A) => Kind3<F, R, E, any>,
    ma: (a: A) => Kind3<F, R, E, B>,
    epolog: (a: A, b: B) => Kind3<F, R, E, any>
  ): (a: A) => Kind3<F, R, E, B>
}
```

Added in v0.0.1

## WrapperWithContext3C (interface)

**Signature**

```ts
export interface WrapperWithContext3C<F extends URIS3, E> {
  <R, A, B>(prolog: (a: A) => Kind3<F, R, E, any>, ma: (a: A) => Kind3<F, R, E, B>): (a: A) => Kind3<F, R, E, B>
  <R, A, B>(
    prolog: (a: A) => Kind3<F, R, E, any>,
    ma: (a: A) => Kind3<F, R, E, B>,
    epolog: (a: A, b: B) => Kind3<F, R, E, any>
  ): (a: A) => Kind3<F, R, E, B>
}
```

Added in v0.0.1

## WrapperWithContext4 (interface)

**Signature**

```ts
export interface WrapperWithContext4<F extends URIS4> {
  <S, R, E, A, B>(prolog: (a: A) => Kind4<F, S, R, E, any>, ma: (a: A) => Kind4<F, S, R, E, B>): (
    a: A
  ) => Kind4<F, S, R, E, B>
  <S, R, E, A, B>(
    prolog: (a: A) => Kind4<F, S, R, E, any>,
    ma: (a: A) => Kind4<F, S, R, E, B>,
    epolog: (a: A, b: B) => Kind4<F, S, R, E, any>
  ): (a: A) => Kind4<F, S, R, E, B>
}
```

Added in v0.0.1

# type lambdas

## URI

**Signature**

```ts
export declare const URI: 'WrapperWithContext'
```

Added in v0.0.1

## URI (type alias)

**Signature**

```ts
export type URI = typeof URI
```

Added in v0.0.1

# utils

## wrapWithContextT

**Signature**

```ts
export declare function wrapWithContextT<F extends URIS4>(F: Chain4<F>): WrapperWithContext4<F>
export declare function wrapWithContextT<F extends URIS3>(F: Chain3<F>): WrapperWithContext3<F>
export declare function wrapWithContextT<F extends URIS3, E>(F: Chain3C<F, E>): WrapperWithContext3C<F, E>
export declare function wrapWithContextT<F extends URIS2>(F: Chain2<F>): WrapperWithContext2<F>
export declare function wrapWithContextT<F extends URIS2, E>(F: Chain2C<F, E>): WrapperWithContext2C<F, E>
export declare function wrapWithContextT<F extends URIS>(F: Chain1<F>): WrapperWithContext1<F>
export declare function wrapWithContextT<F extends URIS>(F: Chain<F>): WrapperWithContext<F>
```

Added in v0.0.1
