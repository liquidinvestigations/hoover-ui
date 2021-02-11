import React, { memo } from 'react'
import isEqual from 'react-fast-compare'
import Expandable from '../../Expandable'
import AggregationFilter from './AggregationFilter'

function TermsAggregationFilter({ title, field, queryFilter, queryFacets, aggregations,
                                    emptyDisabled = false, ...rest }) {

    const enabled = !emptyDisabled || !!aggregations?.values.buckets.length || !isNaN(parseInt(queryFacets))

    const defaultOpen = !!queryFilter?.include?.length || !!queryFilter?.exclude?.length

    return (
        <Expandable
            title={title}
            enabled={enabled}
            defaultOpen={defaultOpen}
        >
            <AggregationFilter
                field={field}
                queryFilter={queryFilter}
                queryFacets={queryFacets}
                aggregations={aggregations}
                triState
                {...rest}
            />
        </Expandable>
    )
}

export default memo(TermsAggregationFilter, isEqual)
