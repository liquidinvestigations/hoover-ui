import { makeAutoObservable } from 'mobx'
import { useRef } from 'react'

import { copyMetadata, documentViewUrl } from '../utils/utils'

import { DocumentStore } from './DocumentStore'
import { HashStateStore } from './HashStateStore'
import { SearchStore } from './search/SearchStore'

export class HotKeysStore {
    inputRef = useRef<HTMLInputElement>()

    keys: Record<string, any>

    constructor(private readonly hashStore: HashStateStore, private readonly documentStore: DocumentStore, private readonly searchStore: SearchStore) {
        makeAutoObservable(this)

        const isInputFocused = () => this.inputRef?.current === document.activeElement

        this.keys = {
            nextItem: {
                key: 'j',
                help: 'Preview next result',
                handler: (event: KeyboardEvent) => {
                    event.preventDefault()
                    if (!isInputFocused()) {
                        searchStore.searchResultsStore.previewNextDoc()
                    }
                },
            },
            previousItem: {
                key: 'k',
                help: 'Preview the previous result',
                handler: (event: KeyboardEvent) => {
                    event.preventDefault()
                    if (!isInputFocused()) {
                        searchStore.searchResultsStore.previewPreviousDoc()
                    }
                },
            },
            copyMetadata: {
                key: 'c',
                help: 'Copy metadata (MD5 and path) of the currently previewed item to the clipboard.',
                handler: (event: KeyboardEvent, showMessage: (message: string) => void) => {
                    if (isInputFocused()) {
                        return
                    }
                    event.preventDefault()
                    if (documentStore.data?.content) {
                        showMessage(copyMetadata(documentStore.data))
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
                        (!!hashStore.hashState.preview &&
                            window.open(
                                documentViewUrl({
                                    _collection: hashStore.hashState.preview.c,
                                    _id: hashStore.hashState.preview.i,
                                }),
                                '_blank'
                            ))
                },
            },
            focusInputField: {
                key: '/',
                help: 'Focus the search field',
                handler: (event: KeyboardEvent) => {
                    if (!isInputFocused()) {
                        event.preventDefault()
                        this.inputRef?.current?.focus()
                    }
                },
            },
        }
    }
}
