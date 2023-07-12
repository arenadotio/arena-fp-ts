import * as SRTE from 'fp-ts/lib/StateReaderTaskEither';
import * as TE from 'fp-ts/lib/TaskEither';

export const testFunction: SRTE.StateReaderTaskEither<
  string,
  number,
  Error,
  number
> = (state) => (n) => TE.of([n * n, `${state}-${n}`]);
