import Head from 'next/head';
import Header from './Header';
import SideBar from './SideBar';
import PreviewDrawer from './PreviewDrawer';
import ProgressIndicator from './ProgressIndicator';
import { withStyles } from '@material-ui/core/styles';

const styles = theme => ({
    root: {
        flexGrow: 1,
        zIndex: 1,
        // overflow: 'hidden',
        position: 'relative',
        display: 'flex',
        marginBottom: '1rem',
    },
    drawerPaper: {
        position: 'relative',
        minHeight: '100vh',
        height: '100%',
        // top: 0,
        // overflow: 'auto',
    },
    filterDrawer: {
        minWidth: 280,
        maxWidth: '20%',
    },
    previewDrawer: {
        position: 'relative',
        minWidth: 280,
        width: '40%',
        height: '100%',
        minHeight: '100vh',
    },
    previewContent: {
        position: 'relative',
    },
    sideBarFormControl: {
        margin: theme.spacing.unit * 3,
        display: 'block',
    },
    content: {
        flexGrow: 1,
        backgroundColor: theme.palette.background.default,
        paddingLeft: theme.spacing.unit * 3,
        paddingRight: theme.spacing.unit * 3,
        minWidth: 0, // So the Typography noWrap works
    },
    toolbar: theme.mixins.toolbar,
});

const Layout = ({ children, classes }) => (
    <div>
        <ProgressIndicator type="linear" />
        <div className={classes.root}>
            <Header />

            <SideBar classes={classes} />

            <main className={classes.content}>
                <div className={classes.toolbar} />
                {children}
            </main>

            <PreviewDrawer classes={classes} />
        </div>
    </div>
);

export default withStyles(styles)(Layout);
