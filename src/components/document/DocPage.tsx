import { Typography } from '@mui/material'
import { observer } from 'mobx-react-lite'
import Head from 'next/head'
import { FC } from 'react'
import SplitPane from 'react-split-pane'
import { makeStyles } from 'tss-react/mui'

import Error from '../../../pages/_error'
import { copyMetadata, shortenName } from '../../utils/utils'
import HotKeysWithHelp from '../HotKeysWithHelp'
import Locations from '../Locations'
import { useSharedStore } from '../SharedStoreProvider'
import { SplitPaneLayout } from '../SplitPaneLayout'

import { Document } from './Document'
import { Finder } from './finder/Finder'
import { TagsProvider } from './TagsProvider'

import type { Theme } from '@mui/material'

const useStyles = makeStyles()((theme: Theme) => ({
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
        },
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

export const DocPage: FC = observer(() => {
    const { classes } = useStyles()
    const {
        user,
        printMode,
        documentStore: { data, loading, error, digest, digestUrl, urlIsSha },
    } = useSharedStore()

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
        <TagsProvider>
            {!digest ? (
                <Document />
            ) : (
                <SplitPaneLayout
                    container={false}
                    left={loading ? null : <Locations data={data} url={digestUrl} />}
                    defaultSizeLeft="25%"
                    defaultSizeMiddle="70%">
                    <Document />
                </SplitPaneLayout>
            )}
        </TagsProvider>
    )

    let content

    if (printMode) {
        content = (
            <TagsProvider>
                <Document />
            </TagsProvider>
        )
    } else {
        content = urlIsSha ? (
            <>
                {data && (
                    <Typography variant="subtitle2" className={classes.title}>
                        Document <b>{data?.id}</b> filename: <b>{shortenName(data?.content.filename, 50)}</b> - please pick a location to see the Finder
                    </Typography>
                )}
                <div className={classes.splitPane}>{infoPane}</div>
            </>
        ) : (
            <>
                {data && (
                    <Typography variant="subtitle2" className={classes.title}>
                        {!!digest ? 'File' : 'Directory'} <b>{data.content.path}</b>
                    </Typography>
                )}
                <div className={classes.splitPane}>
                    <SplitPane
                        split="horizontal"
                        defaultSize="30%"
                        pane1ClassName={classes.horizontalSplitPane}
                        pane2ClassName={classes.horizontalSplitPane}>
                        <Finder />
                        {infoPane}
                    </SplitPane>
                </div>
            </>
        )
    }

    const keys = {
        copyMetadata: {
            key: 'c',
            help: 'Copy MD5 and path to clipboard',
            handler: (_event: Event, showMessage: (s: string) => void) => {
                if (data?.content) {
                    showMessage(copyMetadata(data))
                }
            },
        },
    }

    return (
        <>
            <Head>
                <title>{`Hoover ${data && `- ${data.content.filename}`}`}</title>
                {user.urls.hypothesis_embed && (
                    <>
                        <script async src={user.urls.hypothesis_embed} />
                        <script
                            dangerouslySetInnerHTML={{
                                __html: `window.hypothesisConfig = function() {
    return {
        showHighlights: true,
        appType: 'bookmarklet'
    }
}`,
                            }}></script>
                    </>
                )}
            </Head>
            <HotKeysWithHelp keys={keys}>
                <div tabIndex={-1}>{content}</div>
            </HotKeysWithHelp>
        </>
    )
})
