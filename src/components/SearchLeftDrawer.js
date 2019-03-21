import { Fragment } from 'react';

import List from '@material-ui/core/List';

import Filters from './Filters';
import Filter from './Filter';
import CollectionsBox from './CollectionsBox';

export default () => (
    <Fragment>
        <List dense>
            <Filter title="Collections" colorIfFiltered={false}>
                <CollectionsBox />
            </Filter>
        </List>

        <Filters />
    </Fragment>
);
