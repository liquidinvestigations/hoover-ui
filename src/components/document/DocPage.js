import React from 'react'
import Head from 'next/head'
import { Typography } from '@material-ui/core'
import { makeStyles } from '@material-ui/core/styles'
import SplitPane from 'react-split-pane'
import { useDocument } from './DocumentProvider'
import Document  from './Document'
import Locations from '../Locations'
import Finder from '../Finder'
import SplitPaneLayout from '../SplitPaneLayout'
import HotKeysWithHelp from '../HotKeysWithHelp'
import { useUser } from '../UserProvider'
import Error from '../../../pages/_error'
import { copyMetadata, shortenName } from '../../utils'

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

export default function DocPage() {
    const classes = useStyles()
    const whoAmI = useUser()

    const {
        data, loading, error, printMode,
        digest, digestUrl, urlIsSha,
    } = useDocument()

    if (error) {
        return (
            <Error
                statusCode={error.status}
                title={error.statusText}
                message={
                    <>
                        Request to <a href={error.url}>{error.url}</a> returned HTTP {error.status} {error.statusText}
                    </>
                }
            />
        )
    }

    const infoPane = (
        <>
            {!digest ? <Document /> :
                <SplitPaneLayout
                    container={false}
                    left={loading ? null : <Locations data={data} url={digestUrl} />}
                    defaultSizeLeft="25%"
                    defaultSizeMiddle="70%"
                >
                    <Document />
                </SplitPaneLayout>
            }
        </>
    )

    let content

    if (printMode) {
        content = <Document />
    } else {
        content = urlIsSha ?
            <>
                {data && (
                    <Typography variant="subtitle2" className={classes.title}>
                        Document <b>{data?.id}</b>
                        {' '}
                        filename: <b>{shortenName(data?.content.filename, 50)}</b>
                        {' '}
                        - please pick a location to see the Finder
                    </Typography>
                )}
                <div className={classes.splitPane}>
                    {infoPane}
                </div>
            </>
            :
            <>
                {data && (
                    <Typography variant="subtitle2" className={classes.title}>
                        {!!digest ? 'File' : 'Directory'}
                        {' '}
                        <b>{data.content.path}</b>
                    </Typography>
                )}
                <div className={classes.splitPane}>
                    <SplitPane
                        split="horizontal"
                        defaultSize="30%"
                        pane1ClassName={classes.horizontalSplitPane}
                        pane2ClassName={classes.horizontalSplitPane}
                    >
                        <Finder />
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
