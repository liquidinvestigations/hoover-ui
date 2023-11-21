import { AST, BinaryAST, Node, NodeRangedTerm, NodeTerm } from 'lucene'

import { aggregationFields } from '../../../../constants/aggregationFields'
import { SourceField, Terms } from '../../../../Types'
import { clearQuotedParam } from '../../../../utils/queryUtils'

export const deleteFilterNode = (filters: Record<string, Terms>, node: Node): Record<string, Terms> => {
    const nodeTerm = node as NodeTerm & NodeRangedTerm

    if (isDateField(node.field)) {
        processDateField(filters, nodeTerm)
    } else if (nodeTerm.term) {
        processNonDateField(filters, nodeTerm)
    }

    return filters
}

const isDateField = (field: SourceField | string): boolean => {
    return aggregationFields[field as SourceField]?.type === 'date'
}

const processDateField = (filters: Record<string, Terms>, nodeTerm: NodeTerm & NodeRangedTerm): void => {
    const termList = filters[nodeTerm.field].intervals?.include

    removeFromList(termList, nodeTerm.term as SourceField)

    if (nodeTerm.term_min && nodeTerm.term_max) {
        filters[nodeTerm.field].from = undefined
        filters[nodeTerm.field].to = undefined
    }

    if (nodeTerm.boost === 1 && filters[nodeTerm.field].intervals?.missing) {
        filters[nodeTerm.field].intervals!.missing = undefined
    }
}

const processNonDateField = (filters: Record<string, Terms>, nodeTerm: NodeTerm & NodeRangedTerm): void => {
    const filter = filters[nodeTerm.field] as Terms

    removeFromList(filter.include, nodeTerm.term as SourceField)
    removeFromList(filter.exclude, nodeTerm.term as SourceField)

    if (nodeTerm.boost === 1 && filter.missing) {
        filter.missing = undefined
    }
}

const removeFromList = (list: SourceField[] | undefined, term: SourceField): void => {
    const index = list?.indexOf(term)
    if (index !== undefined && index > -1 && list) {
        list.splice(index, 1)
    }
}

export const deleteFilterOperands = (filters: Record<string, Terms>, node: AST | Node) => {
    if (node.field) {
        deleteFilterNode(filters, node as NodeTerm)
    }

    if ((node as AST).left) {
        deleteFilterOperands(filters, (node as AST).left)
    }

    if ((node as BinaryAST).right) {
        deleteFilterOperands(filters, (node as BinaryAST).right)
    }

    return filters
}

export const processFilter = (key: SourceField, values: Terms): string => {
    const rangeFilter = createRangeFilter(key, values)
    const intervalFilter = createIntervalFilter(key, values)
    const includeFilter = createIncludeFilter(key, values)
    const excludeFilter = createExcludeFilter(key, values)

    return [rangeFilter, intervalFilter, includeFilter, excludeFilter].filter((filter) => filter !== '').join(' AND ')
}

const createRangeFilter = (key: SourceField, values: Terms): string => {
    if (values.from && values.to) {
        return `(${key}:[${values.from} TO ${values.to}])`
    }
    return ''
}

const createIntervalFilter = (key: SourceField, values: Terms): string => {
    if (!values.intervals) return ''
    const intervalsArray: string[] = []

    if (values.intervals.missing === 'true') {
        intervalsArray.push(`(${key}:"N/A"^1)`)
    }

    values.intervals.include?.forEach((value) => {
        intervalsArray.push(`${key}:${value}`)
    })

    return intervalsArray.length ? `(${intervalsArray.join(' OR ')})` : ''
}

const createIncludeFilter = (key: SourceField, values: Terms): string => {
    if (!values.include?.length) return ''
    const includeOperator = aggregationFields[key]?.type === 'term-and' ? ' AND ' : ' OR '
    const includeArray = values.include.map((value) => `${key}:"${clearQuotedParam(value)}"`)

    return includeArray.length > 1 ? `(${includeArray.join(includeOperator)})` : `${includeArray[0]}`
}

const createExcludeFilter = (key: SourceField, values: Terms): string => {
    if (!values.exclude?.length) return ''
    const excludeArray = values.exclude.map((value) => `(${key}:-"${clearQuotedParam(value)}")`)

    return excludeArray.length > 1 ? `(${excludeArray.join(' AND ')})` : `${excludeArray[0]}`
}
