import { AST, BinaryAST, Node, NodeRangedTerm, NodeTerm } from 'lucene'

import { aggregationFields } from '../../../../constants/aggregationFields'
import { SourceField, Terms } from '../../../../Types'

export const deleteFilterNode = (filters: Record<string, Terms>, node: Node) => {
    const nodeTerm = node as NodeTerm & NodeRangedTerm

    if (aggregationFields[node.field as SourceField]?.type === 'date') {
        let index
        const list = filters[nodeTerm.field].intervals?.include

        if (list && (index = list?.indexOf(nodeTerm.term as SourceField)) > -1) {
            list.splice(index, 1)
        }

        if (nodeTerm.term_min && nodeTerm.term_max) {
            filters[nodeTerm.field].from = filters[nodeTerm.field].to = undefined
        }

        if (nodeTerm.boost === 1 && filters[nodeTerm.field].intervals?.missing) {
            filters[nodeTerm.field].intervals!.missing = undefined
        }
    } else if (nodeTerm.term) {
        let index
        const filter = filters[nodeTerm.field] as Terms

        if ((index = filter.include?.indexOf(nodeTerm.term as SourceField))) {
            filter.include?.splice(index || 0, 1)
        } else if ((index = filter.exclude?.indexOf(nodeTerm.term as SourceField))) {
            filter.exclude?.splice(index || 0, 1)
        } else if (nodeTerm.boost === 1 && filter.missing) {
            filter.missing = undefined
        }
    }

    return filters
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
