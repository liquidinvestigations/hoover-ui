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
            label: '...',
            fileType: 'more'
        }

        if (item.children_page > 1) {
            node.children.unshift(more)
        }

        if (item.children_has_next_page) {
            node.children.push(more)
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
    /*shouldComponentUpdate(nextProps, nextState) {
        return !nextProps.isFetching
    }*/
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

    const navigateTo = item => {
        if (item.href) {
            router.push(
                item.href,
                undefined,
                {shallow: true},
            )
        }
    }

    const [defaultValue, setDefaultValue] = useState(data)
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
