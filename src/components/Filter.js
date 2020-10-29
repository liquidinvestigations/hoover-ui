import { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import cn from 'classnames';

import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import IconButton from '@material-ui/core/IconButton';
import Typography from '@material-ui/core/Typography';
import Grid from '@material-ui/core/Grid';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import Collapse from '@material-ui/core/Collapse';
import Divider from '@material-ui/core/Divider';
import IconClear from '@material-ui/icons/Clear';
import { withStyles } from '@material-ui/core/styles';

const styles = theme => ({
    upper: {
        textTransform: 'uppercase',
    },

    expand: {
        transform: 'rotate(0deg)',
        transition: theme.transitions.create('transform', {
            duration: theme.transitions.duration.shortest,
        }),
        marginLeft: 'auto',
        [theme.breakpoints.up('sm')]: {
            marginRight: -8,
        },
    },

    expandOpen: {
        transform: 'rotate(180deg)',
    },
});

class Filter extends Component {
    static propTypes = {
        enabled: PropTypes.bool,
        classes: PropTypes.object.isRequired,
        defaultOpen: PropTypes.bool,
        colorIfFiltered: PropTypes.bool,
    };

    static defaultProps = {
        colorIfFiltered: true,
        enabled: true,
    };

    constructor(props) {
        super(props);
        this.state = { open: props.defaultOpen || false };
    }

    toggle = () => this.setState({ open: !this.state.open });

    render() {
        const {
            title,
            children,
            classes,
            defaultOpen,
            colorIfFiltered,
            enabled,
        } = this.props;

        if (!enabled) {
            return null;
        }

        const { open } = this.state;

        return (
            <Fragment>
                <ListItem onClick={this.toggle} button dense>
                    <Grid container alignItems="baseline" justify="space-between">
                        <Grid item>
                            <Typography
                                variant="body2"
                                className={classes.upper}
                                color={
                                    defaultOpen && colorIfFiltered
                                        ? 'secondary'
                                        : 'initial'
                                }>
                                {title}
                            </Typography>
                        </Grid>

                        <Grid item>
                            <IconButton
                                className={cn(classes.expand, {
                                    [classes.expandOpen]: open,
                                })}
                                onClick={this.toggle}
                                aria-expanded={open}
                                aria-label="Show more">
                                <ExpandMoreIcon
                                    color={
                                        defaultOpen && colorIfFiltered
                                            ? 'secondary'
                                            : 'action'
                                    }
                                />
                            </IconButton>
                        </Grid>
                    </Grid>
                </ListItem>

                <Collapse in={open}>
                    {children}
                    <Divider />
                </Collapse>
            </Fragment>
        );
    }
}

export default withStyles(styles)(Filter);
