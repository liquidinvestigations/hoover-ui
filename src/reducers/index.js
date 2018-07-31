// search
const INITIAL_SEARCH_STATE = {
    isFetching: false,
    query: {
        size: 10,
        order: 'Relevance',
        page: 1,
        searchAfter: '',
    },
    searchAfterByPage: {},
    results: {
        hits: { hits: null },
    },
    error: null,
};

function search(state = INITIAL_SEARCH_STATE, action) {
    switch (action.type) {
        case 'SET_SEARCH_SETTINGS_SIZE':
            return {
                ...state,
                searchAfterByPage: {},
                query: {
                    ...state.query,
                    page: 1,
                    searchAfter: '',
                    size: action.value,
                },
            };
        case 'SET_SEARCH_SETTINGS_ORDER':
            return {
                ...state,
                searchAfterByPage: {},
                query: {
                    ...state.query,
                    page: 1,
                    searchAfter: '',
                    order: action.value,
                },
            };
        case 'SEARCH_URL_QUERY':
            return { ...state, query: action.query };
        case 'FETCH_SEARCH':
            return { ...state, isFetching: true };
        case 'FETCH_SEARCH_SUCCESS':
            return {
                ...state,
                isFetching: false,
                error: null,
                results: action.results,
            };
        case 'FETCH_SEARCH_FAILURE':
            return { ...state, isFetching: false, error: action.error };
        default:
            return state;
    }
}

// collections
const INITIAL_COLLECTIONS_STATE = {
    isFetching: false,
    items: [],
    error: null,
    selected: [],
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
                selected: action.items.map(c => c.name),
            };
        case 'FETCH_COLLECTIONS_FAILURE':
            return { ...state, isFetching: false, items: [], error: action.error };
        case 'SET_COLLECTIONS_SELECTION':
            return { ...state, selected: action.collections };
        default:
            return state;
    }
}

export default {
    search,
    collections,
};
