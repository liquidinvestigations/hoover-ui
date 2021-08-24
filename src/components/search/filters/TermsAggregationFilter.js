import React, { memo, useEffect } from 'react'
import isEqual from 'react-fast-compare'
import { Typography } from '@material-ui/core'
import Expandable from '../../Expandable'
import AggregationFilter from './AggregationFilter'
import { useSearch } from '../SearchProvider'
import { formatThousands } from '../../../utils'
import { aggregationFields } from '../../../constants/aggregationFields'

function TermsAggregationFilter({ title, field, open, onToggle, ...rest }) {

    const { query, aggregations, aggregationsLoading, missingAggregations } = useSearch()

    const queryFilter = query.filters?.[field]
    const highlight = !!(queryFilter?.include?.length || queryFilter?.exclude?.length || queryFilter?.missing)

    const loading = aggregationsLoading[field]
    const aggregation = aggregations?.[field]
    const missing = missingAggregations?.[`${field}-missing`]
    const { loadMissing } = useSearch()
    useEffect(() => {
        if (open && !missing) {
            loadMissing(field)
        }
    }, [open, missing])

    return (
        <Expandable
            title={title}
            loading={loading}
            highlight={highlight}
            greyed={!aggregation?.values.buckets.length}
            open={open}
            onToggle={onToggle}
            resizable={false}
            summary={
                !!aggregation?.values.buckets.length && (
                    <Typography variant="caption" display="block">
                        {
                            !aggregationFields[field].buckets &&
                            !aggregationFields[field].bucketsMax &&
                            aggregation?.count.value > aggregation?.values.buckets.length &&
                            '> '
                        }
                        {formatThousands(aggregationFields[field].bucketsMax ?
                            aggregation?.values.buckets.reduce((acc, { doc_count }) => Math.max(acc, parseInt(doc_count)), 0) :
                            aggregation?.values.buckets.reduce((acc, { doc_count }) => acc + parseInt(doc_count), 0)
                        )} hits
                        {', '}
                        {aggregation?.count.value} buckets
                    </Typography>
                )
            }
        >
            <AggregationFilter
                field={field}
                triState
                {...rest}
            />
        </Expandable>
    )
}

export default memo(TermsAggregationFilter, isEqual)
