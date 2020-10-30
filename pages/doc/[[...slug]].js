import React, { Component, createRef } from 'react';
import { connect } from 'react-redux';
import URL from 'url';
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
    state = { printMode: false };

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
                        includeParents: true,
                    })
                );
            } else {
                this.props.dispatch(fetchDoc(pathname, { includeParents: true }));
            }
        };

        const newState = {};

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
        if (this.state.printMode && this.props.data && !prevProps.data) {
            window.print();
        }
    }

    render() {
        const { data, url, collection, isFetching, error, classes } = this.props;
        const { printMode } = this.state;

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

        let digestUrl = url;
        let urlIsSha = false;

        // Ugly and unstable
        const digest = data && (data.digest || data.id[0] !== '_' && data.id);
        if (digest) {
            digestUrl = URL.resolve(url, './');
            digestUrl += digest;
            urlIsSha = (url === digestUrl);
        }

        const doc = (
            <Document
                fullPage
                showMeta
                showToolbar={!printMode}
            />
        );

        const finder = (
            <Finder
                isFetching={isFetching}
                data={data}
                url={url}
            />
        );

        const infoPane = (
            <SplitPaneLayout
                container={false}
                left={digest && <Locations data={data} url={digestUrl} />}
                defaultSizeLeft="25%"
                defaultSizeMiddle="70%">
                {doc}
            </SplitPaneLayout>
        );

        let content = null;

        if (printMode) {
            content = (
                <div>
                    <div className={classes.container} />
                    {doc}
                </div>
            );
        } else {
            content = (
                <div className={classes.finderSplitPane}>
                    <div className={classes.container} />
                    {!urlIsSha ?
                        <SplitPane
                            split="horizontal"
                            defaultSize="30%"
                            style={{ position: 'relative' }}>
                            {finder}
                            {infoPane}
                        </SplitPane>
                        :
                        infoPane
                    }
                </div>
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
