import { Component, Fragment } from 'react';
import cn from 'classnames';
import { withRouter } from 'next/router';
import api from '../api';
import Button from '@material-ui/core/Button';
import Link from 'next/link';

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
                name: 'search',
                url: '/',
                next: true,
            },
            {
                name: 'about',
                url: 'https://github.com/mgax/hoover',
            },
            {
                name: 'terms',
                url: '/terms',
                next: true,
            },
            // {
            //     name: 'documentation',
            //     url:
            //         'https://dl.dropboxusercontent.com/u/103063/static/hoover/HooverDocumentaiton.pdf',
            // },
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
        const elements = this.links()
            .filter(this.shouldShow)
            .map(l => {
                const b = (
                    <Button
                        key={l.name}
                        variant="text"
                        component="a"
                        href={l.url}
                        color="inherit">
                        {l.name}
                    </Button>
                );

                return l.next ? (
                    <Link key={l.name} href={l.url}>
                        {b}
                    </Link>
                ) : (
                    b
                );
            });

        return <Fragment>{elements}</Fragment>;
    }
}

export default withRouter(Menu);
