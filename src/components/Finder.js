import ReactFinder from './ReactFinder';
import api from '../api';
import url from 'url';
import last from 'lodash/last';
import { withRouter } from 'next/router';

class Finder extends React.Component {
    state = {};

    getBasePath() {
        const { url: docUrl } = this.props;
        return url.parse(url.resolve(docUrl, './')).pathname;
    }

    async componentDidMount() {
        const { data } = this.props;
        const basePath = this.getBasePath();

        this.setState({
            parent: await this.fetchParent(basePath, data),
        });
    }

    async fetchParent(basePath, data) {
        console.log(data);

        if (data.parent_id) {
            const parentUrl = `${basePath}${data.parent_id}`;
            console.log('fetching', parentUrl);
            return await api.doc(parentUrl);
        }
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
            this.props.router.push({ pathname: '/doc', query: { path: item.href } });
        }
    }

    urlFor(item) {
        return [this.getBasePath(), item.id].join('');
    }

    filenameFor(item) {
        if (item.filename) {
            return item.filename;
        } else {
            const { filename, path } = item.content;
            return filename || last(path.split('/').filter(Boolean)) || path;
        }
    }

    buildTree(root) {
        const { data } = this.props;
        const isCurrent = root && root.id == data.id;

        return {
            id: root ? root.id : null,
            label: root ? this.filenameFor(root) : 'Loading…',
            href: root ? this.urlFor(root) : null,
            children: root
                ? ((isCurrent ? data.children : root.children) || []).map(child =>
                      this.buildTree(child)
                  )
                : [],
        };
    }

    render() {
        const { parent } = this.state;
        const { data } = this.props;

        const tree = [this.buildTree(parent)];

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
