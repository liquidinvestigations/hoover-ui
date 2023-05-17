import { AggregationCategory } from './constants/aggregationFields'

export interface User {
    admin: boolean
    liquid: {
        title: string
        url: string
    }
    title: string
    urls: {
        admin: string
        hypothesis_embed: string
        login: string
        logout: string
        password_change: string
    }
    username: string
    uuid: string
}

export interface Limits {
    requests: number
    batch: number
}

export interface CollectionData {
    name: Category
    title: string
    stats: {
        counts: {
            files: number
            blob_count: number
            directories: number
            blob_total_size: number
            blob_total_count: number
            archive_source_size: number
            archive_source_count: number
            collection_source_size: number
            collection_source_count: number
        }
        db_size: number
        error_counts: {
            func: string
            count: number
            error_type: string
        }[]
        progress_str: string
        stats_collection_time: number
        task_matrix_header: string[]
        task_matrix: string[][]
    }
    max_result_window: number
}

export type SearchQueryType = 'aggregations' | 'missing' | 'results'

export interface SearchQueryParams {
    q: string
    page: number
    size: number
    collections: string[]
    order?: string[][]
    facets?: Record<string, any>
    filters?: Record<string, any>
}

export type ResultField =
    | 'attachments'
    | 'broken'
    | 'content-type'
    | 'date'
    | 'date-created'
    | 'email-domains'
    | 'filename'
    | 'filetype'
    | 'from'
    | 'id'
    | 'sha3-256'
    | 'in-reply-to'
    | 'lang'
    | 'location'
    | 'md5'
    | 'message'
    | 'message-id'
    | 'ocr'
    | 'ocrimage'
    | 'ocrpdf'
    | 'ocrtext.*'
    | 'path'
    | 'path-parts'
    | 'path-text'
    | 'pgp'
    | 'references'
    | 'rev'
    | 'sha1'
    | 'size'
    | 'subject'
    | 'tags'
    | 'text'
    | 'thread-index'
    | 'to'
    | 'word-count'
    | 'translated-from'
    | 'translated-to'
    | 'is-table'
    | 'table-columns'
    | 'table-sheets'
    | 'table-sheet-count'
    | 'table-row-count'
    | 'table-col-count'
    | 'skipped'
    | 'entity'
    | 'entity-type.location'
    | 'entity-type.organization'
    | 'entity-type.event'
    | 'entity-type.person'
    | 'entity-type.money'
    | 'priv-tags.*'

export type SourceField =
    | 'path'
    | 'path-parts'
    | 'filename'
    | 'url'
    | 'size'
    | 'word-count'
    | 'table-sheet-count'
    | 'table-row-count'
    | 'table-col-count'
    | 'date'
    | 'date-created'
    | 'attachments'
    | 'ocr'
    | 'ocrimage'
    | 'ocrpdf'
    | 'pgp'
    | 'has-thumbnails'
    | 'has-pdf-preview'
    | 'is-table'
    | 'skipped'
    | 'email-domains'
    | 'filetype'
    | 'content-type'
    | 'from'
    | 'from.keyword'
    | 'lang'
    | 'thread-index'
    | 'to'
    | 'to.keyword'
    | 'subject'
    | 'detected-objects.object.keyword'
    | 'image-classes.class.keyword'
    | 'translated-from'
    | 'translated-to'
    | 'table-columns'
    | 'table-sheets'
    | 'entity.keyword'
    | 'entity-type.location.keyword'
    | 'entity-type.organization.keyword'
    | 'entity-type.event.keyword'
    | 'entity-type.person.keyword'
    | 'entity-type.money.keyword'
    | 'tags'
    | 'priv-tags'
    | 'md5'
    | 'sha1'

interface HighlightField {
    fragment_size: number
    number_of_fragments: number
    post_tags: string[]
    pre_tags: string[]
    require_field_match: boolean
}

export type FileType =
    | 'archive'
    | 'audio'
    | 'default'
    | 'doc'
    | 'email'
    | 'email-archive'
    | 'folder'
    | 'html'
    | 'image'
    | 'pdf'
    | 'text'
    | 'video'
    | 'xls'

export interface Hit {
    highlight: Record<ResultField, string[]>
    _collection: string
    _id: string
    _index: string
    _score: number
    _source: Record<SourceField | ResultField, any>
    _type: string
    _url_rel: string
}

export interface Bucket {
    key: string
    doc_count: number
    key_as_string?: string
}

export interface AggregationValues {
    buckets?: Bucket[]
    doc_count?: number
    doc_count_error_upper_bound?: number
    sum_other_doc_count?: number
}

export interface Aggregation {
    count: { value: number }
    doc_count: number
    meta: any
    values: AggregationValues
}

export type AggregationsKey = SourceField | `${SourceField}-missing`

export type Aggregations = Partial<Record<AggregationsKey, Aggregation>>

export interface Result {
    aggregations: Aggregations
    count_by_index: Partial<Record<Category, number>>
    hits: {
        hits: Hit[]
        max_score: number
        total: number
    }
    status: 'ok'
    timed_out: boolean
    took: number
    _shards: {
        total: number
        failed: number
        skipped: number
        successful: number
    }
}

export interface Eta {
    total_sec?: number
    own_search_sec?: number
    queue_sec?: number
    queue_length?: number
}

export type AsyncTaskStatus = 'done' | 'pending'

export interface AsyncTaskData {
    args: any
    collections: string[]
    date_created: string
    date_finished: string
    date_modified: string
    date_started: string
    eta: Eta
    result: Result | null
    status: AsyncTaskStatus
    task_id: string
    user: string
}

export interface RequestError {
    status: number
    statusText: string
    url: string
}

export type Category = AggregationCategory | 'collections'

export interface OcrData {
    tag: string
    text: string
}

export interface ChildDocument {
    id: string
    filename: string
    filetype: string
    content_type: string
    digest?: string
    file?: string
    size?: number
}

export interface DocumentContent {
    id: string
    filename: string
    filetype: string
    'has-pdf-preview': boolean
    'has-thumbnails': boolean
    'content-type': string
    'date-created': string
    date: string
    lang: string
    ocr: boolean
    ocrpdf: boolean
    md5: string
    sha1: string
    'sha1-256': string
    size: number
    skipped: boolean
    text: string
    ocrtext: Record<string, string>
    attachments: []
    entity: string[]
    'entity-type.location': string[]
    'entity-type.organization': string[]
    'entity-type.person': string[]
    path: string
    'path-parts': string[]
    'path-text': string
    tika: string[]
    'tika-key': string[]
    'translated-from': string[]
    'translated-to': string[]
    'word-count': number
    tree: string
    pgp: boolean
}

export interface DocumentData {
    id: string
    digest?: string
    parent_id: string
    parent_children_page: number
    children: ChildDocument[]
    children_count: number
    children_has_next_page: boolean
    children_page: number
    children_page_count: number
    content: DocumentContent
    has_locations: boolean
    version: string
    safe_html?: string
}
