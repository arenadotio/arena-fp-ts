import '@relmify/jest-fp-ts';
import { describe, jest, expect } from '@jest/globals';
import { it } from '@fast-check/jest';

import * as Stream from '../src/Stream';
import * as fc from 'fast-check';
import { pipe } from 'fp-ts/lib/function';

import * as TE from 'fp-ts/lib/TaskEither';

jest.setTimeout(5000);

describe(Stream.map, () => {
  it.prop([fc.array(fc.integer())])(
    'can convert to an from an array',
    async (arr) => {
      const result = await pipe(Stream.fromIterable(arr), Stream.toArray, (f) =>
        f()
      );
      expect(result).toEqual(arr);
    }
  );

  it.prop([fc.array(fc.integer())])('maps elements in stream', async (arr) => {
    const spy = jest.fn((n: number) => n + 1);
    const expected = arr.map(spy);
    spy.mockClear();

    const result = await pipe(
      Stream.fromIterable(arr),
      Stream.map(spy),
      Stream.toArray,
      (f) => f()
    );

    expect(result).toEqual(expected);
    for (const n of arr) {
      expect(spy).toHaveBeenCalledWith(n);
    }
  });

  it.prop([fc.array(fc.integer())])(
    'flatMaps elements in stream',
    async (arr) => {
      const spy = jest.fn((n: number) => Stream.fromIterable([n, n + 1]));
      const expected = arr.flatMap((n: number) => [n, n + 1]);

      const result = await pipe(
        Stream.fromIterable(arr),
        Stream.flatMap(spy),
        Stream.toArray,
        (f) => f()
      );

      expect(result).toEqual(expected);
      for (const n of arr) {
        expect(spy).toHaveBeenCalledWith(n);
      }
    }
  );

  it.prop([fc.array(fc.integer())])(
    'can get an array from a TaskEither',
    async (arr) => {
      const result = await pipe(
        TE.of<Error, number[]>(arr),
        Stream.fromTaskEither,
        Stream.toEitherArray,
        (f) => f()
      );
      expect(result).toEqualRight(arr);
    }
  );

  it('can handle left in TaskEither', async () => {
    const result = await pipe(
      TE.left<Error, number[]>(new Error()),
      Stream.fromTaskEither,
      Stream.toEitherArray,
      (f) => f()
    );
    expect(result).toBeLeft();
  });
});
