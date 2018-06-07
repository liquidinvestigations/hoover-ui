import { Component } from 'react';
import PropTypes from 'prop-types';
import Loading from './Loading';

class Checkbox extends Component {
    render() {
        const { name, checked, title, onChange } = this.props;
        return (
            <div className="checkbox">
                <label>
                    <input
                        type="checkbox"
                        id={`checkbox-${name}`}
                        checked={checked}
                        onChange={e => onChange(name, e.target.checked)}
                    />{' '}
                    {title}
                </label>
            </div>
        );
    }
}

export default class CollectionsBox extends Component {
    static propTypes = {
        collections: PropTypes.arrayOf(
            PropTypes.shape({
                name: PropTypes.string.isRequired,
                title: PropTypes.string.isRequired,
            })
        ),
        selected: PropTypes.arrayOf(PropTypes.string).isRequired,
        counts: PropTypes.object,
    };

    changeSelection(selected) {
        this.props.onChange(selected);
    }

    handleChange(name, checked) {
        var all = this.props.collections.map(c => c.name);
        var selected = this.props.selected.splice(0);

        if (checked) {
            selected = [].concat(selected, [name]);
        } else {
            selected = selected.filter(c => c != name);
        }

        this.changeSelection(selected);
    }

    renderCheckboxes() {
        const { collections, selected, counts } = this.props;

        let allCheckbox = null;

        if (collections.length > 1) {
            let allSelected = true;
            for (let col of collections) {
                if (selected.indexOf(col.name) < 0) {
                    allSelected = false;
                }
            }

            let selectAll = () => {
                let selected = [];
                if (allSelected) {
                    this.changeSelection([]);
                } else {
                    this.changeSelection(collections.map(col => col.name));
                }
            };

            allCheckbox = (
                <Checkbox
                    name={'_all_'}
                    title={<em>All</em>}
                    key={'_all_'}
                    checked={allSelected}
                    onChange={selectAll}
                />
            );
        }

        const collectionCheckboxes = collections.map(col => (
            <Checkbox
                name={col.name}
                title={col.title + (counts ? ` (${counts[col.name] || 0})` : '')}
                key={col.name}
                checked={selected.indexOf(col.name) > -1}
                onChange={this.handleChange.bind(this)}
            />
        ));

        return (
            <div>
                {allCheckbox}
                {collectionCheckboxes}
            </div>
        );
    }

    render() {
        var result = null;
        let { selected, collections } = this.props;

        if (collections) {
            if (collections.length) {
                result = this.renderCheckboxes();
            } else {
                result = <em>no collections available</em>;
            }
        } else {
            result = <Loading />;
        }

        return (
            <div className="collections-box">
                <small className="text-muted">Collections</small>
                <div>{result}</div>
            </div>
        );
    }
}
