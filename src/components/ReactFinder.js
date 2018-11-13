import finderjs from 'finderjs';
import { PureComponent, createRef } from 'react';
import PropTypes from 'prop-types';

const generateKey = () => Math.random().toString(16);

// Replaces the existing finderjs React wrapper, which seems dead  https://github.com/AndcultureCode/react-finderjs/pull/2
export default class ReactFinder extends PureComponent {
    state = { key: generateKey() };

    static propTypes = {
        data: PropTypes.array.isRequired,
        value: PropTypes.object,
        autoScroll: PropTypes.bool,
        createItemContent: PropTypes.func,
        onLeafSelected: PropTypes.func,
        onItemSelected: PropTypes.func,
        onColumnCreated: PropTypes.func,
        onInteriorSelected: PropTypes.func,
        defaultValue: PropTypes.shape({
            id: PropTypes.any.isRequired,
        }),
    };

    container = createRef();

    componentDidMount() {
        this.setState({ key: generateKey() }, () => this.init());
    }

    componentDidUpdate(prevProps, prevState) {
        if (prevProps.data !== this.props.data) {
            this.setState({ key: generateKey() }, () => this.init());
        }
    }

    init() {
        const {
            data,
            className,
            createItemContent,
            defaultValue,
            onLeafSelected,
            onColumnCreated,
            onInteriorSelected,
            onItemSelected,
        } = this.props;

        this.finder = finderjs(this.container.current, data, {
            className,
            createItemContent,
        });

        if (this.props.autoScroll !== false) {
            this.finder.on('column-created', () => {
                const node = this.container.current;
                node.scrollLeft = node.scrollWidth - node.clientWidth;
            });
        }

        if (defaultValue) {
            this.selectDefault();
        }

        onLeafSelected && this.finder.on('leaf-selected', onLeafSelected);
        onItemSelected && this.finder.on('item-selected', onItemSelected);
        onInteriorSelected &&
            this.finder.on('interior-selected', onInteriorSelected);
        onColumnCreated && this.finder.on('column-created', onColumnCreated);
    }

    _getSelectedValuePath(value, data) {
        let result = [];

        if (data == undefined) {
            data = this.props.data;
        }

        let i = data.findIndex(e => e.id === value.id);
        if (i > -1) {
            result.push(i);
            return result;
        }

        data.some((e, i) => {
            if (e.children != undefined && e.children.length > 0) {
                let ci = this._getSelectedValuePath(value, e.children);
                if (ci.length > 0) {
                    result = result.concat([i], ci);
                    return true;
                }
                return false;
            }
        });

        return result;
    }

    selectDefault() {
        const path = this._getSelectedValuePath(this.props.defaultValue);

        let itemData = {
            children: this.props.data,
        };

        path.forEach((index, i) => {
            const cols = this.container.current.querySelectorAll('.fjs-col');
            const item = cols[i].querySelectorAll('li')[index];

            if (item != undefined) {
                itemData = itemData.children[index];
                item._item = itemData;
                this.finder.emit('item-selected', {
                    col: cols[i],
                    item: item,
                    container: this.container.current,
                });
            }
        });
    }

    render() {
        return <div ref={this.container} key={this.state.key} />;
    }
}
