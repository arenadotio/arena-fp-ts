/**
 * @since 0.0.1
 */

import * as DI from './DynamicImport';
import * as TO from 'fp-ts/lib/TaskOption';
import { IO } from 'fp-ts/lib/IO';
import { pipe } from 'fp-ts/lib/function';
import { TaskOption } from 'fp-ts/lib/TaskOption';

// -------------------------------------------------------------------------------------
// model
// -------------------------------------------------------------------------------------

/**
 * @category model
 * @since 0.0.1
 */
export interface Metric {
    metricName: string;
    value?: number;
    extraTags?: Record<string, string> | string[];
}

/**
 * @category internal
 */
export type HotShots = typeof import('hot-shots');

/**
 * @category internal
 */
export type HotShotsStatsD = InstanceType<HotShots['StatsD']>

/**
 * @category internal
 */
export type DatadogLambdaJs = typeof import('datadog-lambda-js');

// -------------------------------------------------------------------------------------
// utils
// -------------------------------------------------------------------------------------

/**
 * @category instances
 * @since 0.0.1
 */
export const HotShots = DI.fromModule<HotShots>('hot-shots');

/**
 * @category instances
 * @since 0.0.1
 */
export const DatadogLambdaJs = DI.fromModule<DatadogLambdaJs>('datadog-lambda-js');

// -------------------------------------------------------------------------------------
// utils
// -------------------------------------------------------------------------------------

/**
 * @category internal
 */
const incrementMetricHotShot = (
    client: HotShotsStatsD
): (a: Metric) => IO<void> => (
    metric
) => () => {
    const { metricName, value, extraTags } = metric;
    const fullMetricName = `${metricName.replace('-', '_').replace(' ', '_')}`;
    client.increment(fullMetricName, value || 1, extraTags);
}

/**
 * @category internal
 */
const incrementMetricLambda = (
    datadog: DatadogLambdaJs
): (a: Metric) => IO<void> => (
    metric
) => () => {
    const { metricName, value, extraTags } = metric;
    const fullMetricName = `${metricName.replace('-', '_').replace(' ', '_')}`;

    const tags = typeof extraTags === 'object' ? Object.entries(extraTags).map(([k, v]) => `${k}:${v}`) : extraTags;

    datadog.sendDistributionMetric(fullMetricName, value || 1, ...(tags || []));
}

/**
 * @category utils
 * @since 0.0.1
 */
export const incrementMetric: (a: Metric) => TO.TaskOption<void> = (a) => {
    const lambda: TaskOption<(a: Metric) => IO<void>> = pipe(
        DatadogLambdaJs,
        TO.map(incrementMetricLambda),
    );

    const hotshot: TaskOption<(a: Metric) => IO<void>> = pipe(
        HotShots,
        TO.map((hotShots: HotShots) => new hotShots.StatsD()),
        TO.map(incrementMetricHotShot),
    );

    return pipe(
        lambda,
        TO.alt(() => hotshot),
        TO.flatMapIO(f => f(a)),
    );
}
