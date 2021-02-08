export const SEARCH_GUIDE = 'https://github.com/hoover/search/wiki/Guide-to-search-terms'
export const SEARCH_DATE = 'date'
export const SEARCH_DATE_CREATED = 'date-created'
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
export const DEFAULT_FACET_SIZE = 10
export const DEFAULT_INTERVAL = 'year'
export const DEFAULT_OPERATOR = 'AND'
export const ELLIPSIS_TERM_LENGTH = 30
export const DEFAULT_MAX_RESULTS = 10000
export const HIGHLIGHT_SETTINGS = {
    fragment_size: 150,
    number_of_fragments: 3,
    require_field_match: false,
    pre_tags: ['<mark>'],
    post_tags: ['</mark>'],
}
