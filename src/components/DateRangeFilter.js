import { Component } from 'react';
import PropTypes from 'prop-types';
import { DateTime } from 'luxon';
import TextField from '@material-ui/core/TextField';
import Grid from '@material-ui/core/Grid';
import Button from '@material-ui/core/Button';
import { withStyles } from '@material-ui/core/styles';

const DATE_FORMAT = 'yyyy-MM-dd';

const parseDate = (str, format, locale) => {
    const d = DateTime.fromFormat(str, format).setLocale(locale);

    if (d.isValid) {
        return d.toJSDate();
    }
};

const formatDate = (date, format, locale) => {
    return date
        ? DateTime.fromJSDate(date)
              .setLocale(locale)
              .toFormat(format)
        : 'Invalid date';
};

const dateType = (props, propName, componentName) => {
    if (props[propName] && !parseDate(props[propName], DATE_FORMAT)) {
        return new Error(
            `date given to ${componentName} for prop ${propName} is invalid, expected ${DATE_FORMAT}, got ${
                props[propName]
            }`
        );
    }
};

const styles = theme => ({
    textField: {
        marginLeft: theme.spacing.unit,
        marginRight: theme.spacing.unit,
        width: 200,
    },
});

class DateRangeFilter extends Component {
    static propTypes = {
        onChange: PropTypes.func.isRequired,
        defaultFrom: dateType,
        defaultTo: dateType,
    };

    state = {};

    constructor(props) {
        super(props);

        this.state.from = props.defaultFrom
            ? parseDate(props.defaultFrom, DATE_FORMAT)
            : null;
        this.state.to = props.defaultTo
            ? parseDate(props.defaultTo, DATE_FORMAT)
            : null;
    }

    showFromMonth() {
        const { from, to } = this.state;

        if (!from) {
            return;
        }
        if (DateTime.fromISO(to).diff(DateTime.fromISO(from), 'months') < 2) {
            this.to.getDayPicker().showMonth(from);
        }
    }

    handleFromChange = from => this.setState({ from });
    handleToChange = to => this.setState({ to }, this.showFromMonth);
    handleSubmit = () =>
        this.props.onChange({
            from: formatDate(this.state.from, DATE_FORMAT),
            to: formatDate(this.state.to, DATE_FORMAT),
        });

    handleReset = e => {
        e.preventDefault();

        this.setState({ from: null, to: null }, () =>
            this.props.onChange({ from: null, to: null })
        );
    };

    render() {
        const { from, to } = this.state;
        const { defaultFrom, defaultTo, classes } = this.props;

        const modifiers = { start: from, end: to };
        const unedited = defaultFrom === from && defaultTo === to;

        return (
            <Grid container direction="column">
                <div className="reset">
                    {(from || to) && (
                        <a href="#" onClick={this.handleReset}>
                            Reset
                        </a>
                    )}
                </div>

                <TextField
                    id="date"
                    label="From"
                    type="date"
                    value={from || ''}
                    defaultValue={defaultFrom}
                    className={classes.textField}
                    fullWidth
                    InputLabelProps={{
                        shrink: true,
                    }}
                />

                <TextField
                    id="date"
                    label="To"
                    type="date"
                    value={to || ''}
                    defaultValue={defaultTo}
                    className={classes.textField}
                    fullWidth
                    InputLabelProps={{
                        shrink: true,
                    }}
                />

                <Button size="small" disabled={unedited} onClick={this.handleSubmit}>
                    Apply
                </Button>
            </Grid>
        );
    }
}

export default withStyles(styles)(DateRangeFilter);
