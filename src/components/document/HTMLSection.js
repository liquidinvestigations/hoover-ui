import React, { memo } from 'react'
import Section from './Section';

function HTMLSection({ html }) {
    if (!html) return null;

    return (
        <Section title="HTML">
            <span dangerouslySetInnerHTML={{ __html: html }} />
        </Section>
    )
}

export default memo(HTMLSection)
