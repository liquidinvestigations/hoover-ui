// search
const INITIAL_SEARCH_STATE = {
    isFetching: false,
    settings: {
        size: 10,
        order: 'Relevance',
    },
    filters: {},
    result: {
        hits: { hits: null },
    },
};

function search(state = INITIAL_SEARCH_STATE, action) {
    switch (action.type) {
        case 'SET_SEARCH_SETTINGS_SIZE':
            return { ...state, settings: { ...state.settings, size: action.value } };
        case 'SET_SEARCH_SETTINGS_ORDER':
            return {
                ...state,
                settings: { ...state.settings, order: action.value },
            };
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
