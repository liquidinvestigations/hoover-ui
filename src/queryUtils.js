const PARAMS_MAP = {
    q: 'q',
    c: 'collections',
    p: 'page',
    s: 'size',
    o: 'order',
    m: 'dateRange',
    r: 'dateCreatedRange',
    f: 'fileType',
    l: 'language',
    e: 'emailDomains',
    y: 'dateYears',
    d: 'dateCreatedYears',
    t: 'facets',
}

export const rollupParams = query => Object.fromEntries(Object.entries(query).map(([field, value]) => {
    const key = Object.keys(PARAMS_MAP).find(key => PARAMS_MAP[key] === field)
    return key ? [key, value] : [field, value]
}))

export const unwindParams = query => Object.fromEntries(Object.entries(query).map(([field, value]) =>
    PARAMS_MAP[field] ? [PARAMS_MAP[field], value] : [field, value])
)
