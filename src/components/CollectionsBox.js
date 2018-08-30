import Checkbox from '@material-ui/core/Checkbox';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import FormGroup from '@material-ui/core/FormGroup';
import ListItem from '@material-ui/core/ListItem';
import { withStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import PropTypes from 'prop-types';
import { Component } from 'react';
import { connect } from 'react-redux';
import { setCollectionsSelection } from '../actions';
import Loading from './Loading';
import { formatThousands } from '../utils';

const styles = theme => ({
    root: {
        display: 'flex',
    },
    formControlLabel: {
        width: '100%',
    },
});

export class CollectionsBox extends Component {
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
        this.props.dispatch(setCollectionsSelection(selected));
    }

    handleChange = event => {
        const name = event.target.name;
        const checked = event.target.checked;

        var selected = this.props.selected.splice(0);

        if (checked) {
            selected = [].concat(selected, [name]);
        } else {
            selected = selected.filter(c => c != name);
        }

        this.changeSelection(selected);
    };

    renderCheckboxes() {
        const { collections, selected, counts, classes } = this.props;

        let allCheckbox = null;

        if (collections.length > 1) {
            const allSelected = collections.every(c => selected.includes(c.name));

            allCheckbox = (
                <FormControlLabel
                    className={classes.formControlLabel}
                    control={
                        <Checkbox
                            key={'_all_'}
                            checked={allSelected}
                            onChange={() =>
                                allSelected
                                    ? this.changeSelection([])
                                    : this.changeSelection(
                                          collections.map(c => c.name)
                                      )
                            }
                            value="_all_"
                        />
                    }
                    label="All"
                />
            );
        }

        const collectionCheckboxes = collections.map(col => (
            <FormControlLabel
                className={classes.formControlLabel}
                key={col.name}
                control={
                    <Checkbox
                        key={col.name}
                        name={col.name}
                        checked={selected.includes(col.name)}
                        onChange={this.handleChange}
                        value="_all_"
                    />
                }
                label={
                    col.title +
                    (counts && counts[col.name]
                        ? ` (${formatThousands(counts[col.name])})`
                        : '')
                }
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
        let result;

        const {
            selected,
            collections,
            classes,
            isFetching,
            wasFetched,
        } = this.props;

        if (collections) {
            if (collections.length) {
                result = this.renderCheckboxes();
            } else {
                result =
                    isFetching || !wasFetched ? null : (
                        <Typography>no collections available</Typography>
                    );
            }
        } else {
            result = <Loading />;
        }

        return (
            <ListItem>
                <FormGroup>{result}</FormGroup>
            </ListItem>
        );
    }
}

const mapStateToProps = ({
    collections: { isFetching, items, selected, counts, wasFetched },
}) => ({
    isFetching,
    collections: items,
    selected,
    counts,
});

export default connect(mapStateToProps)(withStyles(styles)(CollectionsBox));
