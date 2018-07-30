import Drawer from '@material-ui/core/Drawer';
import Divider from '@material-ui/core/Divider';
import List from '@material-ui/core/List';

export default ({ classes }) => (
    <Drawer
        variant="permanent"
        classes={{
            paper: classes.drawerPaper,
        }}>
        <div className={classes.toolbar} />
        <List />
        <Divider />
        <List />
    </Drawer>
);

