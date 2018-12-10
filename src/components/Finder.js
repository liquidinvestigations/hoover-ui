import { Component } from 'react';
import ReactFinder from './ReactFinder';
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

const buildTree = (leaf, url) => {
    const basePath = getBasePath(url);

    const createNode = item => {
        return {
            id: item.id,
            label: filenameFor(item),
            href: [basePath, item.id].join(''),
            parent: item.parent,
            children: [],
        };
    };

    let current = createNode(leaf);
    current.children = (leaf.children || []).map(createNode);

    while (current.parent) {
        const parentNode = createNode(current.parent);

        parentNode.children = (current.parent.children || []).map(child =>
            child.id === current.id ? current : createNode(child)
        );

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

        const tree = data ? buildTree(data, url) : [];

        return (
            <div className="finder">
                <div>
                    <ReactFinder
                        data={tree}
                        defaultValue={data}
                        onLeafSelected={this.handleLeafSelected}
                        onItemSelected={this.handleItemSelected}
                        onInteriorSelected={this.handleInteriorSelected}
                        onColumnCreated={this.handleColumnCreated}
                    />
                </div>
            </div>
        );
    }
}

export default withRouter(Finder);
