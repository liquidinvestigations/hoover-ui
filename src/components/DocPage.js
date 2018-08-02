import { Component } from 'react';
import Document from './Document';
import Locations from './Locations';

import { connect } from 'react-redux';
import { fetchServerDoc } from '../actions';

class DocPage extends Component {
    componentDidMount() {
        this.props.dispatch(fetchServerDoc());
    }

    render() {
        return this.props.url ? <Document fullPage /> : null;
    }
}

export default connect(({ preview: { doc, url } }) => ({ doc, url }))(DocPage);
