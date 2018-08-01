import Head from 'next/head';
import Header from './Header';
import SideBar from './SideBar';
import ProgressIndicator from './ProgressIndicator';
import { withStyles } from '@material-ui/core/styles';

const drawerWidth = 300;

const styles = theme => ({
    root: {
        flexGrow: 1,
        zIndex: 1,
        overflow: 'hidden',
        position: 'relative',
        display: 'flex',
    },
    drawerPaper: {
        position: 'relative',
        width: drawerWidth,
    },
    content: {
        flexGrow: 1,
        backgroundColor: theme.palette.background.default,
        padding: theme.spacing.unit * 3,
        minWidth: 0, // So the Typography noWrap works
    },
    toolbar: theme.mixins.toolbar,
});

const Layout = ({ children, classes }) => (
    <div>
        <ProgressIndicator />
        <div className={classes.root}>
            <Header />
            <SideBar classes={classes} />

            <main className={classes.content}>
                <div className={classes.toolbar} />
                {children}
            </main>
        </div>
    </div>
);

export default withStyles(styles)(Layout);
