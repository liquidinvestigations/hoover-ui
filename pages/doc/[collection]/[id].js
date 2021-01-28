import React from 'react'
import Content from '../../../src/components/document/Content'
import { ContentProvider } from '../../../src/components/document/ContentProvider'

export default function Doc() {
    return (
        <ContentProvider>
            <Content />
        </ContentProvider>
    )
}
