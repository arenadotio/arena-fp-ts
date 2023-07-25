---
title: Either.ts
nav_order: 3
parent: Modules
---

## Either overview

Added in v0.0.10

---

<h2 class="text-delta">Table of contents</h2>

- [models](#models)
  - [Either (type alias)](#either-type-alias)
- [utils](#utils)
  - [fromValidation](#fromvalidation)
  - [tryCatch](#trycatch)

---

# models

## Either (type alias)

**Signature**

```ts
export type Either<A> = E.Either<Error, A>
```

Added in v0.0.10

# utils

## fromValidation

**Signature**

```ts
export declare const fromValidation: <A>(ma: E.Either<Errors, A>) => E.Either<Error, A>
```

Added in v0.0.10

## tryCatch

**Signature**

```ts
export declare const tryCatch: <A>(f: LazyArg<A>) => E.Either<Error, A>
```

Added in v0.0.10
