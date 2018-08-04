import url from 'url';
import qs from 'qs';
import { DateTime } from 'luxon';
import { pickBy, castArray } from 'lodash';

import Router from 'next/router';

import api from './api';
import { SORT_OPTIONS, DATE_FORMAT } from './constants';

export function fetchCollections() {
    return async (dispatch, getState) => {
        dispatch({ type: 'FETCH_COLLECTIONS' });

        try {
            dispatch({
                type: 'FETCH_COLLECTIONS_SUCCESS',
                items: await api.collections(),
            });
        } catch (err) {
            dispatch({
                type: 'FETCH_COLLECTIONS_FAILURE',
                error: err,
            });
        }
    };
}

export function setCollectionsSelection(collections) {
    return dispatch => {
        dispatch({
            type: 'SET_COLLECTIONS_SELECTION',
            collections,
        });

        dispatch(resetPagination());
        dispatch(writeSearchQueryToUrl());
    };
}

export function parseSearchUrlQuery() {
    const params = qs.parse(window.location.search.slice(1));

    return {
        type: 'PARSE_SEARCH_URL_QUERY',
        collections: params.collections ? params.collections.split('+') : [],
        raw: params,
        query: {
            q: params.q ? String(params.q).replace(/\+/g, ' ') : '',
            size: params.size ? +params.size : 10,
            order: params.order ? params.order : SORT_OPTIONS[0],
            dateYears: params.dateYears ? castArray(params.dateYears) : [],
            dateCreatedYears: params.dateCreatedYears
                ? castArray(params.dateCreatedYears)
                : [],
            page: params.page ? +params.page : 1,
            searchAfter: params.searchAfter || '',
            fileType: params.fileType ? castArray(params.fileType) : [],
            language: params.language ? castArray(params.language) : [],
            emailDomains: params.emailDomains ? castArray(params.emailDomains) : [],
            dateRange: params.dateRange
                ? {
                      from: DateTime.fromISO(params.dateRange.from),
                      to: DateTime.fromISO(params.dateRange.to),
                  }
                : {},
        },
    };
}

export function writeSearchQueryToUrl() {
    return (dispatch, getState) => {
        dispatch({ type: 'WRITE_SEARCH_QUERY_TO_URL' });

        const {
            search: { query },
            collections: { selected: selectedCollections },
        } = getState();

        let dateRange;

        if (query.dateRange.from && query.dateRange.to) {
            dateRange = {
                from: query.dateRange.from.toFormat(DATE_FORMAT),
                to: query.dateRange.to.toFormat(DATE_FORMAT),
            };
        } else {
            dateRange = {};
        }

        let serializedQuery = {
            ...query,
            dateRange,
            collections: selectedCollections.join('+'),
        };

        serializedQuery = pickBy(
            serializedQuery,
            d => (Array.isArray(d) ? d.length : Boolean(d))
        );

        Router.push({ pathname: '/', search: qs.stringify(serializedQuery) });
    };
}

export function routeChanged(newUrl) {
    return dispatch => {
        const parsed = url.parse(newUrl);

        dispatch({
            type: 'ROUTE_CHANGED',
            url: newUrl,
            parsed,
        });

        // hacky
        if (parsed.pathname === '/') {
            dispatch(search());
        }
    };
}

export function search() {
    return async (dispatch, getState) => {
        const {
            search: { query },
            collections: { selected: selectedCollections },
        } = getState();

        const params = {
            ...query,
            collections: selectedCollections,
        };

        dispatch({ type: 'FETCH_SEARCH', params });

        try {
            dispatch({
                type: 'FETCH_SEARCH_SUCCESS',
                results: await api.search(params),
            });
        } catch (error) {
            dispatch({ type: 'FETCH_SEARCH_FAILURE', error });
        }
    };
}

export const resetPagination = () => ({
    type: 'RESET_PAGINATION',
});

export const updateSearchQuery = (query, options = {}) => {
    return (dispatch, getState) => {
        dispatch({
            type: 'UPDATE_SEARCH_QUERY',
            query,
        });

        if (options.resetPagination) {
            dispatch(resetPagination());
        }

        if (options.syncUrl !== false) {
            dispatch(writeSearchQueryToUrl());
        }
    };
};

export const fetchServerDoc = () => {
    const doc = window.HOOVER_HYDRATE_DOC;
    const docUrl = window.location.href.split('?')[0];
    const { query } = url.parse(window.location.href, true);

    if (!doc) {
        return fetchDoc(docUrl, { locations: query.locations });
    }

    return {
        type: 'FETCH_SERVER_DOC',
        data: doc,
        url: docUrl,
        locations: query.locations,
    };
};

export const fetchDoc = (url, extraState = {}) => {
    return async (dispatch, getState) => {
        dispatch({
            type: 'FETCH_DOC',
            url,
            ...extraState,
        });

        try {
            dispatch({
                type: 'FETCH_DOC_SUCCESS',
                url,
                data: await api.doc(url),
            });
        } catch (error) {
            dispatch({
                type: 'FETCH_DOC_FAILURE',
                error,
            });
        }
    };
};

export const clearDoc = () => ({
    type: 'CLEAR_DOC',
});
