---
title: Jest.ts
nav_order: 4
parent: Modules
---

## Jest overview

In addition to the various types and utility functions, this module registers
new matchers into Jest's `expect` module along with the matchers provided by
`@relmify/jest-fp-ts`. Importing this module at the type of any test file
will make these matchers available, but you can also add to your
`jest.config.js`:

```
module.exports = {
  ...
  setupFilesAfterEnv: ['arena-fp-ts/Jest'],
  ...
};
```

Added in v0.0.5

---

<h2 class="text-delta">Table of contents</h2>

- [matchers](#matchers)
  - [toHaveRightValueWithResult](#tohaverightvaluewithresult)
  - [toHaveRightValueWithState](#tohaverightvaluewithstate)
- [models](#models)
  - [StateReaderTaskEitherPropertyNames (type alias)](#statereadertaskeitherpropertynames-type-alias)
- [utils](#utils)
  - [mockLambda](#mocklambda)
  - [mockStateReaderTaskEither](#mockstatereadertaskeither)

---

# matchers

## toHaveRightValueWithResult

Checks that the received value is a `Right` `Either` or `These` and that its
value is a tuple `[result, state]`. It finally checks that the `result` is
equal to the expected value using Jest's `toEqual()`.

This is useful when testing the `State` monad or its derivatives.

```
describe('toHaveRightValueWithResult', () => {
  it('matches against a right result value', () => {
    expect(E.right([{ foo: 'bar' }, 'some state'])).toHaveRightValueWithResult({
      foo: 'bar',
    });
  });
});
```

**Signature**

```ts
export declare const toHaveRightValueWithResult: (received: unknown, expected: unknown) => any
```

Added in v0.0.5

## toHaveRightValueWithState

Checks that the received value is a `Right` `Either` or `These` and that its
value is a tuple `[result, state]`. It finally checks that the `state` is
equal to the expected value using Jest's `toEqual()`.

This is useful when testing the `State` monad or its derivatives.

```
describe('toHaveRightValueWithState', () => {
  it('matches against a right result value', () => {
    expect(E.right([{ foo: 'bar' }, 'some state'])).toHaveRightValueWithState(
      'some state'
    );
  });
});
```

**Signature**

```ts
export declare const toHaveRightValueWithState: (received: unknown, expected: unknown) => any
```

Added in v0.0.5

# models

## StateReaderTaskEitherPropertyNames (type alias)

**Signature**

```ts
export type StateReaderTaskEitherPropertyNames<T> = {
  [K in keyof T]: T[K] extends SRTE.StateReaderTaskEither<any, any, any, any> ? K : never
}[keyof T] &
  string
```

Added in v0.0.5

# utils

## mockLambda

**Signature**

```ts
export declare function mockLambda<A>(
  codec: Type<A, any, unknown>,
  returnValue: (state: State) => TE.TaskEither<[Error, State], [void, State]>
): [
  {
    codec: Type<A, any, unknown>
    main: jest.Mock<RTE.ReaderTaskEither<A, [Error, State], [void, State]>, [State]>
  },
  jest.Mock<TE.TaskEither<[Error, State], [void, State]>, [A]>
]
```

Added in v0.0.6

## mockStateReaderTaskEither

Spies on a StateReaderTaskEither and mocks the ReaderTaskEither that it
returns.

```
import { pipe } from 'fp-ts/lib/function';
import * as TE from 'fp-ts/lib/TaskEither';
import * as E from 'fp-ts/lib/Either';
import { mockStateReaderTaskEither } from 'arena-fp-ts/Jest';

import * as fakeModule from 'my-fake-module';

describe(mockStateReaderTaskEither, () => {
    it('can mock on StateReaderTaskEither return values', async () => {
        const [spy] = mockStateReaderTaskEither(fakeModule, 'testFunction');
        spy.mockReturnValue(TE.of([10, 'foo']));

        const program = pipe(
            1,
            fakeModule.testFunction('some state'),
        );
        const result = await program();

        expect(E.isRight(result) && result.right).toEqual([10, 'foo']);
    });

    it('can spy on reader arguments', async () => {
        const [spy] = mockStateReaderTaskEither(fakeModule, 'testFunction');

        const program = pipe(
            1,
            fakeModule.testFunction('some state'),
        );
        await program();

        expect(spy).toHaveBeenCalledWith(1);
    });

    it('can spy on state arguments', async () => {
        const [_, spy] = mockStateReaderTaskEither(fakeModule, 'testFunction');

        const program = pipe(
            1,
            fakeModule.testFunction('some state'),
        );
        await program();

        expect(spy).toHaveBeenCalledWith('some state');
    });
});
```

**Signature**

```ts
export declare function mockStateReaderTaskEither<
  S,
  R,
  E,
  A,
  T extends Record<string, unknown>,
  M extends StateReaderTaskEitherPropertyNames<Required<T>>
>(
  object: T,
  property: M
): Required<T>[M] extends SRTE.StateReaderTaskEither<any, any, any, any>
  ? [jest.SpyInstance<TE.TaskEither<E, [A, S]>, [S]>, jest.SpyInstance<RTE.ReaderTaskEither<R, E, [A, S]>, [S]>]
  : never
```

Added in v0.0.5
