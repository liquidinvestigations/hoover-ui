import React, { memo } from 'react'
import isEqual from 'react-fast-compare'
import Expandable from '../../Expandable'
import AggregationFilter from './AggregationFilter'

function TermsAggregationFilter({ title, open, onToggle, queryFilter, aggregations, emptyDisabled = false, ...rest }) {

    const enabled = !emptyDisabled || !!aggregations?.values.buckets.length

    const highlight = !!(queryFilter?.include?.length || queryFilter?.exclude?.length || queryFilter?.missing)

    return (
        <Expandable
            title={title}
            highlight={highlight}
            greyed={!aggregations?.values.buckets.length}
            enabled={enabled}
            open={open}
            onToggle={onToggle}
            resizable={false}
        >
            <AggregationFilter
                queryFilter={queryFilter}
                aggregations={aggregations}
                triState
                {...rest}
            />
        </Expandable>
    )
}

export default memo(TermsAggregationFilter, isEqual)
