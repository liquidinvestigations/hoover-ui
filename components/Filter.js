import { Component } from 'react';
import cn from 'classnames';
import Icon from '@material-ui/icons/KeyboardArrowDown';
import Typography from '@material-ui/core/Typography';

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
                    <Typography variant="body2">{title}</Typography>
                    <span className="icon">
                        <Icon />
                    </span>
                </div>
                <div className="filter-body">{children}</div>
            </div>
        );
    }
}
