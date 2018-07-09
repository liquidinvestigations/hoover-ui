import { Component } from 'react';
import PropTypes from 'prop-types';

const d3 = require('d3');
const shape = require('d3-shape');
const π = Math.PI;
const RADIUS = 50;
const PADDING = 10;
const FILETYPE_COLOR = {
    email: '#b648ff',
    pdf: '#2fe4b0',
    doc: '#5151e4',
    xls: 'green',
    ppt: '#e63263',
    image: '#9ae665',
    text: '#a0a0a0',
    folder: '#4bc0e6',
    archive: '#ffd132',
    html: '#ef8585',
};

const arc = shape
    .arc()
    .startAngle(d => d.x)
    .endAngle(d => d.x + d.dx)
    .padAngle(0)
    .padRadius(0)
    .innerRadius(0)
    .outerRadius(RADIUS);

class PieChart extends Component {
    slices() {
        const { buckets } = this.props;
        const scale = (2 * π) / d3.sum(buckets, d => d.doc_count);

        let slices = [];
        let x = 0;

        for (let bucket of buckets) {
            let count = bucket.doc_count;
            let dx = count * scale;
            let geometry = { x, dx };
            let filetype = bucket.key;

            slices.push({ count, geometry, filetype });
            x += dx;
        }

        return slices;
    }

    color(filetype) {
        return FILETYPE_COLOR[filetype] || '#eee';
    }

    mouseOverHandler(value) {
        return () => {
            this.setState({ hover: value });
        };
    }

    mouseOutHandler(value) {
        return () => {
            this.setState({ hover: null });
        };
    }

    clickHandler(filters) {
        return () => {
            this.props.onSelect(filters);
        };
    }

    renderSvg(slices) {
        const { hover } = this.state || {};
        const OFFSET = RADIUS + PADDING;
        const width = 2 * OFFSET;
        const height = 2 * OFFSET;

        return (
            <svg height={width} width={height}>
                <g transform={`translate(${OFFSET},${OFFSET})`}>
                    {slices.map(({ geometry, filetype }) => (
                        <path
                            d={arc(geometry)}
                            key={filetype}
                            className={`charts-pie-slice ${
                                hover == filetype ? 'hover' : ''
                            }`}
                            style={{
                                fill: this.color(filetype),
                            }}
                            onMouseOver={this.mouseOverHandler(filetype)}
                            onMouseOut={this.mouseOutHandler(filetype)}
                            onClick={this.clickHandler({ filetype })}>
                            <title>{filetype}</title>
                        </path>
                    ))}
                </g>
            </svg>
        );
    }

    renderLegend(slices) {
        const OFFSET = RADIUS + PADDING;
        const { hover } = this.state || {};

        return (
            <div
                style={{
                    width: 2 * OFFSET,
                    marginTop: PADDING,
                }}
                className="charts-pie-legend">
                {slices.map(({ count, filetype }) => (
                    <div
                        key={filetype}
                        style={{
                            color: this.color(filetype),
                        }}
                        className={hover == filetype ? 'hover' : ''}
                        onMouseOver={this.mouseOverHandler(filetype)}
                        onMouseOut={this.mouseOutHandler(filetype)}
                        onClick={this.clickHandler({ filetype })}>
                        {count} {filetype}
                    </div>
                ))}
            </div>
        );
    }

    render() {
        const slices = this.slices();

        return (
            <div>
                <div className="small text-muted">File type</div>

                <div className="charts-pie">
                    {this.renderSvg(slices)}
                    {this.renderLegend(slices)}
                </div>
            </div>
        );
    }
}

export default class Charts extends Component {
    static propTypes = {
        aggregations: PropTypes.object.isRequired,
        onSelect: PropTypes.func.isRequired,
    };

    render() {
        const { aggregations, onSelect } = this.props;

        if (!aggregations.count_by_filetype) {
            return null;
        }

        return (
            <div className="charts">
                <PieChart
                    buckets={aggregations.count_by_filetype.buckets}
                    onSelect={onSelect}
                />
            </div>
        );
    }
}
