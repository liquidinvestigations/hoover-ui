import React, { memo, useEffect } from 'react'
import isEqual from 'react-fast-compare'
import { Typography } from '@material-ui/core'
import Expandable from '../../Expandable'
import AggregationFilter from './AggregationFilter'
import { useSearch } from '../SearchProvider'
import { formatThousands } from '../../../utils'
import { aggregationFields } from '../../../constants/aggregationFields'

function TermsAggregationFilter({ title, field, open, onToggle, queryFilter, queryFacets, aggregations, loading, missing, missingLoading, ...rest }) {

    const highlight = !!(queryFilter?.include?.length || queryFilter?.exclude?.length || queryFilter?.missing)

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
            greyed={!aggregations?.values.buckets.length}
            open={open}
            onToggle={onToggle}
            resizable={false}
            summary={
                !!aggregations?.values.buckets.length && (
                    <Typography variant="caption" display="block">
                        {
                            !aggregationFields[field].buckets &&
                            !aggregationFields[field].bucketsMax &&
                            aggregations?.count.value > aggregations?.values.buckets.length &&
                            '> '
                        }
                        {formatThousands(aggregationFields[field].bucketsMax ?
                            aggregations?.values.buckets.reduce((acc, { doc_count }) => Math.max(acc, parseInt(doc_count)), 0) :
                            aggregations?.values.buckets.reduce((acc, { doc_count }) => acc + parseInt(doc_count), 0)
                        )} hits
                        {', '}
                        {aggregations?.count.value} buckets
                    </Typography>
                )
            }
        >
            <AggregationFilter
                field={field}
                queryFilter={queryFilter}
                queryFacets={queryFacets}
                aggregations={aggregations}
                loading={loading}
                missing={missing}
                missingLoading={missingLoading}
                triState
                {...rest}
            />
        </Expandable>
    )
}

export default memo(TermsAggregationFilter, isEqual)
