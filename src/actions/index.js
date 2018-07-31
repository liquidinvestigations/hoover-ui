import api from '../api';
import qs from 'qs';
import { castArray } from 'lodash';
import { SORT_OPTIONS } from '../constants';

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
    return {
        type: 'SET_COLLECTIONS_SELECTION',
        collections,
    };
}

export const setSearchSettingsSize = value => ({
    type: 'SET_SEARCH_SETTINGS_SIZE',
    value,
});

export const setSearchSettingsOrder = value => ({
    type: 'SET_SEARCH_SETTINGS_ORDER',
    value,
});

export function parseSearchUrlQuery() {
    const params = qs.parse(window.location.search.slice(1));

    return {
        type: 'SEARCH_URL_QUERY',
        query: {
            q: params.q ? String(params.q).replace(/\+/g, ' ') : '',
            size: params.size ? +params.size : 10,
            order: params.order ? params.order : SORT_OPTIONS[0],
            collections: params.collections ? params.collections.split('+') : [],
            dateFrom: params.dateFrom,
            dateTo: params.dateTo,
            dateYears: params.dateYears ? castArray(params.dateYears) : [],
            dateCreatedYears: params.dateCreatedYears
                ? castArray(params.dateCreatedYears)
                : [],
            page: params.page ? +params.page : 1,
            searchAfter: params.searchAfter || '',
            fileType: params.fileType ? castArray(params.fileType) : [],
        },
    };
}

export function routeChanged(url) {
    return {
        type: 'ROUTE_CHANGED',
        url,
    };
}

export function search() {
    return async (dispatch, getState) => {
        dispatch({ type: 'FETCH_SEARCH' });

        const {
            search: { query },
            collections: { selected: selectedCollections },
        } = getState();

        try {
            dispatch({
                type: 'FETCH_SEARCH_SUCCESS',
                results: await api.search({
                    ...query,
                    collections: selectedCollections,
                }),
            });
        } catch (error) {
            dispatch({ type: 'FETCH_SEARCH_FAILURE', error });
        }
    };
}
