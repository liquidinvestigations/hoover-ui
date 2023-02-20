import { aggregationCategories } from './constants/aggregationFields'

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

export type SearchQueryType = 'aggregations' | 'results'

export interface SearchQueryParams {
    q: string
    page: number
    size: number
    collections: Category[]
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
    | 'lang'
    | 'thread-index'
    | 'to'
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
    | 'priv-tags.*'

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

export interface Result {
    aggregations: {
        count_by_index: {
            buckets: { key: string; doc_count: number }[]
            doc_count_error_upper_bound: number
            sum_other_doc_count: number
        }
    }
    count_by_index: Record<string, number>
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

export type Category = keyof typeof aggregationCategories | 'collections'
