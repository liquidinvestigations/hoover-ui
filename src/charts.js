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
      let dx = bucket.doc_count * scale
      slices.push({geometry: {x, dx}, filetype: bucket.key})
      x += dx
    }

    return slices
  }

  renderSvg(slices) {
    let {onSelect} = this.props
    const OFFSET = RADIUS + PADDING

    return (
      <svg height={2 * OFFSET}>
        <g transform={`translate(${OFFSET},${OFFSET})`}>
          {slices.map(({geometry, filetype}) =>
            <path
              d={arc(geometry)}
              key={filetype}
              className='charts-slice'
              style={{
                fill: FILETYPE_COLOR[filetype] || '#eee',
              }}
              onClick={() => {
                onSelect({filetype})
              }}
              >
              <title>{filetype}</title>
            </path>
          )}
        </g>
      </svg>
    )
  }

  render() {
    let slices = this.slices()
    return (
      <div>
        {this.renderSvg(slices)}
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
