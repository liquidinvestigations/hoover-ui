import React, { useMemo } from 'react'
import { useSearch } from './SearchProvider'
import HotKeysWithHelp from '../HotKeysWithHelp'
import { copyMetadata } from '../../utils'

export default function HotKeys({ children, inputRef  }) {
    const { query, selectedDocData, previewNextDoc, previewPreviousDoc } = useSearch()
    const isInputFocused = () => inputRef.current === document.activeElement

    const keys = useMemo(() => ({
        nextItem: {
            key: 'j',
            help: 'Preview next result',
            handler: event => {
                event.preventDefault()
                if (!isInputFocused()) {
                    previewNextDoc()
                }
            },
        },
        previousItem: {
            key: 'k',
            help: 'Preview the previous result',
            handler: event => {
                event.preventDefault()
                if (!isInputFocused()) {
                    previewPreviousDoc()
                }
            },
        },
        copyMetadata: {
            key: 'c',
            help: 'Copy metadata (MD5 and path) of the currently previewed item to the clipboard.',
            handler: (event, showMessage) => {
                if (isInputFocused()) {
                    return
                }
                event.preventDefault()
                if (selectedDocData?.content) {
                    showMessage(copyMetadata(selectedDocData))
                } else {
                    showMessage('Unable to copy metadata – no document selected?')
                }
            },
        },
        openItem: {
            key: 'o',
            help: 'Open the currently previewed result',
            handler: () => {
                isInputFocused() || (!!query.preview && window.open(query.preview, '_blank'))
            },
        },
        focusInputField: {
            key: '/',
            help: 'Focus the search field',
            handler: event => {
                if (!isInputFocused()) {
                    event.preventDefault()
                    inputRef.current?.focus()
                }
            },
        }
    }), [query, previewNextDoc, previewPreviousDoc, selectedDocData])

    return (
        <HotKeysWithHelp keys={keys}>
            {children}
        </HotKeysWithHelp>
    )
}
