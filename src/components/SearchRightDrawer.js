import { connect } from 'react-redux';

import Document from './Document';

const mapStateToProps = ({ doc }) => ({ doc });

export default connect(mapStateToProps)(({ classes, doc }) => (
    <div>{doc.url && <Document />}</div>
));
