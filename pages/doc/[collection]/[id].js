import React, { useEffect, useState } from 'react'
import { connect } from 'react-redux'
import URL from 'url'
import cn from 'classnames'
import { Typography } from '@material-ui/core'
import { makeStyles } from '@material-ui/core/styles'
import SplitPane from 'react-split-pane'

import { fetchDoc } from '../../../src/actions'

import Document  from '../../../src/components/document/Document'
import Locations from '../../../src/components/Locations'
import Finder from '../../../src/components/Finder'
import SplitPaneLayout from '../../../src/components/SplitPaneLayout'
import { parseLocation, copyMetadata, isPrintMode } from '../../../src/utils'
import HotKeys from '../../../src/components/HotKeys'

const useStyles = makeStyles(theme => ({
    splitPane: {
        overflow: 'hidden',
        height: 'calc(100vh - 56px)',
        position: 'relative',
        backfaceVisibility: 'hidden',
        willChange: 'overflow',

        '@media (min-width: 0px) and (orientation: landscape)': {
            height: 'calc(100vh - 48px)',
        },

        '@media (min-width: 600px)': {
            height: 'calc(100vh - 64px)',
        }
    },
    splitPaneWithTitle: {
        height: 'calc(100vh - 96px)',

        '@media (min-width: 0px) and (orientation: landscape)': {
            height: 'calc(100vh - 88px)',
        },

        '@media (min-width: 600px)': {
            height: 'calc(100vh - 104px)',
        }
    },
    horizontalSplitPane: {
        overflowX: 'hidden',
        overflowY: 'auto',
        height: 'auto',
    },
    title: {
        height: '40px',
        padding: '10px',
        backgroundColor: theme.palette.grey['100'],
        borderBottomColor: theme.palette.grey['400'],
        borderBottomWidth: '1px',
        borderBottomStyle: 'solid',
    },
}))

function Doc({ data, dispatch, url, isFetching, error }) {
    if (!url) {
        return null
    }

    if (error) {
        return (
            <Typography style={{ margin: '5rem 3rem' }} color="error">
                {error.message.split('\n').map((e, i) => (
                    <p key={i}>{e}</p>
                ))}
            </Typography>
        )
    }

    const keys = [
        {
            name: 'copyMetadata',
            key: 'c',
            help: 'Copy MD5 and path to clipboard',
            handler: (e, showMessage) => {
                if (data?.content) {
                    showMessage(copyMetadata(data))
                }
            },
        },
    ]

    const classes = useStyles()

    const { query, pathname } = parseLocation()

    const fetch = () => {
        let path = pathname
        if (query.path) {
            path = query.path
        }
        dispatch(fetchDoc(path, { includeParents: true }))
    }

    useEffect(() => {
        fetch()
    }, [url])

    const printMode = isPrintMode()

    useEffect(() => {
        if (printMode && !isFetching) {
            window.setTimeout(window.print)
        }
    }, [isFetching])

    let digest = data?.id
    let digestUrl = url
    let urlIsSha = true

    if (data?.id.startsWith('_file_')) {
        digest = data.digest
        digestUrl = [URL.resolve(url, './'), digest].join('/')
        urlIsSha = false
    }

    if (data?.id.startsWith('_directory_')) {
        digest = null
        urlIsSha = false
    }

    const doc = (
        <Document
            fullPage
            showMeta
            showToolbar={!printMode}
        />
    )

    const finder = (
        <Finder
            isFetching={isFetching}
            data={data}
            url={url}
        />
    )

    const infoPane = (
        <>
            {!!digest ?
                <SplitPaneLayout
                    container={false}
                    left={<Locations data={data} url={digestUrl}/>}
                    defaultSizeLeft="25%"
                    defaultSizeMiddle="70%">
                    {doc}
                </SplitPaneLayout>
                :
                doc
            }
        </>
    )

    let content = null

    if (printMode) {
        content = doc
    } else {
        content = urlIsSha ?
            <>
                {!isFetching &&
                    <Typography variant="subtitle2" className={classes.title}>
                        Document <b>{data?.content.filename}</b> - please pick a location to see the Finder
                    </Typography>
                }
                <div className={cn(classes.splitPane, classes.splitPaneWithTitle)}>
                    {infoPane}
                </div>
            </>
            :
            <div className={classes.splitPane}>
                <SplitPane
                    split="horizontal"
                    defaultSize="30%"
                    pane1ClassName={classes.horizontalSplitPane}
                    pane2ClassName={classes.horizontalSplitPane}>
                    {finder}
                    {infoPane}
                </SplitPane>
            </div>
    }

    return (
        <HotKeys keys={keys} focused>
            <div tabIndex="-1">
                {content}
            </div>
        </HotKeys>
    )
}

const mapStateToProps = ({ doc: { isFetching, data, url, error } }) => ({
    isFetching,
    data,
    url,
    error,
})

export default connect(mapStateToProps)(Doc)
