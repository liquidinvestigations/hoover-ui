import React from 'react'

class Dropdown extends React.Component {
  render() {
    var id = "dropdown-" + this.props.name
    var defaultValue = this.props.default || this.props.values[0]
    return (
      <div>
        <label htmlFor={id}>{this.props.label}</label>{' '}
        <select
          className="form-control"
          id={id}
          name={this.props.name}
          onChange={this.props.onChanged}
          defaultValue={this.props.value}>
          {this.props.values.map((value) =>
            <option value={value} key={value}>{value}</option>
          )}
        </select>
      </div>
    )
  }
}

export default Dropdown
