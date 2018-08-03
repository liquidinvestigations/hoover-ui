import Head from 'next/head';
import Header from './Header';
import SideBar from './SideBar';
import PreviewDrawer from './PreviewDrawer';
import ProgressIndicator from './ProgressIndicator';
import { withStyles } from '@material-ui/core/styles';

const styles = theme => ({
    root: {
        // flexGrow: 1,
        zIndex: 1,
        // // overflow: 'hidden',
        // position: 'relative',
        // display: 'flex',
        // marginBottom: '1rem',
    },
    leftDrawerPaper: {
        position: 'relative',
        zIndex: 0,
        // minHeight: '100vh',
        // height: '100%',
    },
    rightDrawerPaper: {
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
    rightContent: {
        // position: 'relative',
    },
    sideBarFormControl: {
        margin: theme.spacing.unit * 3,
        display: 'block',
    },
    middle: {
        flex: 1,
        //     flexGrow: 1,
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

const Layout = ({ children, classes }) => (
    <div>
        <ProgressIndicator type="linear" />
        <div className={classes.root}>
            <Header />

            <div className={classes.container}>
                <SideBar classes={classes} />

                <main className={classes.middle}>
                    <div className={classes.toolbar} />
                    {children}
                </main>

                <PreviewDrawer classes={classes} />
            </div>
        </div>
    </div>
);

export default withStyles(styles)(Layout);
