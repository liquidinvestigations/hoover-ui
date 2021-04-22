import React, { memo } from 'react'
import isEqual from 'react-fast-compare'
import { Typography } from '@material-ui/core'
import Expandable from '../../Expandable'
import AggregationFilter from './AggregationFilter'
import { formatThousands } from '../../../utils'

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
            summary={
                <Typography variant="caption" display="block" style={{ lineHeight: 1.4 }}>
                    {formatThousands(aggregations?.values.buckets.reduce((acc, { doc_count }) => acc + parseInt(doc_count), 0))} hits
                    {', '}
                    {aggregations?.values.buckets.length} buckets
                </Typography>
            }
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
