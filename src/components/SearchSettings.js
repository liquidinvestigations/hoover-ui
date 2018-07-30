import { connect } from 'react-redux';
import Grid from '@material-ui/core/Grid';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import InputLabel from '@material-ui/core/InputLabel';
import { withStyles } from '@material-ui/core/styles';

import { SORT_OPTIONS, SIZE_OPTIONS } from '../constants';
import { setSearchSettingsSize, setSearchSettingsOrder } from '../actions';

const setSize = dispatch => event =>
    dispatch(setSearchSettingsSize(event.target.value));
const setOrder = dispatch => event =>
    dispatch(setSearchSettingsOrder(event.target.value));

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

                    <Select autoWidth value={order} onChange={setOrder}>
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
        settings: { size, order },
    },
}) => ({ size, order });

export default connect(mapStateToProps)(withStyles(styles)(SearchSettings));
