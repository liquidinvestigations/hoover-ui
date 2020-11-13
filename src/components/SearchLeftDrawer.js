import React from 'react';
import { List } from '@material-ui/core';
import Filters from './Filters';
import Filter from './Filter';
import CollectionsBox from './CollectionsBox';

export default function SearchLeftDrawer() {
    return (
        <>
            <List dense>
                <Filter title="Collections" colorIfFiltered={false}>
                    <CollectionsBox/>
                </Filter>
            </List>

            <Filters/>
        </>
    )
}
