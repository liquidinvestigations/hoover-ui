import React, { memo } from 'react'
import { List } from '@material-ui/core'
import DateHistogramFilter from './DateHistogramFilter'
import TermsAggregationFilter from './TermsAggregationFilter'
import { getLanguageName } from '../../utils'

const formatLang = bucket => getLanguageName(bucket.key)

function Filters({ loading, query, aggregations, applyFilter, ...rest }) {
    if (!aggregations) {
        return null
    }

    const handleChange = (key, value, resetPage) => {
        if (resetPage) {
            const { [key]: prevFacet, ...rest } = query.facets || {}
            applyFilter({ [key]: value, facets: { ...rest } })
        } else {
            applyFilter({ [key]: value })
        }
    }

    const handlePagination = (key, newPage) => {
        const { [key]: prevFacet, ...rest } = query.facets || {}
        if (newPage > 1) {
            applyFilter({ facets: { [key]: newPage, ...rest } })
        } else {
            applyFilter({ facets: { ...rest } })
        }
    }

    const filterProps = {
        query,
        aggregations,
        disabled: loading,
        onChange: handleChange,
        onPagination: handlePagination,
    }

    return (
        <List {...rest}>
            <DateHistogramFilter
                title="Date modified"
                field="date"
                {...filterProps}
            />

            <DateHistogramFilter
                title="Date created"
                field="date-created"
                {...filterProps}
            />

            <TermsAggregationFilter
                title="File type"
                field="filetype"
                {...filterProps}
            />

            <TermsAggregationFilter
                title="Language"
                field="lang"
                bucketLabel={formatLang}
                {...filterProps}
            />

            <TermsAggregationFilter
                title="Email domain"
                field="email-domains"
                emptyDisabled
                {...filterProps}
            />
        </List>
    )
}

export default memo(Filters)
