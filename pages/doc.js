import { Component, createRef } from 'react';
import { connect } from 'react-redux';
import { withStyles } from '@material-ui/core/styles';
import SplitPane from 'react-split-pane';

import { fetchDoc, fetchServerDoc } from '../src/actions';

import Document, { Meta } from '../src/components/Document';
import Locations from '../src/components/Locations';
import Finder from '../src/components/Finder';
import SplitPaneLayout from '../src/components/SplitPaneLayout';
import { parseLocation, copyMetadata } from '../src/utils';
import HotKeys from '../src/components/HotKeys';

const styles = theme => ({
    container: theme.mixins.toolbar,
});

class Doc extends Component {
    state = { finder: false };

    keys = [
        {
            name: 'copyMetadata',
            key: 'c',
            help: 'Copy MD5 and path to clipboard',
            handler: (e, showMessage) => {
                if (this.props.data && this.props.data.content) {
                    showMessage(copyMetadata(this.props.data));
                }
            },
        },
    ];

    root = createRef();

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

    componentDidUpdate() {
        if (this.root.current && !this.state.finder) {
            this.root.current.focus();
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

        let content = null;

        if (finder) {
            content = (
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
            );
        } else {
            // remove this branch when https://github.com/CRJI/EIC/issues/83 is done

            content = (
                <SplitPaneLayout
                    left={data && <Locations data={data} url={url} />}
                    right={doc}
                    defaultSizeLeft={'25%'}
                    defaultSizeMiddle={'70%'}>
                    {meta}
                </SplitPaneLayout>
            );
        }

        return (
            <HotKeys keys={this.keys} focused>
                <div ref={this.root} tabIndex="-1">
                    {content}
                </div>
            </HotKeys>
        );
    }
}

export default connect(({ doc: { isFetching, data, url, collection, error } }) => ({
    isFetching,
    data,
    url,
    collection,
    error,
}))(withStyles(styles)(Doc));
