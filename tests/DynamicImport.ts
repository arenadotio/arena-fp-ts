import '@relmify/jest-fp-ts';
import { pipe } from 'fp-ts/lib/function';
import * as DI from '../src/DynamicImport';
import * as RO from 'fp-ts/lib/ReadonlyArray';
import { concatAll } from 'fp-ts/lib/Monoid';

describe('DynamicImport', () => {
    it('Returns none when module is not available', async () => {
        const foo = DI.fromModule('foo');
        expect(foo()).resolves.toBeNone();
    })

    it('Returns some when module is available', async () => {
        const jest = DI.fromModule('jest');
        expect(jest()).resolves.toBeSome();
    })

    it('Returns the first some', async () => {
        const jest = pipe(
            ['foo', 'bar', 'jest'],
            RO.map(DI.fromModule),
            concatAll(DI.getMonoid())
        );
        expect(jest()).resolves.toBeSome();
    })
})
