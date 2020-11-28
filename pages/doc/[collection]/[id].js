import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import url from 'url'
import cn from 'classnames'
import { Typography } from '@material-ui/core'
import { makeStyles } from '@material-ui/core/styles'
import SplitPane from 'react-split-pane'
import Document  from '../../../src/components/document/Document'
import Locations from '../../../src/components/Locations'
import Finder from '../../../src/components/Finder'
import SplitPaneLayout from '../../../src/components/SplitPaneLayout'
import { copyMetadata, documentViewUrl } from '../../../src/utils'
import HotKeys from '../../../src/components/HotKeys'
import Loading from '../../../src/components/Loading'
import api from '../../../src/api'

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

export default function Doc() {
    const classes = useStyles()

    const router = useRouter()
    const { query } = router
    const [data, setData] = useState()
    const [loading, setLoading] = useState(false)
    const [pathname, setPathname] = useState()

    useEffect(() => {
        if ((query.collection && query.id) || query.path) {
            let path = documentViewUrl({ _collection: query.collection, _id: query.id })
            if (query.path) {
                path = query.path
            }
            setPathname(path)
            setLoading(true)
            api.doc(path, 1).then(data => {
                setData(data)
                setLoading(false)
            })
        }
    }, [JSON.stringify(query)])

    const printMode = query.print && query.print !== 'false'

    useEffect(() => {
        if (printMode && !loading) {
            window.setTimeout(window.print)
        }
    }, [printMode, loading])

    let digest = data?.id
    let digestUrl = pathname
    let urlIsSha = true

    if (data?.id.startsWith('_file_')) {
        digest = data.digest
        digestUrl = [url.resolve(pathname, './'), digest].join('/')
        urlIsSha = false
    }

    if (data?.id.startsWith('_directory_')) {
        digest = null
        urlIsSha = false
    }

    const doc = (
        <Document
            docUrl={pathname}
            data={data}
            loading={loading}
            fullPage
            showMeta
            showToolbar={!printMode}
        />
    )

    const finder = (
        <Finder
            isFetching={loading}
            data={data}
            url={pathname}
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
                {!loading && data &&
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
