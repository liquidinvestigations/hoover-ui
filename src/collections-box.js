import React from 'react'

class Checkbox extends React.Component {
  render() {
    let {name, checked, title, onChange} = this.props
    var id = "checkbox-" + name
    return (
      <div className="checkbox">
        <label>
          <input
            type="checkbox"
            id={id}
            checked={checked}
            onChange={(e) => {
              onChange(name, e.target.checked)
            }}></input>
          {' '}
          {title}
        </label>
      </div>
    )
  }
}

class CollectionsBox extends React.Component {
  constructor(props) {
    super(props)
    this.state = {selected: props.selected}
  }

  componentWillReceiveProps({selected}) {
    this.setState({selected})
  }

  handleChange(name, checked) {
    var all = this.props.collections.map((c) => c.name)
    var selected = this.state.selected.splice(0)
    if (checked) {
      selected = [].concat(selected, [name])
    } else {
      selected = selected.filter((c) => c != name)
    }

    this.setState({selected})
    this.props.onChange(selected)
  }

  render() {
    var result = null
    let {selected, collections} = this.props
    if(collections) {
      if(collections.length) {
        result = collections.map((col) =>
          <Checkbox
            name={col.name}
            title={col.title}
            key={col.name}
            checked={selected.indexOf(col.name) > -1}
            onChange={this.handleChange.bind(this)}/>
        )
      } else {
        result = <em>none available</em>
      }
    } else {
      result = <em>loading collections ...</em>
    }

    return <div id="collections-box">{result}</div>
  }
}

export default CollectionsBox
