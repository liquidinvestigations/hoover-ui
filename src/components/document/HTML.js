import React, { memo } from 'react'

const HTML = ({ html }) => <span dangerouslySetInnerHTML={{ __html: html }} />

export default memo(HTML)
