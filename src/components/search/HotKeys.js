import React, { useMemo } from 'react'
import { useSearch } from './SearchProvider'
import { useHashState } from '../HashStateProvider'
import { useDocument } from '../document/DocumentProvider'
import HotKeysWithHelp from '../HotKeysWithHelp'
import { copyMetadata, documentViewUrl } from '../../utils'

export default function HotKeys({ children, inputRef  }) {
    const { hashState } = useHashState()
    const { data } = useDocument()
    const { previewNextDoc, previewPreviousDoc } = useSearch()
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
                if (data?.content) {
                    showMessage(copyMetadata(data))
                } else {
                    showMessage('Unable to copy metadata – no document selected?')
                }
            },
        },
        openItem: {
            key: 'o',
            help: 'Open the currently previewed result',
            handler: () => {
                isInputFocused() || (!!hashState.preview && window.open(documentViewUrl({
                        _collection: hashState.preview.c,
                        _id: hashState.preview.i,
                }), '_blank'))
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
    }), [hashState, data, previewNextDoc, previewPreviousDoc])

    return (
        <HotKeysWithHelp keys={keys}>
            {children}
        </HotKeysWithHelp>
    )
}
