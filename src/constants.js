export const SEARCH_GUIDE = 'https://github.com/hoover/search/wiki/Guide-to-search-terms'
export const SEARCH_MD5 = 'md5'
export const SEARCH_SHA1 = 'sha1'
export const SEARCH_PATH_PARTS = 'path-parts'
export const SEARCH_PATH_TEXT = 'path-text'
export const SEARCH_FILENAME = 'filename'
export const SEARCH_LANGUAGE = 'lang'
export const SEARCH_TEXT = 'text'
export const SEARCH_SUBJECT = 'subject'
export const SEARCH_FROM = 'from'
export const SEARCH_TO = 'to'
export const SEARCH_MESSAGE_ID = 'message-id'
export const SEARCH_IN_REPLY_TO = 'in-reply-to'
export const SEARCH_THREAD_INDEX = 'thread-index'
export const SEARCH_REFERENCES = 'references'
export const SEARCH_DATE = 'date'
export const SEARCH_DATE_CREATED = 'date-created'
export const SEARCH_OCR = 'ocr'
export const SEARCH_QUERY_PREFIXES = [
    SEARCH_MD5,
    SEARCH_SHA1,
    SEARCH_PATH_PARTS,
    SEARCH_PATH_TEXT,
    SEARCH_FILENAME,
    SEARCH_LANGUAGE,
    SEARCH_TEXT,
    SEARCH_SUBJECT,
    SEARCH_FROM,
    SEARCH_TO,
    SEARCH_MESSAGE_ID,
    SEARCH_IN_REPLY_TO,
    SEARCH_THREAD_INDEX,
    SEARCH_REFERENCES,
    SEARCH_DATE,
    SEARCH_DATE_CREATED,
    SEARCH_OCR,
]
export const SIZE_OPTIONS = [10, 50, 200, 1000]
export const SORTABLE_FIELDS = {
    _score: 'Relevance',
    date: 'Date modified',
    'date-created': 'Date created',
    size: 'Size',
    'word-count': 'Word count',
}
export const DATE_FORMAT = 'yyyy-MM-dd'
export const DEFAULT_FACET_SIZE = 10
export const DEFAULT_INTERVAL = 'year'
export const DEFAULT_OPERATOR = 'AND'
export const JSS_CSS = 'jss-server-side'
export const HIGHLIGHT_SETTINGS = {
    fragment_size: 150,
    number_of_fragments: 3,
    require_field_match: false,
    pre_tags: ['<mark>'],
    post_tags: ['</mark>'],
}
