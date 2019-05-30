import {
    DEFAULT_FACET_SIZE,
    SORT_RELEVANCE,
    SORT_OLDEST,
    ES_LONG_MIN,
    ES_LONG_MAX,
} from './constants';

const INITIAL_SEARCH_STATE = {
    isFetching: false,
    query: {
        size: 10,
        order: SORT_RELEVANCE,
        page: 1,
        language: null,
        searchAfter: '',
        email: null,
        dateRange: {},
        facets: {},
    },
    searchAfterByPage: {},
    results: {
        hits: { hits: null },
        total: 0,
    },
    error: null,
    wasQueryParsed: false,
};

function getSearchAfterByPage(state, results) {
    const {
        query: { page, order },
        searchAfterByPage,
    } = state;

    let result = { ...searchAfterByPage };

    if (results.hits.hits.length) {
        const lastHit = results.hits.hits.slice(-1)[0];

        result[page + 1] = [lastHit._score, lastHit._id];

        if (order !== SORT_RELEVANCE) {
            let dateValue;

            if (lastHit._source.date) {
                dateValue = new Date(lastHit._source.date).getTime();
            } else {
                // if date is missing, ES will use Long.MIN_VALUE or Long.MAX_VALUE
                // see https://github.com/elastic/elasticsearch-js/issues/662
                dateValue = order === SORT_OLDEST ? ES_LONG_MAX : ES_LONG_MIN;
            }

            result[page + 1] = ['' + dateValue, ...result[page + 1]];
        }
    }

    return result;
}

function search(state = INITIAL_SEARCH_STATE, action) {
    switch (action.type) {
        case 'PARSE_SEARCH_URL_QUERY':
            return { ...state, query: action.query, wasQueryParsed: true };
        case 'FETCH_SEARCH':
            return { ...state, isFetching: true, error: null };
        case 'UPDATE_SEARCH_QUERY':
            return { ...state, query: { ...state.query, ...action.query } };
        case 'EXPAND_FACET':
            const newValue =
                (state.query.facets[action.key] || DEFAULT_FACET_SIZE) +
                DEFAULT_FACET_SIZE;

            return {
                ...state,
                query: {
                    ...state.query,
                    facets: { ...state.query.facets, [action.key]: newValue },
                },
            };
        case 'RESET_PAGINATION':
            return {
                ...state,
                searchAfterByPage: {},
                query: { ...state.query, page: 1, searchAfter: '', facets: {} },
            };
        case 'FETCH_SEARCH_SUCCESS':
            return {
                ...state,
                isFetching: false,
                error: null,
                results: action.results,
                searchAfterByPage: {
                    ...state.searchAfterByPage,
                    ...getSearchAfterByPage(state, action.results),
                },
            };
        case 'FETCH_SEARCH_FAILURE':
            return { ...state, isFetching: false, error: action.error };
        default:
            return state;
    }
}

const INITIAL_COLLECTIONS_STATE = {
    isFetching: false,
    items: [],
    selected: [],
    error: null,
    counts: {},
    wasFetched: false,
};

function collections(state = INITIAL_COLLECTIONS_STATE, action) {
    switch (action.type) {
        case 'FETCH_COLLECTIONS':
            return { ...state, isFetching: true };
        case 'FETCH_COLLECTIONS_SUCCESS':
            return {
                ...state,
                isFetching: false,
                items: action.items,
                wasFetched: true,
            };
        case 'FETCH_COLLECTIONS_FAILURE':
            return { ...state, isFetching: false, items: [], error: action.error };
        case 'FETCH_SEARCH_SUCCESS':
            return { ...state, counts: action.results.count_by_index };
        case 'SET_COLLECTIONS_SELECTION':
            return { ...state, selected: action.collections };
        case 'PARSE_SEARCH_URL_QUERY':
            return {
                ...state,
                selected: action.collections.length
                    ? action.collections
                    : state.items.map(c => c.name),
            };
        default:
            return state;
    }
}

const INITIAL_DOC_STATE = {
    isFetching: false,
    url: null,
    data: null,
    locations: null,
};

const parseCollection = url => {
    const [, collection] = url.match(/(?:^|\/)doc\/(.+?)\//) || [];
    return collection;
};

function doc(state = INITIAL_DOC_STATE, action) {
    switch (action.type) {
        case 'CLEAR_DOC':
            return { ...state, url: null, data: null };
        case 'FETCH_DOC':
            return {
                ...state,
                isFetching: true,
                url: action.url,
                collection: parseCollection(action.url),
                data: null,
                error: null,
                locations: [],
            };
        case 'FETCH_DOC_LOCATIONS_SUCCESS':
            return { ...state, locations: action.data };
        case 'FETCH_DOC_SUCCESS':
        case 'FETCH_SERVER_DOC':
            return {
                ...state,
                isFetching: false,
                data: action.data,
                url: action.url,
                collection: parseCollection(action.url),
            };
        case 'FETCH_DOC_FAILURE':
            return { ...state, isFetching: false, error: action.error };
        default:
            return state;
    }
}

const INITIAL_BATCH_STATE = {
    isFetching: false,
    error: null,
    limits: null,
};

function batch(state = INITIAL_BATCH_STATE, action) {
    switch (action.type) {
        case 'FETCH_BATCH_LIMITS':
            return { ...state, isFetching: true, limits: null, error: null };
        case 'FETCH_BATCH_LIMITS_SUCCESS':
            return {
                ...state,
                isFetching: false,
                limits: action.limits,
                error: null,
            };
        case 'FETCH_BATCH_LIMITS_FAILURE':
            return { ...state, isFetching: false, error: null };
        default:
            return state;
    }
}

const INITIAL_ROUTE_STATE = {
    initial: true,
};

function router(state = INITIAL_ROUTE_STATE, action) {
    if (action.type === 'ROUTE_CHANGED') {
        return { ...state, ...action.parsed, initial: false };
    } else {
        return state;
    }
}

export default {
    search,
    collections,
    doc,
    batch,
    router,
};
