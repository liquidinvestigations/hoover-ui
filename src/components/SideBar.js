import Drawer from '@material-ui/core/Drawer';
import Divider from '@material-ui/core/Divider';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import Typography from '@material-ui/core/Typography';

import CollectionsBox from './CollectionsBox';

export default ({ classes }) => (
    <Drawer
        variant="permanent"
        classes={{
            paper: classes.drawerPaper,
        }}>
        <div className={classes.toolbar} />
        <List>
            <ListItem>
                <CollectionsBox />
            </ListItem>
        </List>

        <Divider />

        <List>
            <ListItem>
                <Typography>Filters</Typography>
            </ListItem>
        </List>
    </Drawer>
);
