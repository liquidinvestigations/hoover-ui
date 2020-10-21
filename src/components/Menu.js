import { Component, Fragment } from 'react';
import cn from 'classnames';
import { withRouter } from 'next/router';
import api from '../api';
import Button from '@material-ui/core/Button';
import Link from 'next/link';

class Menu extends Component {
    state = {
        open: false,
    };

    links() {
        const { router, whoami } = this.props;

        return [
            {
                name: 'search',
                url: '/',
                next: true,
            },
            {
                name: 'about',
                url: 'https://github.com/liquidinvestigations/hoover-search',
            },
            //{
            //    name: 'terms',
            //    url: '/terms',
            //    next: true,
            //},
            {
                name: 'documentation',
                url: 'https://github.com/liquidinvestigations/docs/wiki/User---Hoover',
            },
            {
                name: 'login',
                url: whoami.urls.login,
                type: 'not-logged-in',
            },
            {
                name: 'admin',
                url: whoami.urls.admin,
                type: 'admin',
            },
            {
                name: `logout (${whoami.username})`,
                url: whoami.urls.logout,
                type: 'logged-in',
            },
        ].map(l => ({ ...l, active: router.asPath === l.url }));
    }

    shouldShow = link => {
        const { whoami } = this.props;
        if (link.type == 'admin') {
            return whoami.admin;
        }
        if (link.type == 'logged-in') {
            return whoami.username;
        }
        if (link.type == 'not-logged-in') {
            return !whoami.username;
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
