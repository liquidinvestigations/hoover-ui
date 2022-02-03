export const SIZE_OPTIONS = [10, 50, 200, 1000]
export const SORTABLE_FIELDS = {
    _score: 'Relevance',
    date: 'Date modified',
    'date-created': 'Date created',
    size: 'Size',
    'word-count': 'Word count',
}
export const JSS_CSS = 'jss-server-side'
export const PRIVATE_FIELDS = ['priv-tags']
export const DATE_FORMAT = 'yyyy-MM-dd'
export const DEFAULT_FACET_SIZE = 44
export const DEFAULT_INTERVAL = 'year'
export const DEFAULT_OPERATOR = 'AND'
export const ELLIPSIS_TERM_LENGTH = 30
export const DEFAULT_MAX_RESULTS = 10000
export const ASYNC_SEARCH_POLL_INTERVAL = 45
export const TAGS_REFRESH_DELAYS = [3000, 6000, 12000, 25000]
export const HIGHLIGHT_SETTINGS = {
    fragment_size: 150,
    number_of_fragments: 2,
    require_field_match: false,
    pre_tags: ['<mark>'],
    post_tags: ['</mark>'],
}
