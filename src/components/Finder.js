import React, { memo, useEffect, useState } from 'react'
import ReactFinder from './ReactFinder'
import ErrorBoundary from './ErrorBoundary'
import last from 'lodash/last'
import { useRouter } from 'next/router'
import { getBasePath, getIconImageElement } from '../utils'
import api from '../api'

const filenameFor = item => {
    if (item.filename) {
        return item.filename;
    } else {
        const { filename, path } = item.content;
        return filename || last(path.split('/').filter(Boolean).pop()) || path || '/';
    }
}

const buildTree = (leaf, basePath) => {
    const nodesById = {};

    const createNode = item => {
        const id = (item.file || item.id);
        let fileType = item.filetype;

        if (!fileType && item.content) {
            fileType = item.content.filetype;
        }

        const node = (nodesById[item.id] = nodesById[item.id] || {
            id,
            digest: item.digest,
            file: item.file,
            label: filenameFor(item),
            fileType,
            href: [basePath, id].join(''),
            parent: item.parent ? createNode(item.parent) : null,
            children: item.children ? item.children.map(createNode) : null,
        });

        const more = {
            loadId: id,
            label: '...',
            fileType: 'more',
        }

        const hasPrevPage = item.hasPrevPage === undefined ? item.children_page > 1 : item.hasPrevPage
        const prevPage = item.prevPage === undefined ? item.children_page - 1 : item.prevPage
        const nextPage = item.nextPage === undefined ? item.children_page + 1 : item.nextPage

        if (hasPrevPage) {
            node.children.unshift({...more, loadPage: prevPage, direction: 'prepend'})
        }

        if (item.children_has_next_page) {
            node.children.push({...more, loadPage: nextPage, direction: 'append'})
        }

        return node
    }

    let current = createNode(leaf)

    while (current.parent) {
        const parentNode = current.parent

        parentNode.children = parentNode.children
            ? parentNode.children.map(child => nodesById[child.id] || child)
            : null

        current = parentNode
    }

    return [current]
}

const handleCreateItemContent = (config, item) => {
    const label = document.createElement('span')
    label.appendChild(document.createTextNode(item.label))
    label.className = 'tree-view-label'

    if (item.fileType === 'more') {
        return label
    }

    const icon = getIconImageElement(item.fileType)

    const fragment = document.createDocumentFragment()
    fragment.appendChild(icon)
    fragment.appendChild(label)

    return fragment
}

function Finder({ loading, data, url }) {
    const router = useRouter()

    const handleColumnCreated = (...args) => console.log('column-created', ...args)

    const handleLeafSelected = item => {
        console.log('leaf-selected', item)
        navigateTo(item)
    }

    const handleItemSelected = item => {
        console.log('item-selected', item)
    }

    const handleInteriorSelected = item => {
        console.log('interior-selected', item)
        navigateTo(item)
    }

    const navigateTo = async item => {
        if (item.href) {
            router.push(
                item.href,
                undefined,
                {shallow: true},
            )
        } else if (item.fileType === 'more') {
            const moreItems = await api.doc(
                getBasePath(url) + item.loadId,
                item.loadPage
            )
            let current = {...data}
            while (current.id !== item.loadId) {
                current = current.parent
            }
            if (item.direction === 'append') {
                current.nextPage = item.loadPage + 1
                current.children.push(...moreItems.children)
                current.children_has_next_page = moreItems.children_has_next_page
                setDefaultValue(moreItems.children[0])
            } else {
                current.hasPrevPage = item.loadPage > 1
                current.prevPage = item.loadPage - 1
                current.children.unshift(...moreItems.children)
                setDefaultValue(moreItems.children[moreItems.children.length - 1])
            }

            setTree(buildTree(current, getBasePath(url)))
        }
    }

    const [defaultValue, setDefaultValue] = useState()
    const [tree, setTree] = useState([])

    const parentLevels = 3
    useEffect(async () => {
        if (!loading && url && data) {
            let current = data;
            let level = 0;

            while (current.parent_id && level <= parentLevels) {
                current.parent = await api.doc(
                    getBasePath(url) + current.parent_id,
                    current.parent_children_page
                )

                current = current.parent
                level++

                setDefaultValue(data)
                setTree(buildTree(data, getBasePath(url)))
            }
        }
    }, [url, data, loading])

    return (
        <div className="finder">
            <ErrorBoundary visible>
                <ReactFinder
                    data={tree}
                    defaultValue={defaultValue}
                    onLeafSelected={handleLeafSelected}
                    onItemSelected={handleItemSelected}
                    onInteriorSelected={handleInteriorSelected}
                    onColumnCreated={handleColumnCreated}
                    createItemContent={handleCreateItemContent}
                />
            </ErrorBoundary>
        </div>
    )
}

export default memo(Finder)
