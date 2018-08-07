import { Component } from 'react';
import SplitPaneLayout from '../src/components/SplitPaneLayout';
import Document from '../src/components/Document';
import Locations from '../src/components/Locations';

import { connect } from 'react-redux';
import { fetchServerDoc } from '../src/actions';

class Doc extends Component {
    componentDidMount() {
        this.props.dispatch(fetchServerDoc());
    }

    render() {
        if (!this.props.url) {
            return null;
        }

        return (
            <SplitPaneLayout>
                <Document fullPage />
            </SplitPaneLayout>
        );
    }
}

export default connect(({ doc: { doc, url } }) => ({ doc, url }))(Doc);
