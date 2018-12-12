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

export default withStyles(styles)(
    ({
        left,
        children,
        right,
        classes,
        defaultSizeLeft = '20%',
        defaultSizeMiddle = '60%',
        container = true,
    } = {}) => (
        <div className={container ? classes.container : null}>
            <SplitPane
                split="vertical"
                defaultSize={defaultSizeLeft}
                allowResize
                pane1ClassName={classes.left}
                pane2ClassName={right ? null : classes.middle}>
                <div>
                    <div className={container ? classes.toolbar : null} />
                    {left}
                </div>
                {right ? (
                    <SplitPane
                        split="vertical"
                        defaultSize={defaultSizeMiddle}
                        allowResize
                        pane1ClassName={classes.middle}
                        pane2ClassName={classes.right}>
                        <div>
                            <div className={container ? classes.toolbar : null} />
                            {children}
                        </div>

                        {right && (
                            <div>
                                <div
                                    className={container ? classes.toolbar : null}
                                />
                                {right}
                            </div>
                        )}
                    </SplitPane>
                ) : (
                    <div>
                        <div className={container ? classes.toolbar : null} />
                        {children}
                    </div>
                )}
            </SplitPane>
        </div>
    )
);
