---
title: DynamicImport.ts
nav_order: 2
parent: Modules
---

## DynamicImport overview

Added in v0.0.1

---

<h2 class="text-delta">Table of contents</h2>

- [constructors](#constructors)
  - [fromModule](#frommodule)
- [instances](#instances)
  - [Monoid](#monoid)
  - [Semigroup](#semigroup)
- [model](#model)
  - [DynamicImport (type alias)](#dynamicimport-type-alias)
- [utils](#utils)
  - [firstSome](#firstsome)

---

# constructors

## fromModule

**Signature**

```ts
export declare function fromModule<A = any>(name: string): TO.TaskOption<A>
```

Added in v0.0.1

# instances

## Monoid

**Signature**

```ts
export declare const Monoid: M.Monoid<DynamicImport<any>>
```

Added in v0.0.1

## Semigroup

**Signature**

```ts
export declare const Semigroup: S.Semigroup<DynamicImport<any>>
```

Added in v0.0.1

# model

## DynamicImport (type alias)

**Signature**

```ts
export type DynamicImport<T = any> = TO.TaskOption<T>
```

Added in v0.0.1

# utils

## firstSome

**Signature**

```ts
export declare function firstSome<T = any>(...mas: ReadonlyArray<DynamicImport<T>>): DynamicImport<T>
```

Added in v0.0.1
