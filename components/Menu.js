import { Component, Fragment } from 'react';
import cn from 'classnames';
import { withRouter } from 'next/router';
import api from '../utils/api';

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
                <button
                    className={cn('navbar-toggler', { collapsed: !this.state.open })}
                    type="button"
                    onClick={this.toggleMenu}
                    data-toggle="collapse"
                    data-target="#navbarSupportedContent"
                    aria-controls="navbarSupportedContent"
                    aria-expanded="false"
                    aria-label="Toggle navigation">
                    <span className="navbar-toggler-icon" />
                </button>

                <div
                    className={cn('navbar-collapse', {
                        collapse: !this.state.open,
                        show: this.state.open,
                    })}
                    id="navbarSupportedContent">
                    <ul className="navbar-nav ml-auto">
                        {this.links()
                            .filter(this.shouldShow)
                            .map(l => (
                                <li
                                    className={cn('nav-item', {
                                        active: l.active,
                                    })}
                                    key={l.name}>
                                    <a className="nav-link" href={l.url}>
                                        {l.name}
                                    </a>
                                </li>
                            ))}
                    </ul>
                </div>
            </Fragment>
        );

        return (
            <div className="navbar-toggler">
                <button
                    type="button"
                    className="btn"
                    data-toggle="dropdown"
                    aria-haspopup="true"
                    onClick={this.toggleMenu}
                    aria-expanded={this.state.open.toString()}>
                    ☰
                </button>
                <div
                    className={cn('dropdown-menu dropdown-menu-right', {
                        show: this.state.open,
                    })}
                    aria-labelledby="loggedin-btngroup">
                    {this.links()
                        .filter(this.shouldShow)
                        .map(l => (
                            <a className="dropdown-item" href={l.url} key={l.name}>
                                {l.name}
                            </a>
                        ))}
                </div>
            </div>
        );
    }
}

export default withRouter(Menu);
