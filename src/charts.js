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

export default function Charts({ resp }) {
  let aggregations = resp.aggregations || {}
  if(! aggregations.count_by_filetype) return <div/>
  let buckets = aggregations.count_by_filetype.buckets
  let scale = 2 * π / d3.sum(buckets, (d) => d.doc_count)
  let slices = []
  let x = 0

  for(let bucket of buckets) {
    let dx = bucket.doc_count * scale
    slices.push({x, dx, filetype: bucket.key})
    x += dx
  }

  const offset = RADIUS + PADDING
  return (
    <div className='charts'>
      <svg height={2 * offset}>
        <g transform={`translate(${offset},${offset})`}>
          {slices.map((slice) =>
            <path
              d={arc(slice)}
              key={slice.filetype}
              className='charts-slice'
              style={{
                fill: FILETYPE_COLOR[slice.filetype] || '#eee',
              }}
              >
              <title>{slice.filetype}</title>
            </path>
          )}
        </g>
      </svg>
    </div>
  )
}
