---
title: Logger.ts
nav_order: 6
parent: Modules
---

## Logger overview

`Logger` is a type re-exported from `pino` and can be used to wrap calls to
`pino` in `IO<void>` instances. Using the `State` monad, logging functions
can be composed while preserving changes they make to the logger bindings.

**Example**

```ts
import { pipe } from 'fp-ts/lib/function'
import * as IO from 'fp-ts/lib/IO'
import * as S from 'fp-ts/lib/State'
import * as A from 'fp-ts/lib/Apply'

import * as L from 'arena-fp-ts/Logger'

// If you have some general business logic functions
const f = (s: string) => s.toUpperCase()
const g = (n: number) => n * n
const h = (b: boolean) => !b

// Create functions which produce State monads that can perform the logging
const step1 =
  (s: string): S.State<L.Logger, IO.IO<string>> =>
  (logger) => {
    const log = L.info(logger)
    // Return a tuple of the result and the next logger
    return [
      // Result logs a message, then returns the value of f(s)
      pipe(
        log('In step one with arg %s', s),
        IO.apSecond(() => f(s))
      ),
      // Create a new logger for step2
      logger.child({ step1: 'called' }),
    ]
  }

const step2 =
  (n: number): S.State<L.Logger, IO.IO<number>> =>
  (logger) => {
    const log = L.debug(logger)
    // Return a tuple of the result and the next logger
    return [
      // Result logs a message, then returns the value of f(s)
      pipe(
        log('In step two with arg %d', n),
        IO.apSecond(() => g(n))
      ),
      // Create a new logger for step2
      logger.child({ step2: 'called' }),
    ]
  }

const step3 =
  (b: boolean): S.State<L.Logger, IO.IO<boolean>> =>
  (logger) => {
    const log = L.info(logger)
    // Return a tuple of the result and the next logger
    return [
      // Result logs a message, then returns the value of h(b)
      pipe(
        log('In step three with arg %s', String(b)),
        IO.apSecond(() => h(b))
      ),
      // Create a new logger for step2
      logger.child({ step3: 'called' }),
    ]
  }

// Sequence the State monads
const [ios, finalLogger] = pipe(
  L.makeLogger('myApp'),
  S.sequenceArray<L.Logger, IO.IO<string | number | boolean>>([step1('foo'), step2(2), step3(true)])
)

// Sequence the IOs into a single function
const program = pipe(
  // Convert the array into a tuple
  [ios[0]!, ...ios.slice(1)] as const,
  (args) => A.sequenceT(IO.Apply)(...args)
)

assert.deepStrictEqual(program(), ['FOO', 4, false])
assert.deepStrictEqual(finalLogger.bindings().step1, 'called')
assert.deepStrictEqual(finalLogger.bindings().step2, 'called')
assert.deepStrictEqual(finalLogger.bindings().step3, 'called')
```

Added in v0.0.1

---

<h2 class="text-delta">Table of contents</h2>

- [constructors](#constructors)
  - [makeLogger](#makelogger)
- [model](#model)
  - [LogFn (interface)](#logfn-interface)
  - [LogLevel (type alias)](#loglevel-type-alias)
  - [Logger (type alias)](#logger-type-alias)
  - [PinoLogger (type alias)](#pinologger-type-alias)
- [utils](#utils)
  - [debug](#debug)
  - [error](#error)
  - [fatal](#fatal)
  - [info](#info)
  - [trace](#trace)
  - [warn](#warn)

---

# constructors

## makeLogger

**Signature**

```ts
export declare const makeLogger: (
  appName: string,
  options?: LoggerOptions | undefined,
  stream?: DestinationStream | undefined
) => Logger
```

Added in v0.0.1

# model

## LogFn (interface)

**Signature**

```ts
export interface LogFn {
  (obj: unknown, msg?: string, ...args: any[]): IO<void>
  (msg: string, ...args: any[]): IO<void>
}
```

Added in v0.0.1

## LogLevel (type alias)

**Signature**

```ts
export type LogLevel = Pino.Level
```

Added in v0.0.1

## Logger (type alias)

**Signature**

```ts
export type Logger = ReturnType<typeof Pino>
```

Added in v0.0.1

## PinoLogger (type alias)

**Signature**

```ts
export type PinoLogger = ReturnType<typeof Pino>
```

Added in v0.0.1

# utils

## debug

**Signature**

```ts
export declare function debug(logger: Logger): LogFn
```

Added in v0.0.1

## error

**Signature**

```ts
export declare function error(logger: Logger): LogFn
```

Added in v0.0.1

## fatal

**Signature**

```ts
export declare function fatal(logger: Logger): LogFn
```

Added in v0.0.1

## info

**Signature**

```ts
export declare function info(logger: Logger): LogFn
```

Added in v0.0.1

## trace

**Signature**

```ts
export declare function trace(logger: Logger): LogFn
```

Added in v0.0.1

## warn

**Signature**

```ts
export declare function warn(logger: Logger): LogFn
```

Added in v0.0.1
