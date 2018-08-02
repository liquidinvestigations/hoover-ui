import { Component } from 'react';
import PropTypes from 'prop-types';
import Menu from './Menu';
import Link from 'next/link';

import { withStyles } from '@material-ui/core/styles';

import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import IconButton from '@material-ui/core/IconButton';
import MenuIcon from '@material-ui/icons/Menu';

import ProgressIndicator from './ProgressIndicator';

const styles = theme => ({
    root: {
        zIndex: theme.zIndex.drawer + 1,
    },
    flex: {
        flexGrow: 1,
    },
    menuButton: {
        marginLeft: -12,
        marginRight: 20,
    },
    noLink: {
        textDecoration: 'none',
        color: 'inherit',
    },
});

class Header extends Component {
    static propTypes = {
        classes: PropTypes.object.isRequired,
    };

    render() {
        const { classes } = this.props;

        return (
            <div className={classes.root}>
                <AppBar position="absolute">
                    <Toolbar>
                        <Typography
                            variant="title"
                            color="inherit"
                            className={classes.flex}>
                            <Link href="/">
                                <a className={classes.noLink}>Hoover</a>
                            </Link>
                        </Typography>
                        <Menu />
                    </Toolbar>
                </AppBar>
            </div>
        );
    }
}

export default withStyles(styles)(Header);

{
    /*<nav className="navbar navbar-expand-md navbar-dark bg-dark">
    <div className="container">
        <Link href="/">
            <a>
                <span className="navbar-brand">hoover</span>
            </a>
        </Link>

        <Menu />
    </div>
</nav>
*/
}
