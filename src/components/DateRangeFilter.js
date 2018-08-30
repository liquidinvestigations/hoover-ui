import { Component } from 'react';
import PropTypes from 'prop-types';

import { DateTime } from 'luxon';

import TextField from '@material-ui/core/TextField';
import Grid from '@material-ui/core/Grid';
import Button from '@material-ui/core/Button';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import { withStyles } from '@material-ui/core/styles';

import IconArrowLeft from '@material-ui/icons/ArrowLeft';
import IconArrowRight from '@material-ui/icons/ArrowRight';
import IconEvent from '@material-ui/icons/Event';

import DatePicker from 'material-ui-pickers/DatePicker';

const styles = theme => ({
    textField: {
        marginLeft: theme.spacing.unit,
        marginRight: theme.spacing.unit,
        width: 200,
    },
});

const DATE_FORMAT = 'yyyy-MM-dd';

const dateType = (props, propName, componentName) => {
    if (props[propName] && !(props[propName] instanceof DateTime)) {
        return new Error(
            `date given to ${componentName} for prop ${propName} is invalid, expected instance of luxon.DateTime, got ${typeof props[
                propName
            ]}`
        );
    }
};

class DateRangeFilter extends Component {
    static propTypes = {
        onChange: PropTypes.func.isRequired,
        defaultFrom: PropTypes.instanceOf(DateTime),
        defaultTo: PropTypes.instanceOf(DateTime),
    };

    state = { from: null, to: null };

    handleFromChange = date => this.setState({ from: date });
    handleToChange = date => this.setState({ to: date });

    handleApply = () => this.props.onChange({ ...this.state });
    handleReset = () => this.props.onChange({ from: null, to: null });

    constructor(props) {
        super(props);

        this.state = { from: this.props.defaultFrom, to: this.props.defaultTo };
    }

    render() {
        const { defaultFrom, defaultTo, classes } = this.props;
        const { from, to } = this.state;

        const icons = {
            leftArrowIcon: <IconArrowLeft />,
            rightArrowIcon: <IconArrowRight />,
            keyboardIcon: <IconEvent />,
        };

        const unedited =
            defaultFrom &&
            defaultTo &&
            (defaultFrom.equals(from) && defaultTo.equals(to));

        return (
            <List>
                <ListItem>
                    <DatePicker
                        value={from}
                        format={DATE_FORMAT}
                        onChange={this.handleFromChange}
                        maxDate={to}
                        openToYearSelection
                        autoOk
                        keyboard
                        fullWidth
                        {...icons}
                    />
                </ListItem>

                <ListItem>
                    <DatePicker
                        value={to}
                        format={DATE_FORMAT}
                        minDate={from}
                        onChange={this.handleToChange}
                        openToYearSelection
                        autoOk
                        keyboard
                        fullWidth
                        {...icons}
                    />
                </ListItem>

                <ListItem>
                    <Grid container alignItems="center" justify="space-between">
                        <Grid item>
                            <Button
                                size="small"
                                onClick={this.handleReset}
                                disabled={!from && !to}>
                                Reset
                            </Button>
                        </Grid>
                        <Grid item>
                            <Button
                                size="small"
                                onClick={this.handleApply}
                                disabled={unedited}>
                                Apply
                            </Button>
                        </Grid>
                    </Grid>
                </ListItem>
            </List>
        );
    }
}

export default withStyles(styles)(DateRangeFilter);
