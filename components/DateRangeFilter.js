import { Component } from 'react';
import PropTypes from 'prop-types';
import { DateTime } from 'luxon';
import DayPickerInput from 'react-day-picker/DayPickerInput';

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

// https://react-day-picker.js.org/examples/input-from-to

export default class DateRangeFilter extends Component {
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
        const { defaultFrom, defaultTo } = this.props;

        const modifiers = { start: from, end: to };
        const unedited = defaultFrom === from && defaultTo === to;

        return (
            <div className="date-range-filter">
                <div className="reset">
                    {(from || to) && (
                        <a href="#" onClick={this.handleReset}>
                            Reset
                        </a>
                    )}
                </div>
                <DayPickerInput
                    value={from}
                    placeholder="From"
                    format={DATE_FORMAT}
                    formatDate={formatDate}
                    parseDate={parseDate}
                    dayPickerProps={{
                        selectedDays: [from, { from, to }],
                        disabledDays: { after: to },
                        toMonth: to,
                        modifiers,
                        numberOfMonths: 2,
                        onDayClick: () => this.to.getInput().focus(),
                    }}
                    onDayChange={this.handleFromChange}
                />
                <DayPickerInput
                    ref={el => (this.to = el)}
                    value={to}
                    placeholder="To"
                    format={DATE_FORMAT}
                    formatDate={formatDate}
                    parseDate={parseDate}
                    dayPickerProps={{
                        selectedDays: [from, { from, to }],
                        disabledDays: { before: from },
                        modifiers,
                        month: from,
                        fromMonth: from,
                        numberOfMonths: 2,
                    }}
                    onDayChange={this.handleToChange}
                />

                <div className="text-right">
                    <button
                        className="btn btn-secondary btn-sm"
                        disabled={unedited}
                        onClick={this.handleSubmit}>
                        Apply
                    </button>
                </div>
            </div>
        );
    }
}
