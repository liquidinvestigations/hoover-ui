const SORT_RELEVANCE = 'Relevance'
const SORT_NEWEST = 'Newest'
const SORT_OLDEST = 'Oldest'
const SORT_CREATED_DESCENDING = 'Creation date descending'
const SORT_CREATED_ASCENDING = 'Creation date ascending'
const SORT_SIZE_DESCENDING = 'Size descending'
const SORT_SIZE_ASCENDING = 'Size ascending'
const SORT_WORD_COUNT_DESCENDING = 'Word count descending'
const SORT_WORD_COUNT_ASCENDING = 'Word count ascending'

export default function fixLegacyQuery(query) {
    if (query.collections && typeof query.collections === 'string') {
        query.collections = query.collections.split('+')
    }

    if (query.order && typeof query.order === 'string') {
        if (query.order === SORT_RELEVANCE) {
            delete query.order
        } else if (query.order === SORT_NEWEST) {
            query.order = ['date', 'desc']
        } else if (query.order === SORT_OLDEST) {
            query.order = ['date']
        } else if (query.order === SORT_CREATED_DESCENDING) {
            query.order = ['date-created', 'desc']
        } else if (query.order === SORT_CREATED_ASCENDING) {
            query.order = ['date-created']
        } else if (query.order === SORT_SIZE_DESCENDING) {
            query.order = ['size', 'desc']
        } else if (query.order === SORT_SIZE_ASCENDING) {
            query.order = ['size']
        } else if (query.order === SORT_WORD_COUNT_DESCENDING) {
            query.order = ['word-count', 'desc']
        } else if (query.order === SORT_WORD_COUNT_ASCENDING) {
            query.order = ['word-count']
        }
    }
}
