import Drawer from '@material-ui/core/Drawer';
import Divider from '@material-ui/core/Divider';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import FormControl from '@material-ui/core/FormControl';
import FormLabel from '@material-ui/core/FormLabel';
import FormGroup from '@material-ui/core/FormGroup';
import Typography from '@material-ui/core/Typography';
import Filters from './Filters';

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

        <FormControl component="fieldset" className={classes.sideBarFormControl}>
            <FormLabel component="legend">Filters</FormLabel>
            <FormGroup>
                <Filters />
            </FormGroup>
        </FormControl>
    </Drawer>
);
