import { Fragment } from 'react';

import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import Divider from '@material-ui/core/Divider';

import Filters from './Filters';
import CollectionsBox from './CollectionsBox';

import SplitPane from 'react-split-pane';

export default () => (
    <Fragment>
        <SplitPane
            split="horizontal"
            defaultSize="auto"
            pane1Style={{ overflow: 'hidden' }}>
            <div>
                <List>
                    <ListItem>
                        <CollectionsBox />
                    </ListItem>
                </List>
            </div>

            <div>
                <Filters />
            </div>
        </SplitPane>
    </Fragment>
);
