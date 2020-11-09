import React, { Component, createRef } from 'react';
import { connect } from 'react-redux';
import URL from 'url';
import path from 'path';
import { withStyles } from '@material-ui/core/styles';
import SplitPane from 'react-split-pane';

import { fetchDoc } from '../../src/actions';

import Document  from '../../src/components/document/Document';
import Locations from '../../src/components/Locations';
import Finder from '../../src/components/Finder';
import SplitPaneLayout from '../../src/components/SplitPaneLayout';
import { parseLocation, copyMetadata } from '../../src/utils';
import HotKeys from '../../src/components/HotKeys';
import Typography from '@material-ui/core/Typography';

const styles = theme => ({
    finderSplitPane: {
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
    horizontalSplitPane: {
        overflowX: 'hidden',
        overflowY: 'auto',
        height: 'auto',
    }
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
            let path = pathname;
            if (query.path) {
                path = query.path;
            }
            this.props.dispatch(fetchDoc(path, { includeParents: true }));
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
            window.setTimeout(window.print);
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

        let digest = data?.id;
        let digestUrl = url;
        let urlIsSha = true;

        if (data?.id.startsWith('_file_')) {
            digest = data.digest;
            digestUrl = path.join(URL.resolve(url, './'), digest);
            urlIsSha = false;
        }

        if (data?.id.startsWith('_directory_')) {
            digest = null;
            urlIsSha = false;
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
            !!digest ?
                <SplitPaneLayout
                    container={false}
                    left={<Locations data={data} url={digestUrl}/>}
                    defaultSizeLeft="25%"
                    defaultSizeMiddle="70%">
                    {doc}
                </SplitPaneLayout>
                :
                doc
        );

        let content = null;

        if (printMode) {
            content = (
                <div>
                    {doc}
                </div>
            );
        } else {
            content = (
                <div className={classes.finderSplitPane}>
                    {!urlIsSha ?
                        <SplitPane
                            split="horizontal"
                            defaultSize="30%"
                            style={{ position: 'relative' }}
                            pane1ClassName={classes.horizontalSplitPane}
                            pane2ClassName={classes.horizontalSplitPane}>
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
