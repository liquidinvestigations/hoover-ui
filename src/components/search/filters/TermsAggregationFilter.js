import React, { memo } from 'react'
import isEqual from 'react-fast-compare'
import { Divider } from '@material-ui/core'
import Expandable from '../../Expandable'
import AggregationFilter from './AggregationFilter'

function TermsAggregationFilter({ title, field, queryField, queryFacets, aggregations,
                                    emptyDisabled = false, ...rest }) {

    const enabled = !emptyDisabled ||
        !!aggregations?.values.buckets.length ||
        !isNaN(parseInt(queryFacets?.[field]))

    const defaultOpen = !!queryField?.length

    return (
        <Expandable
            title={title}
            enabled={enabled}
            defaultOpen={defaultOpen}
        >
            <AggregationFilter
                field={field}
                queryField={queryField}
                queryFacets={queryFacets}
                aggregations={aggregations}
                triState
                {...rest}
            />
            <Divider />
        </Expandable>
    )
}

export default memo(TermsAggregationFilter, isEqual)
