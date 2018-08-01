import { connect } from 'react-redux';
import Grid from '@material-ui/core/Grid';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import InputLabel from '@material-ui/core/InputLabel';
import { withStyles } from '@material-ui/core/styles';

import { SORT_OPTIONS, SIZE_OPTIONS } from '../constants';
import { updateSearchQuery } from '../actions';

const setSize = dispatch => event =>
    dispatch(
        updateSearchQuery({ size: event.target.value }, { resetPagination: true })
    );

const setOrder = dispatch => event =>
    dispatch(
        updateSearchQuery({ order: event.target.value }, { resetPagination: true })
    );

const styles = theme => ({
    root: {
        marginTop: theme.spacing.unit * 3,
    },
});

const SearchSettings = ({ size, order, dispatch, classes }) => (
    <div className={classes.root}>
        <Grid container justify="space-between">
            <Grid item sm={6}>
                <FormControl style={{ minWidth: 120 }}>
                    <InputLabel>Results per page</InputLabel>

                    <Select autoWidth value={size} onChange={setSize(dispatch)}>
                        {SIZE_OPTIONS.map(s => (
                            <MenuItem key={s} value={s}>
                                {s}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
            </Grid>

            <Grid item>
                <FormControl style={{ minWidth: 120 }}>
                    <InputLabel>Order</InputLabel>

                    <Select autoWidth value={order} onChange={setOrder(dispatch)}>
                        {SORT_OPTIONS.map(s => (
                            <MenuItem key={s} value={s}>
                                {s}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
            </Grid>
        </Grid>
    </div>
);

const mapStateToProps = ({
    search: {
        query: { size, order },
    },
}) => ({ size, order });

export default connect(mapStateToProps)(withStyles(styles)(SearchSettings));
