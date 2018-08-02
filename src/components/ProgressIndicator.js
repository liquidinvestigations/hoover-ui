import { connect } from 'react-redux';
import LinearProgress from '@material-ui/core/LinearProgress';
import { withStyles } from '@material-ui/core/styles';

const styles = theme => ({
    root: {
        position: 'fixed',
        top: 0,
        height: '5px',
        width: '100%',
        zIndex: theme.zIndex.appBar + 1,
    },
});

const ProgressIndicator = withStyles(styles)(({ classes, isFetching }) => (
    <div className={classes.root}>
        {isFetching && <LinearProgress color="secondary" />}
    </div>
));

export default connect(
    ({
        search: { isFetching: searchFetching },
        collections: { isFetching: collectionsFetching },
        preview: { isFetching: previewFetching },
    }) => ({ isFetching: searchFetching || collectionsFetching || previewFetching })
)(ProgressIndicator);
