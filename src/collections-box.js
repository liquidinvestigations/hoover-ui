import React from 'react'

class Checkbox extends React.Component {
  constructor(props) {
    super(props)
    this.state = {checked: props.checked}
  }

  render() {
    let {name, title, onChange} = this.props
    let {checked} = this.state
    var id = "checkbox-" + name
    return (
      <div className="checkbox">
        <label>
          <input
            type="checkbox"
            id={id}
            checked={checked}
            onChange={(e) => {
              this.setState({checked: e.target.checked})
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
      selected.push(name)
    } else {
      selected = selected.filter((c) => c != name)
    }

    this.setState({selected})
    this.props.onChange(selected)
  }

  render() {
    var result = null
    let {collections} = this.props
    if(collections) {
      if(collections.length) {
        result = collections.map((col) =>
          <Checkbox
            name={col.name}
            title={col.title}
            key={col.name}
            checked={true}
            onChange={this.handleChange.bind(this)}/>
        )
      } else {
        result = <em>none available</em>
      }
    } else {
      result = <em>loading collections ...</em>
    }

    return <div id="collections-box" className="col-sm-2">{result}</div>
  }
}

export default CollectionsBox
