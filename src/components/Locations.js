import url from 'url';
import { Component } from 'react';
import api from '../utils/api';
import Loading from '../components/Loading';

export default class Locations extends Component {
    state = { doc: null, locations: null };

    async componentDidMount() {
        const { docUrl } = this.props;

        const [locations, doc] = await Promise.all([
            await api.locationsFor(docUrl).then(d => d.locations),
            window.HOOVER_HYDRATE_DOC
                ? window.HOOVER_HYDRATE_DOC
                : await api.doc(docUrl),
        ]);

        this.setState({ locations, doc });
    }

    render() {
        const { doc, locations } = this.state;
        const { docUrl } = this.props;

        const baseUrl = url.resolve(docUrl, './');

        if (!(doc && locations)) {
            return <Loading />;
        }

        return (
            <div className="doc-page">
                <div className="card">
                    <div className="card-body">
                        <div className="lead">#{doc.id}</div>

                        <ul className="content">
                            {locations.map((loc, index) => (
                                <li key={index}>
                                    <a href={`${baseUrl}${loc.parent_id}`}>
                                        {loc.parent_path}
                                    </a>/{loc.filename}
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>
        );
    }
}
