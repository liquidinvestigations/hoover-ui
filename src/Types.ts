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

export type SearchQueryType = 'aggregations' | 'results'

export interface SearchQueryParams {
    q?: string
    page?: number
    size?: number
    order?: string[][]
    collections?: string[]
    facets?: Record<string, any>
    filters?: Record<string, any>
}

export interface RequestError {
    status: number
    statusText: string
    url: string
}
