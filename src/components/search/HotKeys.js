import { useMemo } from 'react'
import { copyMetadata, documentViewUrl } from '../../utils'
import HotKeysWithHelp from '../HotKeysWithHelp'
import { useSharedStore } from '../SharedStoreProvider'
import { useSearch } from './SearchProvider'

export default function HotKeys({ children, inputRef }) {
    const {
        hashStore: { hashState },
        documentStore: { data },
    } = useSharedStore()
    const { previewNextDoc, previewPreviousDoc } = useSearch()
    const isInputFocused = () => inputRef.current === document.activeElement

    const keys = useMemo(
        () => ({
            nextItem: {
                key: 'j',
                help: 'Preview next result',
                handler: (event) => {
                    event.preventDefault()
                    if (!isInputFocused()) {
                        previewNextDoc()
                    }
                },
            },
            previousItem: {
                key: 'k',
                help: 'Preview the previous result',
                handler: (event) => {
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
                    isInputFocused() ||
                        (!!hashState.preview &&
                            window.open(
                                documentViewUrl({
                                    _collection: hashState.preview.c,
                                    _id: hashState.preview.i,
                                }),
                                '_blank'
                            ))
                },
            },
            focusInputField: {
                key: '/',
                help: 'Focus the search field',
                handler: (event) => {
                    if (!isInputFocused()) {
                        event.preventDefault()
                        inputRef.current?.focus()
                    }
                },
            },
        }),
        [JSON.stringify(hashState?.preview), data, previewNextDoc, previewPreviousDoc]
    )

    return <HotKeysWithHelp keys={keys}>{children}</HotKeysWithHelp>
}
