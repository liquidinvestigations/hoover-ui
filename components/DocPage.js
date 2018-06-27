import url from 'url';
import { Component } from 'react';
import Document from './Document';
import Locations from './Locations';

export default class DocPage extends Component {
    state = { docUrl: null, locations: null };

    componentDidMount() {
        const docUrl = window.location.href.split('?')[0];
        const { query } = url.parse(window.location.href, true);

        this.setState({ docUrl, locations: query.locations });
    }

    render() {
        const { docUrl, locations } = this.state;

        if (locations) {
            return <Locations docUrl={docUrl} />;
        } else if (docUrl) {
            return (
                <Document
                    docUrl={docUrl}
                    collectionBaseUrl={url.resolve(docUrl, './')}
                    fullPage={true}
                />
            );
        } else {
            return null;
        }
    }
}
