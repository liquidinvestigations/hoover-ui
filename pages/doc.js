import { Component } from 'react';
import { connect } from 'react-redux';
import { withStyles } from '@material-ui/core/styles';
import SplitPane from 'react-split-pane';

import { fetchDoc, fetchServerDoc } from '../src/actions';

import Document, { Meta } from '../src/components/Document';
import Locations from '../src/components/Locations';
import Finder from '../src/components/Finder';
import SplitPaneLayout from '../src/components/SplitPaneLayout';
import { parseLocation } from '../src/utils';
import { Typography } from '@material-ui/core';

const styles = theme => ({
    container: theme.mixins.toolbar,
});

class Doc extends Component {
    state = { finder: false };

    componentDidMount() {
        const { query, pathname } = parseLocation();

        const fetch = () => {
            if (query.path) {
                this.props.dispatch(
                    fetchDoc(query.path, {
                        includeParents: this.state.finder,
                    })
                );
            } else if (this.state.finder) {
                this.props.dispatch(fetchDoc(pathname, { includeParents: true }));
            } else {
                this.props.dispatch(fetchServerDoc());
            }
        };

        if (query.finder && query.finder !== 'false') {
            this.setState({ finder: true }, fetch);
        } else {
            fetch();
        }
    }

    render() {
        const { data, url, collection, isFetching, error, classes } = this.props;
        const { finder } = this.state;

        if (!url) {
            return null;
        }

        if (error) {
            return (
                <Typography style={{ margin: '5rem 2rem' }}>
                    {error.message}
                </Typography>
            );
        }

        const doc = <Document fullPage />;
        const meta = <Meta doc={data} collection={collection} />;

        if (finder) {
            return (
                <div>
                    <SplitPane split="horizontal" defaultSize="25%">
                        <div>
                            <div className={classes.container} />
                            <Finder isFetching={isFetching} data={data} url={url} />
                        </div>

                        <SplitPaneLayout
                            container={false}
                            left={meta}
                            defaultSizeLeft={'30%'}
                            defaultSizeMiddle={'70%'}>
                            {doc}
                        </SplitPaneLayout>
                    </SplitPane>
                </div>
            );
        } else {
            // remove this branch when https://github.com/CRJI/EIC/issues/83 is done

            return (
                <SplitPaneLayout
                    left={data && <Locations data={data} url={url} />}
                    right={doc}
                    defaultSizeLeft={'25%'}
                    defaultSizeMiddle={'70%'}>
                    {meta}
                </SplitPaneLayout>
            );
        }
    }
}

export default connect(({ doc: { isFetching, data, url, collection, error } }) => ({
    isFetching,
    data,
    url,
    collection,
    error,
}))(withStyles(styles)(Doc));
