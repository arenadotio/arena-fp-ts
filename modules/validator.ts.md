---
title: validator.ts
nav_order: 3
parent: Modules
---

## validator overview

```ts
export interface Validator<A, B> {
  (f: (a: A) => B): (a: A) => Validation<B>
}
```

`Validator<A, B>` is a type that can take a function A => B and provide
runtime validation to it.

**Example**

```ts
import * as t from 'io-ts'
import { isLeft, isRight } from 'fp-ts/lib/Either'
import { pipe } from 'fp-ts/lib/function'
import { fromCodec } from 'arena-fp-ts/validator'

const UserCodec = t.type({
  name: t.string,
  password: t.string,
})

type User = t.TypeOf<typeof UserCodec>

const ValidUser = { name: 'foo', password: 'bar' }
const InvalidUser = { name: 'foo' }

const f = (user: User) => user.password // User => string
const f2 = pipe(f, fromCodec(UserCodec)) // unknown => t.Validation<string>

assert.deepStrictEqual(isRight(f2(ValidUser as any)), true)
assert.deepStrictEqual(isLeft(f2(InvalidUser as any)), true)
```

Added in v0.0.1

---

<h2 class="text-delta">Table of contents</h2>

- [constructors](#constructors)
  - [fromCodec](#fromcodec)
- [model](#model)
  - [Validator (interface)](#validator-interface)

---

# constructors

## fromCodec

**Signature**

```ts
export declare function fromCodec<A, B>(codec: Decoder<unknown, A>): Validator<A, B>
```

Added in v0.0.1

# model

## Validator (interface)

**Signature**

```ts
export interface Validator<A, B> {
  (f: (a: A) => B): (a: A) => Validation<B>
}
```

Added in v0.0.1
