const PARAMS_MAP = {
    q: 'q',
    c: 'collections',
    p: 'page',
    s: 'size',
    o: 'order',
    d: 'date',
    r: 'date-created',
    f: 'filetype',
    l: 'lang',
    e: 'email-domains',
    t: 'facets',
}

export const rollupParams = query => Object.fromEntries(Object.entries(query).map(([field, value]) => {
    const key = Object.keys(PARAMS_MAP).find(key => PARAMS_MAP[key] === field)
    return key ? [key, value] : [field, value]
}))

export const unwindParams = query => Object.fromEntries(Object.entries(query).map(([field, value]) =>
    PARAMS_MAP[field] ? [PARAMS_MAP[field], value] : [field, value])
)
