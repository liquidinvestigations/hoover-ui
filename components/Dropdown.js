import { Component } from 'react';

export default class Dropdown extends Component {
    render() {
        var id = 'dropdown-' + this.props.name;
        var defaultValue = this.props.default || this.props.values[0];
        return (
            <div>
                <label htmlFor={id}>{this.props.label}</label>{' '}
                <select
                    className="form-control custom-select custom-select-sm"
                    id={id}
                    name={this.props.name}
                    onChange={this.props.onChange}
                    defaultValue={this.props.value}>
                    {this.props.values.map(value => (
                        <option value={value} key={value}>
                            {value}
                        </option>
                    ))}
                </select>
            </div>
        );
    }
}
