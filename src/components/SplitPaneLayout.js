import SplitPane from 'react-split-pane';
import { withStyles } from '@material-ui/core/styles';

const styles = theme => ({
    left: {
        overflowX: 'hidden',
        overflowY: 'auto',
        height: 'auto',
    },
    right: {
        overflowX: 'hidden',
        overflowY: 'auto',
        height: 'auto',
    },
    middle: {
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
        overflow: 'hidden',
        height: '100vh',
        position: 'relative',
        backfaceVisibility: 'hidden',
        willChange: 'overflow',
    },
});

export default withStyles(styles)(({ left, children, right, classes }) => (
    <div className={classes.container}>
        <SplitPane
            split="vertical"
            defaultSize="20%"
            allowResize
            pane1ClassName={classes.left}>
            <div>
                <div className={classes.toolbar} />
                {left}
            </div>

            <SplitPane
                split="vertical"
                defaultSize="60%"
                allowResize
                pane1ClassName={classes.middle}
                pane2ClassName={classes.right}>
                <div>
                    <div className={classes.toolbar} />
                    {children}
                </div>

                <div>
                    <div className={classes.toolbar} />
                    {right}
                </div>
            </SplitPane>
        </SplitPane>
    </div>
));

