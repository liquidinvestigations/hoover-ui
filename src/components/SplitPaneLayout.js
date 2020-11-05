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
    container: {
        overflow: 'hidden',
        height: 'calc(100vh - 56px)',
        position: 'relative',
        backfaceVisibility: 'hidden',
        willChange: 'overflow',

        '@media (min-width: 0px) and (orientation: landscape)': {
            height: 'calc(100vh - 48px)',
        },

        '@media (min-width: 600px)': {
            height: 'calc(100vh - 64px)',
        }
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
                            {children}
                        </div>

                        {right && (
                            <div>
                                {right}
                            </div>
                        )}
                    </SplitPane>
                ) : (
                    <div>
                        {children}
                    </div>
                )}
            </SplitPane>
        </div>
    )
);
