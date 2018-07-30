import { Component } from 'react';
import PropTypes from 'prop-types';
import Loading from './Loading';

import { withStyles } from '@material-ui/core/styles';
import FormControl from '@material-ui/core/FormControl';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import FormLabel from '@material-ui/core/FormLabel';
import FormGroup from '@material-ui/core/FormGroup';
import Checkbox from '@material-ui/core/Checkbox';

const styles = theme => ({
    root: {
        display: 'flex',
    },
    formControl: {
        margin: theme.spacing.unit * 3,
    },
});

class CollectionsBox extends Component {
    static propTypes = {
        classes: PropTypes.object.isRequired,
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

    handleChange = event => {
        const name = event.target.name;
        const checked = event.target.checked;

        var all = this.props.collections.map(c => c.name);
        var selected = this.props.selected.splice(0);

        if (checked) {
            selected = [].concat(selected, [name]);
        } else {
            selected = selected.filter(c => c != name);
        }

        this.changeSelection(selected);
    };

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
                <FormControlLabel
                    control={
                        <Checkbox
                            key={'_all_'}
                            checked={allSelected}
                            onChange={selectAll}
                            value="_all_"
                        />
                    }
                    label="All"
                />
            );
        }

        const collectionCheckboxes = collections.map(col => (
            <FormControlLabel
                key={col.name}
                control={
                    <Checkbox
                        key={col.name}
                        name={col.name}
                        checked={selected.indexOf(col.name) > -1}
                        onChange={this.handleChange}
                        value="_all_"
                    />
                }
                label={col.title + (counts ? ` (${counts[col.name] || 0})` : '')}
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
        let { selected, collections, classes } = this.props;

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
            <div className={classes.root}>
                <FormControl component="fieldset" className={classes.formControl}>
                    <FormLabel component="legend">Collections</FormLabel>
                    <FormGroup>{result}</FormGroup>
                </FormControl>
            </div>
        );
    }
}

export default withStyles(styles)(CollectionsBox);
