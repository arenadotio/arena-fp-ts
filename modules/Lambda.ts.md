---
title: Lambda.ts
nav_order: 5
parent: Modules
---

## Lambda overview

```
export interface State {
  appName: string;
  logger: L.Logger;
}
```

```
export type Main<A> = SRTE.StateReaderTaskEither<
  State,
  A,
  [Error, State],
  void
>;
```

```
export interface Lambda<A> {
  appName?: string;
  logger?: L.Logger;
  codec: Type<A, any, unknown>;
  main: Main<A>;
}
```

This module is used to transform a `Lambda<A>` into a function that
AWSLambda can call.

The handler contains a main function that is implemented as a
StateReaderTaskEither<State, A, [Error, State], void>. Not that the left type
is also a tuple linking an Error with a new state in the same way that the
right type usually does. This allows the State to be uploaded at some point
during the handler event if it eventually fails.

Before the handler is invoked, the input from AWS will be validated using
io-ts. If any validation errors are signaled, the handler will never be
called and an exception will be sent to Sentry.

**Example**

```ts
import * as TE from 'fp-ts/lib/TaskEither'
import * as t from 'io-ts'

import * as L from 'arena-fp-ts/Lambda'

const myCoolLambda: L.Lambda<string> = {
  codec: t.string,
  main: (state) => (_event) => TE.left([new Error("oof I don't do anything"), state]),
}

export const app = L.toAWSLambda(myCoolLambda)
```

Added in v0.0.1

---

<h2 class="text-delta">Table of contents</h2>

- [conversions](#conversions)
  - [toAWSLambda](#toawslambda)
  - [~~toLambda~~](#tolambda)
- [model](#model)
  - [AWSHandler (type alias)](#awshandler-type-alias)
  - [Lambda (interface)](#lambda-interface)
  - [Main (type alias)](#main-type-alias)
  - [State (interface)](#state-interface)
  - [~~LambdaState~~ (interface)](#lambdastate-interface)
- [utils](#utils)
  - [~~Handler~~ (type alias)](#handler-type-alias)

---

# conversions

## toAWSLambda

**Signature**

```ts
export declare function toAWSLambda<A>(lambda: Lambda<A>): AWSHandler<A>
```

Added in v0.0.6

## ~~toLambda~~

**Signature**

```ts
export declare function toLambda<A>(appName: string, codec: Decoder<unknown, A>, handler: Handler<A>): AWSHandler<A>
```

Added in v0.0.8

# model

## AWSHandler (type alias)

**Signature**

```ts
export type AWSHandler<A> = AWS.Handler<{ detail: A }, void>
```

Added in v0.0.6

## Lambda (interface)

**Signature**

```ts
export interface Lambda<A> {
  appName?: string
  logger?: L.Logger
  sentryDsn?: string
  sentryEnvironment?: string
  sentryRelease?: string
  codec: Type<A, any, unknown>
  main: Main<A>
}
```

Added in v0.0.6

## Main (type alias)

**Signature**

```ts
export type Main<A> = SRTE.StateReaderTaskEither<State, A, [Error, State], void>
```

Added in v0.0.6

## State (interface)

**Signature**

```ts
export interface State {
  appName: string
  logger: L.Logger
}
```

Added in v0.0.6

## ~~LambdaState~~ (interface)

**Signature**

```ts
export interface LambdaState<A> {
  appName: string
  logger: L.Logger
  event: A
}
```

Added in v0.0.1

# utils

## ~~Handler~~ (type alias)

**Signature**

```ts
export type Handler<A> = (state: LambdaState<A>) => T.Task<readonly [E.Either<Error, void>, LambdaState<A>]>
```

Added in v0.0.1
