import { omit } from 'lodash';
import { SORT_RELEVANCE } from '../constants';

const INITIAL_SEARCH_STATE = {
    isFetching: false,
    query: {
        size: 10,
        order: SORT_RELEVANCE,
        page: 1,
        language: null,
        searchAfter: '',
        email: null,
    },
    searchAfterByPage: {},
    results: {
        hits: { hits: null },
        total: 0,
    },
    error: null,
};

function getSearchAfterByPage(state, results) {
    const {
        query: { page, order },
        searchAfterByPage,
    } = state;

    let result = { ...searchAfterByPage };

    if (results.hits.total > 0) {
        const lastHit = results.hits.hits.slice(-1)[0];

        result[page + 1] = ['' + lastHit._score, lastHit._id];
        if (order !== SORT_RELEVANCE) {
            const date = new Date(lastHit._source.date);

            result[page + 1] = ['' + date.getTime(), ...result[page + 1]];
        }
    }

    return result;
}

function search(state = INITIAL_SEARCH_STATE, action) {
    switch (action.type) {
        case 'PARSE_SEARCH_URL_QUERY':
            return { ...state, query: action.query };
        case 'FETCH_SEARCH':
            return { ...state, isFetching: true, error: null };
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

const INITIAL_PREVIEW_STATE = {
    isFetching: false,
    url: null,
    doc: null,
};

function preview(state = INITIAL_PREVIEW_STATE, action) {
    switch (action.type) {
        case 'CLEAR_PREVIEW':
            return { ...state, url: null, doc: null };
        case 'FETCH_PREVIEW':
            return {
                ...state,
                isFetching: true,
                url: action.url,
                doc: null,
                error: null,
            };
        case 'FETCH_PREVIEW_SUCCESS':
            return { ...state, isFetching: false, doc: action.doc };
        case 'FETCH_PREVIEW_FAILURE':
            return { ...state, isFetching: false, error: action.error };
        default:
            return state;
    }
}

export default {
    search,
    collections,
    preview,
};
