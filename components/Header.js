import { Component } from 'react';
import Menu from '../components/Menu';
import Link from 'next/link';

export default class Header extends Component {
    render() {
        return (
            <nav className="navbar navbar-expand-md navbar-dark bg-dark">
                <div className="container">
                    <Link href="/">
                        <a>
                            <span className="navbar-brand">hoover</span>
                        </a>
                    </Link>

                    <Menu />
                </div>
            </nav>
        );
    }
}
