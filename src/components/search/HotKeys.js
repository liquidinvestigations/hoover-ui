import React, { useMemo } from 'react'
import { copyMetadata } from '../../utils'
import HotKeysWithHelp from '../HotKeysWithHelp'

export default function HotKeys({ children, inputRef, selectedDocUrl, selectedDocData,
                                    previewNextDoc, previewPreviousDoc }) {

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
                isInputFocused() || (!!selectedDocUrl && window.open(selectedDocUrl, '_blank'))
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
    }), [previewNextDoc, previewPreviousDoc, selectedDocData, selectedDocUrl])

    return (
        <HotKeysWithHelp keys={keys}>
            {children}
        </HotKeysWithHelp>
    )
}
