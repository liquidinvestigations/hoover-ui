import React from 'react'

const d3 = require('d3')
const shape = require('d3-shape')
const π = Math.PI
const RADIUS = 50
const PADDING = 10
const FILETYPE_COLOR = {
  email: 'orange',
  pdf: 'red',
  doc: 'blue',
  xls: 'green',
  text: 'brown',
  folder: 'lightblue',
  archive: 'yellow',
}

const arc = shape.arc()
  .startAngle((d) => d.x)
  .endAngle((d) => d.x + d.dx)
  .padAngle(.01)
  .padRadius(0)
  .innerRadius(0)
  .outerRadius(RADIUS)

class PieChart extends React.Component {

  slices() {
    let {buckets} = this.props
    let scale = 2 * π / d3.sum(buckets, (d) => d.doc_count)
    let slices = []
    let x = 0

    for(let bucket of buckets) {
      let count = bucket.doc_count
      let dx = count * scale
      let geometry = {x, dx}
      let filetype = bucket.key
      slices.push({count, geometry, filetype})
      x += dx
    }

    return slices
  }

  color(filetype) {
    return FILETYPE_COLOR[filetype] || '#eee'
  }

  mouseOverHandler(value) {
    return () => {
      this.setState({hover: value})
    }
  }

  mouseOutHandler(value) {
    return () => {
      this.setState({hover: null})
    }
  }

  clickHandler(filters) {
    return () => {
      this.props.onSelect(filters)
    }
  }

  renderSvg(slices) {
    let {hover} = this.state || {}
    const OFFSET = RADIUS + PADDING

    return (
      <svg height={2 * OFFSET} width={2 * OFFSET}>
        <g transform={`translate(${OFFSET},${OFFSET})`}>
          {slices.map(({geometry, filetype}) =>
            <path
              d={arc(geometry)}
              key={filetype}
              className={`charts-pie-slice ${hover == filetype ? 'hover' : ''}`}
              style={{
                fill: this.color(filetype),
              }}
              onMouseOver={this.mouseOverHandler(filetype)}
              onMouseOut={this.mouseOutHandler(filetype)}
              onClick={this.clickHandler({filetype})}
              >
              <title>{filetype}</title>
            </path>
          )}
        </g>
      </svg>
    )
  }

  renderLegend(slices) {
    const OFFSET = RADIUS + PADDING
    let {hover} = this.state || {}

    return (
      <div
        style={{
          width: 2 * OFFSET,
          marginTop: PADDING,
        }}
        className='charts-pie-legend'
        >
        {slices.map(({count, filetype}) =>
          <div
            key={filetype}
            style={{
              color: this.color(filetype),
            }}
            className={hover == filetype ? 'hover' : ''}
            onMouseOver={this.mouseOverHandler(filetype)}
            onMouseOut={this.mouseOutHandler(filetype)}
            onClick={this.clickHandler({filetype})}
            >{count} {filetype}</div>
        )}
      </div>
    )
  }

  render() {
    let slices = this.slices()
    return (
      <div className='charts-pie'>
        {this.renderSvg(slices)}
        {this.renderLegend(slices)}
      </div>
    )
  }

}

export default function Charts({ resp, onSelect }) {
  let aggregations = resp.aggregations || {}
  if(! aggregations.count_by_filetype) return <div/>
  return (
    <div className='charts'>
      <PieChart
        buckets={aggregations.count_by_filetype.buckets}
        onSelect={onSelect}
        />
    </div>
  )
}
