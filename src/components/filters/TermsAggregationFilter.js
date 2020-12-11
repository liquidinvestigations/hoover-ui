import React, { memo } from 'react'
import Filter from './Filter'
import AggregationFilter from './AggregationFilter'

function TermsAggregationFilter({ title, field, query, aggregations, emptyDisabled = false, ...rest }) {
    const enabled = !emptyDisabled ||
        !!aggregations?.[field].values.buckets.length ||
        !isNaN(parseInt(query?.facets?.[field]))

    const defaultOpen = !!query?.[field]?.length

    return (
        <Filter
            title={title}
            enabled={enabled}
            defaultOpen={defaultOpen}
        >
            <AggregationFilter
                field={field}
                query={query}
                aggregations={aggregations}
                {...rest}
            />
        </Filter>
    )
}

export default memo(TermsAggregationFilter)
