import { describe, it, expect } from '@jest/globals';
import { pipe } from 'fp-ts/lib/function';
import * as TE from 'fp-ts/lib/TaskEither';
import * as E from 'fp-ts/lib/Either';

import * as mod from '../fixtures/MockableStateReaderTaskEither';
import { mockStateReaderTaskEither } from '../src/Jest';

describe(mockStateReaderTaskEither, () => {
  it('can mock on StateReaderTaskEither return values', async () => {
    const [spy] = mockStateReaderTaskEither(mod, 'testFunction');
    spy.mockReturnValue(TE.of([10, 'foo']));

    const program = pipe(1, mod.testFunction('some state'));
    const result = await program();

    expect(E.isRight(result) && result.right).toEqual([10, 'foo']);
  });

  it('can spy on reader arguments', async () => {
    const [spy] = mockStateReaderTaskEither(mod, 'testFunction');

    const program = pipe(1, mod.testFunction('some state'));
    await program();

    expect(spy).toHaveBeenCalledWith(1);
  });

  it('can spy on state arguments', async () => {
    const [_, spy] = mockStateReaderTaskEither(mod, 'testFunction');

    const program = pipe(1, mod.testFunction('some state'));
    await program();

    expect(spy).toHaveBeenCalledWith('some state');
  });
});

describe('toHaveRightValueWithResult', () => {
  it('matches against a right result value', () => {
    expect(E.right([{ foo: 'bar' }, 'some state'])).toHaveRightValueWithResult({
      foo: 'bar',
    });
  });

  it('fails when result does not match', () => {
    expect(
      E.right([{ foo: 'bar' }, 'some state'])
    ).not.toHaveRightValueWithResult({ foo: 'baz' });
  });

  it('fails when result is not an Either or These', () => {
    expect('string').not.toHaveRightValueWithResult({ foo: 'bar' });
  });

  it('fails when result.right is not a two value tuple', () => {
    expect(E.right({ foo: 'bar' })).not.toHaveRightValueWithResult({
      foo: 'bar',
    });
  });
});

describe('toHaveRightValueWithState', () => {
  it('matches against a right result value', () => {
    expect(E.right([{ foo: 'bar' }, 'some state'])).toHaveRightValueWithState(
      'some state'
    );
  });

  it('fails when resulting state does not match', () => {
    expect(
      E.right([{ foo: 'bar' }, 'not some state'])
    ).not.toHaveRightValueWithState('some state');
  });

  it('fails when result is not an Either or These', () => {
    expect('string').not.toHaveRightValueWithState('some state');
  });

  it('fails when result.right is not a two value tuple', () => {
    expect(E.right({ foo: 'bar' })).not.toHaveRightValueWithState('some state');
  });
});
