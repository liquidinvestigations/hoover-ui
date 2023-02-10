import { DateTime } from 'luxon'
import { useMemo } from 'react'

import { createSearchUrl } from '../../utils/queryUtils'
import Loading from '../Loading'
import { formatsLabel, formatsValue } from '../search/filters/DateHistogramFilter'
import HistogramChart from '../search/filters/HistogramChart'
import { useSearch } from '../search/SearchProvider'

const chartWidth = 500
const chartHeight = 100
const barWidth = 10
const barMargin = 1
const axisHeight = 15

export default function Histogram() {
    const { aggregations, query, search, aggregationsLoading } = useSearch()

    const handleClick = (event, bar) => {
        window.open(
            createSearchUrl(
                {
                    format: 'year',
                    interval: 'month',
                    term: bar,
                },
                'date',
                query.collections,
                {
                    histogram: { date: true },
                }
            )
        )
    }

    const formatLabel = (value) => DateTime.fromISO(value, { setZone: true }).toFormat(formatsLabel.year)

    const formatValue = (value) => DateTime.fromISO(value, { setZone: true }).toFormat(formatsValue.year)

    const data = useMemo(() => {
        const buckets = aggregations?.date?.values.buckets

        if (buckets) {
            let missingBarsCount = 0
            const elements = buckets.map(({ key_as_string, doc_count }, index) => {
                if (index) {
                    const unit = `years`
                    const prevDate = DateTime.fromISO(buckets[index - 1].key_as_string)
                    const currDate = DateTime.fromISO(key_as_string)
                    missingBarsCount += prevDate.diff(currDate, unit)[unit] - 1
                }
                return {
                    label: formatLabel(key_as_string),
                    value: formatValue(key_as_string),
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
    }, [aggregations])

    return aggregationsLoading.date ? (
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
}
