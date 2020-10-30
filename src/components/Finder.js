import { Component } from 'react';
import ReactFinder from './ReactFinder';
import ErrorBoundary from './ErrorBoundary';
import last from 'lodash/last';
import { withRouter } from 'next/router';
import { getBasePath, getIconImageElement } from '../utils';

const filenameFor = item => {
    if (item.filename) {
        return item.filename;
    } else {
        const { filename, path } = item.content;
        return filename || last(path.split('/').filter(Boolean)) || path || '/';
    }
};

const buildTree = (leaf, basePath) => {
    const nodesById = {};

    const createNode = item => {
        const id = (item.file || item.id);
        let fileType = item.filetype;

        if (!fileType && item.content) {
            fileType = item.content.filetype;
        }

        const node = (nodesById[item.id] = nodesById[item.id] || {
            id,
            digest: item.digest,
            file: item.file,
            label: filenameFor(item),
            fileType,
            href: [basePath, id].join(''),
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

    handleCreateItemContent = (config, item) => {
        const label = document.createElement('span');
        label.appendChild(document.createTextNode(item.label));
        label.className = 'tree-view-label';

        const icon = getIconImageElement(item.filetype);

        const fragment = document.createDocumentFragment();
        fragment.appendChild(icon);
        fragment.appendChild(label);

        return fragment;
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
            this.props.router.push(
                item.href,
                undefined,
                {shallow: true},
            );
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
                        createItemContent={this.handleCreateItemContent}
                    />
                </ErrorBoundary>
            </div>
        );
    }
}

export default withRouter(Finder);
