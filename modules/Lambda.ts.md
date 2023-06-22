---
title: Lambda.ts
nav_order: 4
parent: Modules
---

## Lambda overview

```
export interface LambdaState<A> {
  appName: string;
  logger: L.Logger;
  event: A;
}
```

```
export type Handler<A> = (
  state: LambdaState<A>
) => T.Task<[E.Either<Error, void>, LambdaState<A>]>;
```

This module is used to transform a `Handler<A>` into a function that
AWSLambda can call.

The handler must return a tuple containing its result and a (possibly
changed) state object. If the result is an Either.right, its value is ignored
and the handle is believed to have succeeded. If the result is an
Either.left, then its value will be captured in Sentry.

Before the handler is invoke, the input from AWS will be validated using
io-ts. If any validation errors are signaled, the handler will never be
called and an exception will be sent to Sentry.

**Example**

```ts
import * as E from 'fp-ts/lib/Either'
import * as T from 'fp-ts/lib/Task'
import * as t from 'io-ts'

import * as L from '@arenadotio/arena-fp-ts/Lambda'

const myCoolHandler: L.Handler<string> = (state: L.LambdaState<string>) =>
  T.of([E.left(new Error("I don't do anything")), state])

export const app = L.toLambda('my-cool-handler', t.string, myCoolHandler)
```

Added in v0.0.1

---

<h2 class="text-delta">Table of contents</h2>

- [conversions](#conversions)
  - [toLambda](#tolambda)
- [model](#model)
  - [Handler (type alias)](#handler-type-alias)
  - [LambdaState (interface)](#lambdastate-interface)

---

# conversions

## toLambda

**Signature**

```ts
export declare function toLambda<A>(
  appName: string,
  codec: Decoder<unknown, A>,
  handler: (state: LambdaState<A>) => T.Task<[E.Either<Error, void>, LambdaState<A>]>
): AWSHandler<A, void>
```

Added in v0.0.1

# model

## Handler (type alias)

**Signature**

```ts
export type Handler<A> = (state: LambdaState<A>) => T.Task<[E.Either<Error, void>, LambdaState<A>]>
```

Added in v0.0.1

## LambdaState (interface)

**Signature**

```ts
export interface LambdaState<A> {
  appName: string
  logger: L.Logger
  event: A
}
```

Added in v0.0.1
