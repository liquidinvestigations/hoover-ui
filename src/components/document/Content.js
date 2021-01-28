import React, { useContext } from 'react'
import Head from 'next/head'
import { Typography } from '@material-ui/core'
import { makeStyles } from '@material-ui/core/styles'
import SplitPane from 'react-split-pane'
import Document  from './Document'
import { useData } from './ContentProvider'
import Locations from '../Locations'
import Finder from '../Finder'
import SplitPaneLayout from '../SplitPaneLayout'
import HotKeysWithHelp from '../HotKeysWithHelp'
import { copyMetadata, shortenName } from '../../utils'
import { UserContext } from '../../../pages/_app'

const useStyles = makeStyles(theme => ({
    splitPane: {
        overflow: 'hidden',
        position: 'relative',
        backfaceVisibility: 'hidden',
        willChange: 'overflow',

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

export default function Content() {
    const classes = useStyles()
    const whoAmI = useContext(UserContext)

    const {
        data,
        pathname,
        loading,
        printMode,

        digest,
        digestUrl,
        urlIsSha,
    } = useData()

    const doc = (
        <Document
            docUrl={pathname}
            data={data}
            loading={loading}
            printMode={printMode}
            fullPage
        />
    )

    const finder = (
        <Finder
            loading={loading}
            data={data}
            url={pathname}
        />
    )

    const infoPane = (
        <>
            {!!digest ?
                <SplitPaneLayout
                    container={false}
                    left={loading ? null : <Locations data={data} url={digestUrl} />}
                    defaultSizeLeft="25%"
                    defaultSizeMiddle="70%"
                >
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
                {data &&
                <Typography variant="subtitle2" className={classes.title}>
                    Document <b>{data?.id}</b>
                    {' '}
                    filename: <b>{shortenName(data?.content.filename, 50)}</b>
                    {' '}
                    - please pick a location to see the Finder
                </Typography>
                }
                <div className={classes.splitPane}>
                    {infoPane}
                </div>
            </>
            :
            <>
                {data &&
                <Typography variant="subtitle2" className={classes.title}>
                    {!!digest ? 'File' : 'Directory'}
                    {' '}
                    <b>{data.content.path}</b>
                </Typography>
                }
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
            </>
    }

    const keys = {
        copyMetadata: {
            key: 'c',
            help: 'Copy MD5 and path to clipboard',
            handler: (e, showMessage) => {
                if (data?.content) {
                    showMessage(copyMetadata(data))
                }
            },
        },
    }

    return (
        <>
            <Head>
                <title>Hoover {data && `- ${data?.content.filename}`}</title>
                {whoAmI.urls.hypothesis_embed && (
                    <>
                        <script async src={whoAmI.urls.hypothesis_embed} />
                        <script dangerouslySetInnerHTML={{
                            __html: 'window.hypothesisConfig = function() {'+
                                'return {'+
                                'showHighlights: true,'+
                                "appType: 'bookmarklet'"+
                                '}'+
                                '}'
                        }}>
                        </script>
                    </>
                )}
            </Head>
            <HotKeysWithHelp keys={keys}>
                <div tabIndex="-1">
                    {content}
                </div>
            </HotKeysWithHelp>
        </>
    )
}
