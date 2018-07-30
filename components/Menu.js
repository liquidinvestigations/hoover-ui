import { Component, Fragment } from 'react';
import cn from 'classnames';
import { withRouter } from 'next/router';
import api from '../utils/api';
import Button from '@material-ui/core/Button';

class Menu extends Component {
    state = {
        user: {
            username: '',
            admin: false,
            urls: {},
        },
        open: false,
    };

    async componentDidMount() {
        const user = await api.whoami();

        if (user) {
            this.setState({ user });
        }
    }

    links() {
        const {
            user: { urls, username },
        } = this.state;

        const { router } = this.props;

        return [
            {
                name: 'about',
                url: 'https://github.com/mgax/hoover',
            },
            // {
            //     name: 'documentation',
            //     url:
            //         'https://dl.dropboxusercontent.com/u/103063/static/hoover/HooverDocumentaiton.pdf',
            // },
            {
                name: 'terms',
                url: '/terms',
            },
            {
                name: 'login',
                url: urls.login,
                type: 'not-logged-in',
            },
            {
                name: 'change password',
                url: urls.password_change,
                type: 'logged-in',
            },
            {
                name: 'admin',
                url: urls.admin,
                type: 'admin',
            },
            {
                name: `logout (${username})`,
                url: urls.logout,
                type: 'logged-in',
            },
        ].map(l => ({ ...l, active: router.asPath === l.url }));
    }

    shouldShow = link => {
        if (link.type == 'admin') {
            return this.state.user.admin;
        }
        if (link.type == 'logged-in') {
            return this.state.user.username;
        }
        if (link.type == 'not-logged-in') {
            return !this.state.user.username;
        }
        return true;
    };

    toggleMenu = () => this.setState({ open: !this.state.open });

    render() {
        return (
            <Fragment>
                {this.links()
                    .filter(this.shouldShow)
                    .map(l => (
                        <Button
                            key={l.name}
                            component="a"
                            href={l.url}
                            color="inherit">
                            {l.name}
                        </Button>
                    ))}
            </Fragment>
        );
    }
}

export default withRouter(Menu);
