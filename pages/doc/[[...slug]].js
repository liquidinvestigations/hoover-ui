import { Component, createRef } from 'react';
import { connect } from 'react-redux';
import { withStyles } from '@material-ui/core/styles';
import SplitPane from 'react-split-pane';

import { fetchDoc } from '../../src/actions';

import Document, { Meta } from '../../src/components/Document';
import Locations from '../../src/components/Locations';
import Finder from '../../src/components/Finder';
import SplitPaneLayout from '../../src/components/SplitPaneLayout';
import { parseLocation, copyMetadata } from '../../src/utils';
import HotKeys from '../../src/components/HotKeys';
import Typography from '@material-ui/core/Typography';

const styles = theme => ({
    container: theme.mixins.toolbar,
    finderSplitPane: {
        position: 'absolute',
        width: '100%',
        height: '100%',
    },
});

class Doc extends Component {
    state = { finder: false, printMode: false };

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
                this.props.dispatch(fetchDoc(pathname));
            }
        };

        const newState = {};

        if (query.finder && query.finder !== 'false') {
            newState.finder = true;
        }

        if (query.print && query.print !== 'false') {
            newState.printMode = true;
        }

        if (Object.keys(newState).length) {
            this.setState(newState, fetch);
        } else {
            fetch();
        }
    }

    componentDidUpdate(prevProps, prevState) {
        if (this.root.current && !this.state.finder) {
            this.root.current.focus();
        }

        if (this.state.printMode && this.props.data && !prevProps.data) {
            window.print();
        }
    }

    render() {
        const { data, url, collection, isFetching, error, classes } = this.props;
        const { finder, printMode } = this.state;

        if (!url) {
            return null;
        }

        if (error) {
            return (
                <Typography style={{ margin: '5rem 3rem' }} color="error">
                    {error.message.split('\n').map((e, i) => (
                        <p key={i}>{e}</p>
                    ))}
                </Typography>
            );
        }

        const doc = (
            <Document fullPage showToolbar={!printMode} showMeta={!printMode} />
        );
        const meta = <Meta doc={data} collection={collection} />;

        let content = null;

        if (finder) {
            content = (
                <div className={classes.finderSplitPane}>
                    <div className={classes.container} />
                    <SplitPane
                        split="horizontal"
                        defaultSize="25%"
                        style={{ position: 'relative' }}>
                        <div>
                            <Finder isFetching={isFetching} data={data} url={url} />
                        </div>

                        <SplitPaneLayout
                            container={false}
                            left={meta}
                            defaultSizeLeft="30%"
                            defaultSizeMiddle="70%">
                            {doc}
                        </SplitPaneLayout>
                    </SplitPane>
                </div>
            );
        } else if (printMode) {
            content = (
                <div>
                    <div className={classes.container} />
                    {doc}
                </div>
            );
        } else {
            // remove this branch when https://github.com/CRJI/EIC/issues/83 is done

            content = (
                <SplitPaneLayout
                    left={data && <Locations data={data} url={url} />}
                    defaultSizeLeft="25%">
                    {doc}
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
