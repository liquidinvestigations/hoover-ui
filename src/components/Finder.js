import { Component } from 'react';
import ReactFinder from './ReactFinder';
import ErrorBoundary from './ErrorBoundary';
import last from 'lodash/last';
import { withRouter } from 'next/router';
import { getBasePath } from '../utils';

const filenameFor = item => {
    if (item.filename) {
        return item.filename;
    } else {
        const { filename, path } = item.content;
        return filename || last(path.split('/').filter(Boolean)) || path || item.id;
    }
};

const buildTree = (leaf, basePath) => {
    const nodesById = {};

    const createNode = item => {
        const node = (nodesById[item.id] = nodesById[item.id] || {
            id: item.id,
            label: filenameFor(item),
            href: [basePath, item.id].join(''),
            parent: item.parent ? createNode(item.parent) : null,
            children: item.children ? item.children.map(createNode) : null,
        });

        return node;
    };

    let current = createNode(leaf);

    while (current.parent) {
        const parentNode = current.parent;

        parentNode.children = parentNode.children
            ? parentNode.children.map(child => nodesById[child.id] || child)
            : null;

        current = parentNode;
    }

    return [current];
};

class Finder extends Component {
    shouldComponentUpdate(nextProps, nextState) {
        return !nextProps.isFetching;
    }

    handleColumnCreated = (...args) => console.log('column-created', ...args);

    handleLeafSelected = item => {
        console.log('leaf-selected', item);

        this.navigateTo(item);
    };

    handleItemSelected = item => {
        console.log('item-selected', item);
    };

    handleInteriorSelected = item => {
        console.log('interior-selected', item);
        this.navigateTo(item);
    };

    navigateTo(item) {
        if (item.href) {
            this.props.router.push({
                pathname: '/doc',
                query: { path: item.href },
            });
        }
    }

    render() {
        const { data, url } = this.props;

        const tree = data ? buildTree(data, getBasePath(url)) : [];

        return (
            <div className="finder">
                <ErrorBoundary visible>
                    <ReactFinder
                        data={tree}
                        defaultValue={data}
                        onLeafSelected={this.handleLeafSelected}
                        onItemSelected={this.handleItemSelected}
                        onInteriorSelected={this.handleInteriorSelected}
                        onColumnCreated={this.handleColumnCreated}
                    />
                </ErrorBoundary>
            </div>
        );
    }
}

export default withRouter(Finder);
