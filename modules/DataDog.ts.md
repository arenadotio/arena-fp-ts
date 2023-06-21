---
title: DataDog.ts
nav_order: 1
parent: Modules
---

## DataDog overview

```
export interface Metric {
    metricName: string;
    value?: number;
    extraTags?: Record<string, string> | string[];
}
```

**Example**

```ts
import { IO } from 'fp-ts/lib/IO'
import * as TO from 'fp-ts/lib/TaskOption'
import { pipe } from 'fp-ts/lib/function'
import * as DD from '../../src/DataDog'

// Imagine this function does some needed business logic
const main: IO<void> = () => undefined

// Add some DD metrics around main
const appName = 'foo'
const steps = [
  DD.incrementMetric({ metricName: 'start', extraTags: { app_name: appName } }),
  TO.fromIO(main),
  DD.incrementMetric({ metricName: 'end', extraTags: { app_name: appName } }),
] as const

// Sequence into a real program
const program: TO.TaskOption<void> = pipe(steps, TO.sequenceSeqArray, TO.asUnit)

// Go
;(async () => await program())()
```

Added in v0.0.1

---

<h2 class="text-delta">Table of contents</h2>

- [instances](#instances)
  - [DatadogLambdaJs](#datadoglambdajs)
  - [HotShots](#hotshots)
- [model](#model)
  - [Metric (interface)](#metric-interface)
- [utils](#utils)
  - [incrementMetric](#incrementmetric)

---

# instances

## DatadogLambdaJs

**Signature**

```ts
export declare const DatadogLambdaJs: TO.TaskOption<typeof
```

Added in v0.0.1

## HotShots

**Signature**

```ts
export declare const HotShots: TO.TaskOption<typeof
```

Added in v0.0.1

# model

## Metric (interface)

**Signature**

```ts
export interface Metric {
  metricName: string
  value?: number
  extraTags?: Record<string, string> | string[]
}
```

Added in v0.0.1

# utils

## incrementMetric

**Signature**

```ts
export declare const incrementMetric: (a: Metric) => TO.TaskOption<void>
```

Added in v0.0.1
