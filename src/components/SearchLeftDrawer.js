import { Fragment } from 'react';

import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import Divider from '@material-ui/core/Divider';

import Filters from './Filters';
import CollectionsBox from './CollectionsBox';

export default () => (
    <Fragment>
        <List>
            <ListItem>
                <CollectionsBox />
            </ListItem>
        </List>

        <Divider />

        <Filters />
    </Fragment>
);
