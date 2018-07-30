import api from '../api';

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
