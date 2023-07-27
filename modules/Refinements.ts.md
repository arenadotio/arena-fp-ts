---
title: Refinements.ts
nav_order: 7
parent: Modules
---

## Refinements overview

Added in v0.0.11

---

<h2 class="text-delta">Table of contents</h2>

- [refinements](#refinements)
  - [hasTag](#hastag)
  - [isEither](#iseither)
  - [isOption](#isoption)
  - [isTagged](#istagged)

---

# refinements

## hasTag

**Signature**

```ts
export declare const hasTag: <A extends [string, ...string[]]>(...values: A) => Refinement<unknown, { _tag: A[number] }>
```

Added in v0.0.11

## isEither

**Signature**

```ts
export declare const isEither: <E = unknown, A = unknown>(u: unknown) => u is Either<E, A>
```

Added in v0.0.11

## isOption

**Signature**

```ts
export declare const isOption: <A = unknown>(u: unknown) => u is Option<A>
```

Added in v0.0.11

## isTagged

**Signature**

```ts
export declare const isTagged: Refinement<unknown, { _tag: string }>
```

Added in v0.0.11
