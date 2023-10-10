import { T } from '@tolgee/react'
import { makeAutoObservable } from 'mobx'
import { ReactElement } from 'react'

import { copyMetadata, documentViewUrl } from '../utils/utils'

import { DocumentStore } from './DocumentStore'
import { HashStateStore } from './HashStateStore'
import { SearchStore } from './search/SearchStore'

export class HotKeysStore {
    keys: Record<string, any>

    constructor(
        private readonly hashStore: HashStateStore,
        private readonly documentStore: DocumentStore,
        private readonly searchStore: SearchStore,
    ) {
        makeAutoObservable(this)

        const isInputFocused = () => searchStore.searchViewStore.inputRef?.current === document.activeElement

        this.keys = {
            nextItem: {
                key: 'j',
                help: <T keyName="help_preview_next">Preview next result</T>,
                handler: (event: KeyboardEvent) => {
                    event.preventDefault()
                    if (!isInputFocused()) {
                        searchStore.searchResultsStore.previewNextDoc()
                    }
                },
            },
            previousItem: {
                key: 'k',
                help: <T keyName="help_preview_previous">Preview the previous result</T>,
                handler: (event: KeyboardEvent) => {
                    event.preventDefault()
                    if (!isInputFocused()) {
                        searchStore.searchResultsStore.previewPreviousDoc()
                    }
                },
            },
            copyMetadata: {
                key: 'c',
                help: <T keyName="help_copy_md5">Copy metadata (MD5 and path) of the currently previewed item to the clipboard.</T>,
                handler: (event: KeyboardEvent, showMessage: (message: ReactElement | string) => void) => {
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
                help: <T keyName="help_open_current">Open the currently previewed result</T>,
                handler: () => {
                    isInputFocused() ||
                        (!!hashStore.hashState.preview &&
                            window.open(
                                documentViewUrl({
                                    _collection: hashStore.hashState.preview.c,
                                    _id: hashStore.hashState.preview.i,
                                }),
                                '_blank',
                            ))
                },
            },
            focusInputField: {
                key: '/',
                help: <T keyName="help_focus_search">Focus the search field</T>,
                handler: (event: KeyboardEvent) => {
                    if (!isInputFocused()) {
                        event.preventDefault()
                        searchStore.searchViewStore.inputRef?.current?.focus()
                    }
                },
            },
        }
    }
}
