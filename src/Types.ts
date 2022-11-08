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

export interface RequestError {
    status: number
    statusText: string
    url: string
}
