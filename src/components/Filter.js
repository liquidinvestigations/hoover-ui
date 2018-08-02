import { Component } from 'react';
import PropTypes from 'prop-types';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import IconButton from '@material-ui/core/IconButton';
import Typography from '@material-ui/core/Typography';
import Grid from '@material-ui/core/Grid';
import Divider from '@material-ui/core/Divider';
import IconClear from '@material-ui/icons/Clear';
import { withStyles } from '@material-ui/core/styles';
import cn from 'classnames';

const styles = theme => ({
    root: {
        marginTop: '1rem',
        width: '100%',
        border: '1px solid #eee',
    },

    header: {
        cursor: 'pointer',
        position: 'relative',
        textTransform: 'uppercase',
        paddingLeft: theme.spacing.unit * 2,
        paddingRight: theme.spacing.unit * 2,

        '&:hover': {
            background: theme.palette.background.default,
        },
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

    body: {
        maxHeight: 0,
        transition: theme.transitions.create('max-height', {
            duration: theme.transitions.duration.shortest,
        }),
        overflow: 'hidden',
    },

    bodyOpen: {
        maxHeight: '1000rem',
    },
});

class Filter extends Component {
    static propTypes = {
        classes: PropTypes.object.isRequired,
    };

    constructor(props) {
        super(props);
        this.state = { open: props.defaultOpen || false };
    }

    toggle = () => this.setState({ open: !this.state.open });

    render() {
        const { title, children, classes, defaultOpen } = this.props;
        const { open } = this.state;

        return (
            <div className={classes.root}>
                <div className={classes.header} onClick={this.toggle}>
                    <Grid container alignItems="baseline" justify="space-between">
                        <Grid item>
                            <Typography
                                variant="body2"
                                color={defaultOpen ? 'secondary' : 'default'}>
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
                                    color={defaultOpen ? 'secondary' : 'action'}
                                />
                            </IconButton>
                        </Grid>
                    </Grid>
                </div>

                {open && <Divider />}

                <div className={cn(classes.body, { [classes.bodyOpen]: open })}>
                    {children}
                </div>
            </div>
        );
    }
}

export default withStyles(styles)(Filter);
