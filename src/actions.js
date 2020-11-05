import { castArray, mapValues, pickBy, debounce } from 'lodash';
import { DateTime } from 'luxon';
import Router from 'next/router';
import qs from 'qs';
import url from 'url';
import api from './api';
import { documentViewUrl, getBasePath } from './utils';
import { DATE_FORMAT, SORT_OPTIONS } from './constants';

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

export function fetchBatchLimits() {
    return async (dispatch, getState) => {
        dispatch({ type: 'FETCH_BATCH_LIMITS' });

        try {
            dispatch({
                type: 'FETCH_BATCH_LIMITS_SUCCESS',
                limits: await api.limits(),
            });
        } catch (err) {
            dispatch({
                type: 'FETCH_BATCH_LIMITS_FAILURE',
                error: err,
            });
        }
    };
}

const refreshCollections = debounce(dispatch => {
    dispatch(resetPagination());
    dispatch(writeSearchQueryToUrl());
}, 500);

export function setCollectionsSelection(collections) {
    return (dispatch, getState) => {
        dispatch({
            type: 'SET_COLLECTIONS_SELECTION',
            collections,
        });

        const { router } = getState();

        // FIXME
        if (router.pathname === '/') {
            refreshCollections(dispatch);
        }
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
            facets: params.facets ? mapValues(params.facets, d => +d) : {},
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

        const dateRange = {};

        if (query.dateRange.from && query.dateRange.to) {
            dateRange.from = query.dateRange.from.toFormat(DATE_FORMAT);
            dateRange.to = query.dateRange.to.toFormat(DATE_FORMAT);
        }

        const serializedQuery = pickBy(
            {
                ...query,
                dateRange,
                collections: selectedCollections.join('+'),
            },
            d => (Array.isArray(d) ? d.length : Boolean(d))
        );

        Router.push({ pathname: '/', search: qs.stringify(serializedQuery) });
    };
}

export function routeChanged(newUrl) {
    return (dispatch, getState) => {
        const parsed = url.parse(newUrl, true);
        const {
            initial,
            doc,
            collections: { wasFetched: collectionsWasFetched },
        } = getState();

        dispatch({
            type: 'ROUTE_CHANGED',
            url: newUrl,
            parsed,
        });

        // hacky
        if (parsed.pathname === '/' && collectionsWasFetched) {
            dispatch(search());
        } else if (
            parsed.pathname.match(/doc\/?/) &&
            parsed.pathname !== doc.url &&
            !initial
        ) {
            dispatch(fetchDoc(parsed.pathname, { includeParents: true }));
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
            return dispatch(writeSearchQueryToUrl());
        }
    };
};

export function loadNextSearchPage() {
    return (dispatch, getState) => {
        const {
            search: { query, searchAfterByPage },
        } = getState();

        return dispatch(
            updateSearchQuery({
                page: query.page + 1,
                searchAfter: searchAfterByPage[query.page + 1],
            })
        );
    };
}

export function loadPreviousSearchPage() {
    return (dispatch, getState) => {
        const {
            search: { query, searchAfterByPage },
        } = getState();

        return dispatch(
            updateSearchQuery({
                page: query.page - 1,
                searchAfter: searchAfterByPage[query.page - 1],
            })
        );
    };
}

export const expandFacet = key => {
    return dispatch => {
        dispatch({
            type: 'EXPAND_FACET',
            key,
        });

        dispatch(writeSearchQueryToUrl());
    };
};

export const fetchDocLocations = url => {
    return async (dispatch, getState) => {
        dispatch({
            type: 'FETCH_DOC_LOCATIONS',
            url,
        });

        try {
            dispatch({
                type: 'FETCH_DOC_LOCATIONS_SUCCESS',
                data: (await api.locationsFor(url, 1)).locations,
            });
        } catch (error) {
            dispatch({
                type: 'FETCH_DOC_LOCATIONS_FAILURE',
                error,
            });
        }
    };
};

export const fetchDoc = (url, { includeParents = false, parentLevels = 3 } = {}) => {
    return async (dispatch, getState) => {
        dispatch({
            type: 'FETCH_DOC',
            url,
        });

        try {
            const data = await api.doc(url, 1);

            if (includeParents) {
                let current = data;
                let level = 0;

                while (current.parent_id && level <= parentLevels) {
                    current.parent = await api.doc(
                        getBasePath(url) + current.parent_id,
                        current.parent_children_page
                    );

                    current = current.parent;
                    level++;
                }
            }

            dispatch({
                type: 'FETCH_DOC_SUCCESS',
                url,
                data,
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

export function fetchNextDoc() {
    return async (dispatch, getState) => {
        const {
            search: { results },
            doc: { url: docUrl, isFetching },
        } = getState();

        if (isFetching) {
            return;
        }

        const hits = results.hits.hits || [];
        const urls = hits.map(documentViewUrl);
        const currentIndex = urls.indexOf(docUrl);

        const found = urls[currentIndex + 1];

        if (currentIndex === urls.length - 1) {
            dispatch(loadNextSearchPage());
        } else if (found) {
            dispatch(fetchDoc(found));
        }
    };
}

export function fetchPreviousDoc() {
    return (dispatch, getState) => {
        const {
            search: { results, query },
            doc: { url: docUrl, isFetching },
        } = getState();

        if (isFetching) {
            return;
        }

        const hits = results.hits.hits || [];
        const urls = hits.map(documentViewUrl);
        const currentIndex = urls.indexOf(docUrl);

        const found = urls[currentIndex - 1];

        if (currentIndex === 0 && query.page > 1) {
            return dispatch(loadPreviousSearchPage());
        } else if (found) {
            return dispatch(fetchDoc(found));
        }
    };
}
