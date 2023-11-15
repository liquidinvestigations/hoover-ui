import { Typography } from '@mui/material'

import { aggregationCategories, AggregationCategoryProps } from '../../../../constants/aggregationFields'
import { SourceField } from '../../../../Types'

export const getSearchFields = (fields: SourceField[]): AggregationCategoryProps[] => {
    const allFields = Object.values(aggregationCategories).map((category) => ({
        ...category,
        filters: fields.filter((field) => category.filters.some((filter) => filter.startsWith(field) || field.startsWith(filter))),
    }))
    const allCategorizedFilters = Object.values(aggregationCategories).flatMap((category) => category.filters)
    const otherFilters = fields.filter(
        (field) => !allCategorizedFilters.some((categorizedField) => field.startsWith(categorizedField) || categorizedField.startsWith(field)),
    )
    allFields.push({
        label: <Typography>Other</Typography>,
        icon: 'tableView',
        filters: otherFilters,
    })

    return allFields
}
