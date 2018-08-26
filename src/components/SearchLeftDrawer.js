import { Fragment } from 'react';

import List from '@material-ui/core/List';
import Divider from '@material-ui/core/Divider';

import Filters from './Filters';
import Filter from './Filter';
import CollectionsBox from './CollectionsBox';

export default () => (
    <Fragment>
        <List>
            <Filter title="Collections" defaultOpen colorIfFiltered={false}>
                <CollectionsBox />
            </Filter>
        </List>

        <Filters />
    </Fragment>
);
