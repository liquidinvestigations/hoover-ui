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

  changeSelection(selected) {
    this.setState({selected})
    this.props.onChange(selected)
  }

  handleChange(name, checked) {
    var all = this.props.collections.map((c) => c.name)
    var selected = this.state.selected.splice(0)
    if (checked) {
      selected = [].concat(selected, [name])
    } else {
      selected = selected.filter((c) => c != name)
    }

    this.changeSelection(selected)
  }

  renderCheckboxes(collections, selected) {
    let allCheckbox = null
    if(collections.length > 1) {
      let allSelected = true
      for(let col of collections) {
        if(selected.indexOf(col.name) < 0) {
          allSelected = false
        }
      }

      let selectAll = () => {
        let selected = []
        if(allSelected) {
          this.changeSelection([])
        }
        else {
          this.changeSelection(collections.map((col) => col.name))
        }
      }

      allCheckbox = (
        <Checkbox
          name={'_all_'}
          title={<em>all</em>}
          key={'_all_'}
          checked={allSelected}
          onChange={selectAll}/>
      )
    }

    let collectionCheckboxes = collections.map((col) =>
      <Checkbox
        name={col.name}
        title={col.title}
        key={col.name}
        checked={selected.indexOf(col.name) > -1}
        onChange={this.handleChange.bind(this)}/>
    )

    return (
      <div>
        {allCheckbox}
        {collectionCheckboxes}
      </div>
    )
  }

  render() {
    var result = null
    let {selected, collections} = this.props
    if(collections) {
      if(collections.length) {
        result = this.renderCheckboxes(collections, selected)
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
