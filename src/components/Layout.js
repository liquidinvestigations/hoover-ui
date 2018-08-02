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
        overflow: 'hidden',
        position: 'relative',
        display: 'flex',
    },
    drawerPaper: {
        position: 'relative',
        height: '100%',
        minHeight: '100vh',
    },
    filterDrawer: {
        minWidth: 280,
        maxWidth: '20%',
    },
    previewDrawer: {
        minWidth: 280,
        width: '35%',
    },
    sideBarFormControl: {
        margin: theme.spacing.unit * 3,
        display: 'block',
    },
    sticky: {
        position: 'sticky',
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

            <PreviewDrawer classes={classes} />
        </div>
    </div>
);

export default withStyles(styles)(Layout);
