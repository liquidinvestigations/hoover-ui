import Head from 'next/head';
import Header from '../components/Header';

export default ({ children }) => (
    <div>
        <div className="nprogress" />
        <Header />
        <main>
            <div className="container">{children}</div>
        </main>
    </div>
);
