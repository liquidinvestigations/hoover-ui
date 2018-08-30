import { Component } from 'react';
import SplitPaneLayout from '../src/components/SplitPaneLayout';
import Document, { Meta } from '../src/components/Document';
import Locations from '../src/components/Locations';
import { withRouter } from 'next/router';

import { connect } from 'react-redux';
import { fetchServerDoc, fetchDoc } from '../src/actions';

import url from 'url';

class Doc extends Component {
    componentDidMount() {
        const { query } = this.props.router;

        if (query.path) {
            this.props.dispatch(fetchDoc(query.path));
        } else {
            this.props.dispatch(fetchServerDoc());
        }
    }

    render() {
        if (!this.props.url) {
            return null;
        }

        const { data, url } = this.props;

        const left = data && <Locations data={data} url={url} />;
        const right = data && <Meta doc={data} />;

        return (
            <SplitPaneLayout
                left={left}
                right={right}
                defaultSizeLeft="25%"
                defaultSizeMiddle="70%">
                <Document fullPage />
            </SplitPaneLayout>
        );
    }
}

export default connect(({ doc: { data, url } }) => ({ data, url }))(withRouter(Doc));
