import React from 'react'
import { connect } from 'react-redux'
import Document from './document/Document'

const mapStateToProps = ({ doc }) => ({ doc });

export default connect(mapStateToProps)(({ doc }) => (
    <div>{doc.url && <Document />}</div>
))
