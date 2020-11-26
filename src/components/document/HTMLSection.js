import React, { memo } from 'react'
import Section from './Section';

function HTMLSection({ html, title }) {
    if (!html) return null;

    return (
        <Section title={title}>
            <span dangerouslySetInnerHTML={{ __html: html }} />
        </Section>
    )
}

export default memo(HTMLSection)
