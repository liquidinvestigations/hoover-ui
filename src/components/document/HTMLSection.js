import React from 'react'
import Section from './Section';

export default function HTMLSection({ html, title }) {
    if (!html) return null;

    return (
        <Section title={title}>
            <span dangerouslySetInnerHTML={{ __html: html }} />
        </Section>
    )
}
