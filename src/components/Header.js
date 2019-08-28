import { Component } from 'react';
import PropTypes from 'prop-types';
import Menu from './Menu';
import Link from 'next/link';
import api from '../api';

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

function embedHypothesis(scriptUrl) {
  window.hypothesisConfig = function() {
    return {
      showHighlights:true,
      appType:'bookmarklet',
    };
  };
  var scriptNode = document.createElement('script');
  scriptNode.setAttribute('src', scriptUrl);
  document.body.appendChild(scriptNode);
}

class Header extends Component {
    static propTypes = {
        classes: PropTypes.object.isRequired,
    };

    state = {
        whoami: {
            username: '',
            admin: false,
            urls: {},
            title: '',
        },
    };

    async componentDidMount() {
        const whoami = await api.whoami();

        if (whoami) {
            this.setState({ whoami });
            if (whoami.urls.hypothesis_embed) {
              embedHypothesis(whoami.urls.hypothesis_embed);
            }
        }
    }

    render() {
        const { classes } = this.props;
        const { whoami } = this.state;

        return (
            <div className={classes.root}>
                <AppBar position="absolute">
                    <Toolbar>
                        <Typography
                            variant="h6"
                            color="inherit"
                            className={classes.flex}>
                            <a href="/"
                                className={classes.noLink + ' the-title'}
                                dangerouslySetInnerHTML={{__html: whoami.title}} />
                        </Typography>
                        <Menu whoami={whoami} />
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
