import React, { memo } from 'react'
import { Divider } from '@material-ui/core'
import Expandable from '../../Expandable'
import AggregationFilter from './AggregationFilter'

function TermsAggregationFilter({ title, field, query, aggregations, emptyDisabled = false, ...rest }) {
    const enabled = !emptyDisabled ||
        !!aggregations?.[field].values.buckets.length ||
        !isNaN(parseInt(query?.facets?.[field]))

    const defaultOpen = !!query?.[field]?.length

    return (
        <Expandable
            title={title}
            enabled={enabled}
            defaultOpen={defaultOpen}
        >
            <AggregationFilter
                field={field}
                query={query}
                aggregations={aggregations}
                triState
                {...rest}
            />

            <Divider />
        </Expandable>
    )
}

export default memo(TermsAggregationFilter)
