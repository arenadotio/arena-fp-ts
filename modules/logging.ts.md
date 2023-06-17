---
title: logging.ts
nav_order: 2
parent: Modules
---

## logging overview

Added in v0.0.1

---

<h2 class="text-delta">Table of contents</h2>

- [model](#model)
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

# model

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
