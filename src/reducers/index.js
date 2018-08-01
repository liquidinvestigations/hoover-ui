import { omit } from 'lodash';

const INITIAL_SEARCH_STATE = {
    isFetching: false,
    query: {
        size: 10,
        order: 'Relevance',
        page: 1,
        language: null,
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
        case 'PARSE_SEARCH_URL_QUERY':
            return { ...state, query: action.query };
        case 'FETCH_SEARCH':
            return { ...state, isFetching: true };
        case 'UPDATE_SEARCH_QUERY':
            return { ...state, query: { ...state.query, ...action.query } };
        case 'RESET_PAGINATION':
            return {
                ...state,
                searchAfterByPage: {},
                query: { ...state.query, page: 1, searchAfter: '' },
            };
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

const INITIAL_COLLECTIONS_STATE = {
    isFetching: false,
    items: [],
    selected: [],
    error: null,
    counts: {},
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
                selected: state.selected.length
                    ? state.selected
                    : action.items.map(c => c.name),
            };
        case 'FETCH_COLLECTIONS_FAILURE':
            return { ...state, isFetching: false, items: [], error: action.error };
        case 'FETCH_SEARCH_SUCCESS':
            return { ...state, counts: action.results.count_by_index };
        case 'SET_COLLECTIONS_SELECTION':
            return { ...state, selected: action.collections };
        default:
            return state;
    }
}

function preview(state = null, action) {
    switch (action.type) {
        case 'SET_PREVIEW':
            return action.url;
        case 'CLEAR_PREVIEW':
            return null;
        default:
            return state;
    }
}

export default {
    search,
    collections,
    preview,
};
