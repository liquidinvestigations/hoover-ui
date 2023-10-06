import { DateTime } from 'luxon'
import { observer } from 'mobx-react-lite'
import { FC, useMemo } from 'react'

import { createSearchUrl } from '../../../utils/queryUtils'
import { Loading } from '../../common/Loading/Loading'
import { formatsLabel, formatsValue } from '../../search/filters/DateHistogramFilter'
import { HistogramChart } from '../../search/filters/Histogram/HistogramChart'
import { useSharedStore } from '../../SharedStoreProvider'

const chartWidth = 500
const chartHeight = 100
const barWidth = 10
const barMargin = 1
const axisHeight = 15

export const Histogram: FC = observer(() => {
    const {
        query,
        searchAggregationsStore: { aggregations, aggregationsLoading },
    } = useSharedStore().searchStore

    const handleClick = (event: MouseEvent, bar: string) => {
        window.open(
            createSearchUrl(
                {
                    format: 'year',
                    interval: 'month',
                    term: bar,
                },
                query?.collections as string | string[],
                'date',
                {
                    histogram: { date: true },
                },
            ),
        )
    }

    const formatLabel = (value: string) => DateTime.fromISO(value, { setZone: true }).toFormat(formatsLabel.year)
    const formatValue = (value: string) => DateTime.fromISO(value, { setZone: true }).toFormat(formatsValue.year)

    const buckets = aggregations?.date?.values.buckets
    const data = useMemo(() => {
        if (buckets) {
            let missingBarsCount = 0
            const elements = buckets.map(({ key_as_string, doc_count }, index) => {
                if (index) {
                    const unit = `years`
                    const prevDate = DateTime.fromISO(buckets[index - 1].key_as_string as string)
                    const currDate = DateTime.fromISO(key_as_string as string)
                    missingBarsCount += prevDate.diff(currDate, unit)[unit] - 1
                }
                return {
                    label: formatLabel(key_as_string as string),
                    value: formatValue(key_as_string as string),
                    count: doc_count,
                    missingBarsCount,
                }
            })

            const xScale = chartWidth / ((elements.length + missingBarsCount) * (barWidth + barMargin) - barMargin)
            const maxCount = Math.max(...buckets.map(({ doc_count }) => doc_count))

            return elements.map(({ label, value, count, missingBarsCount }, index) => ({
                label,
                value,
                count,
                barWidth: barWidth * xScale,
                barHeight: ((chartHeight - axisHeight) * Math.log(count + 1)) / Math.log(maxCount + 1),
                barPosition: (index + missingBarsCount) * (barWidth + barMargin) * xScale,
                labelPosition: ((index + missingBarsCount) * (barWidth + barMargin) + barWidth / 2) * xScale,
            }))
        }
    }, [buckets])

    return !aggregationsLoading || aggregationsLoading.date ? (
        <Loading />
    ) : (
        <div style={{ padding: '20px 20px 0 20px' }}>
            <HistogramChart
                width={chartWidth}
                height={chartHeight}
                axisHeight={axisHeight}
                data={data}
                onClick={handleClick}
                preserveDragArea={false}
            />
        </div>
    )
})
