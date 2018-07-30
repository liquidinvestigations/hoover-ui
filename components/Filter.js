import { Component } from 'react';
import cn from 'classnames';

export default class Filter extends Component {
    constructor(props) {
        super(props);
        this.state = { open: props.defaultOpen || false };
    }

    toggle = () => this.setState({ open: !this.state.open });

    render() {
        const { title, children } = this.props;
        const { open } = this.state;

        return (
            <div
                className={cn(
                    'filter',
                    `filter-${title.replace(/\W/g, '-').toLowerCase()}`,
                    { open }
                )}>
                <div className="filter-header" onClick={this.toggle}>
                    {title}
                    <i className={'fa fa-angle-right'} />
                </div>
                <div className="filter-body">{children}</div>
            </div>
        );
    }
}
