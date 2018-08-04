import { omit } from 'lodash';
import { SORT_RELEVANCE } from './constants';

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

function doc(state = INITIAL_DOC_STATE, action) {
    switch (action.type) {
        case 'CLEAR_DOC':
            return { ...state, url: null, data: null };
        case 'FETCH_DOC':
            return {
                ...state,
                isFetching: true,
                url: action.url,
                data: null,
                error: null,
                locations: action.locations,
            };
        case 'FETCH_DOC_SUCCESS':
        case 'FETCH_SERVER_DOC':
            return {
                ...state,
                isFetching: false,
                data: action.data,
                url: action.url,
                locations: action.locations,
            };
        case 'FETCH_DOC_FAILURE':
            return { ...state, isFetching: false, error: action.error };
        default:
            return state;
    }
}

export default {
    search,
    collections,
    doc,
};
