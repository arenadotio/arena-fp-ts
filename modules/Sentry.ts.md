---
title: Sentry.ts
nav_order: 5
parent: Modules
---

## Sentry overview

Functions to capture exception in sentry:

**Example**

```ts
import * as E from 'fp-ts/lib/Either'
import * as IO from 'fp-ts/lib/IO'
import { pipe } from 'fp-ts/lib/function'
import * as L from 'arena-fp-ts/Logger'
import * as Sentry from 'arena-fp-ts/Sentry'

export function foo(logger: L.Logger, data: E.Either<Error, number>) {
  if (E.isLeft(data)) {
    // oh no, this is an error
    const program = pipe(Sentry.init(logger), IO.apSecond(Sentry.captureException(logger)(data.left)))

    program()
  }
}
```

Added in v0.0.1

---

<h2 class="text-delta">Table of contents</h2>

- [utils](#utils)
  - [captureException](#captureexception)

---

# utils

## captureException

**Signature**

```ts
export declare const captureException: (
  logger: L.Logger
) => (err: any, context?: Scope | Partial<ScopeContext> | ((scope: Scope) => Scope) | undefined) => IO.IO<void>
```

Added in v0.0.1
