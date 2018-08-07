import { withStyles } from '@material-ui/core/styles';
import Drawer from '@material-ui/core/Drawer';

const styles = theme => ({
    drawerPaper: {
        position: 'relative',
        zIndex: 0,
    },
    leftDrawer: {
        minWidth: 280,
        maxWidth: '20%',
        overflowX: 'hidden',
        overflowY: 'auto',
        height: 'auto',
    },
    rightDrawer: {
        minWidth: 280,
        width: '40%',
        overflowX: 'hidden',
        overflowY: 'auto',
        height: 'auto',
    },
    middle: {
        flex: 1,
        backgroundColor: theme.palette.background.default,
        paddingLeft: theme.spacing.unit * 3,
        paddingRight: theme.spacing.unit * 3,
        minWidth: 0, // So the Typography noWrap works
        overflowX: 'hidden',
        overflowY: 'auto',
        height: 'auto',
    },

    toolbar: theme.mixins.toolbar,

    container: {
        display: 'flex',
        overflow: 'hidden',
        height: '100vh',
        position: 'relative',
        backfaceVisibility: 'hidden',
        willChange: 'overflow',
    },
});

export default withStyles(styles)(({ left, right, children, classes }) => (
    <div className={classes.container}>
        {left && (
            <Drawer
                variant={'permanent'}
                classes={{
                    paper: classes.drawerPaper,
                    docked: classes.leftDrawer,
                }}>
                <div className={classes.toolbar} />
                {left}
            </Drawer>
        )}

        <main className={classes.middle}>
            <div className={classes.toolbar} />
            {children}
        </main>

        {right && (
            <Drawer
                classes={{
                    paper: classes.drawerPaper,
                    docked: classes.rightDrawer,
                }}
                variant={right ? 'permanent' : undefined}
                anchor="right">
                <div className={classes.toolbar} />
                {right}
            </Drawer>
        )}
    </div>
));
