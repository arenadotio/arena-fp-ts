---
title: TaskEither.ts
nav_order: 10
parent: Modules
---

## TaskEither overview

Added in v0.0.7

---

<h2 class="text-delta">Table of contents</h2>

- [mapping](#mapping)
  - [flatMapValidation](#flatmapvalidation)
- [models](#models)
  - [TaskEither (type alias)](#taskeither-type-alias)
- [utils](#utils)
  - [tryCatch](#trycatch)

---

# mapping

## flatMapValidation

**Signature**

```ts
export declare const flatMapValidation: <A, B>(
  f: (a: A) => E.Either<Errors, B>
) => (self: TaskEither<A>) => TaskEither<B>
```

Added in v0.0.7

# models

## TaskEither (type alias)

**Signature**

```ts
export type TaskEither<A> = TE.TaskEither<Error, A>
```

Added in v0.0.7

# utils

## tryCatch

**Signature**

```ts
export declare const tryCatch: <A>(f: LazyArg<Promise<A>>) => TaskEither<A>
```

Added in v0.0.7
