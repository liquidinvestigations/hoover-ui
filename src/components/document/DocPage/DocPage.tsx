import { Typography } from '@mui/material'
import { observer } from 'mobx-react-lite'
import Head from 'next/head'
import { FC } from 'react'
import SplitPane from 'react-split-pane'

import Error from '../../../../pages/_error'
import { copyMetadata, shortenName } from '../../../utils/utils'
import { HotKeysWithHelp } from '../../common/HotKeysWithHelp/HotKeysWithHelp'
import { SplitPaneLayout } from '../../common/SplitPaneLayout/SplitPaneLayout'
import { Finder } from '../../finder/Finder'
import Locations from '../../Locations'
import { useSharedStore } from '../../SharedStoreProvider'
import { Document } from '../Document'

import { useStyles } from './DocPage.styles'

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

    const infoPane = !digest ? (
        <Document />
    ) : (
        <SplitPaneLayout
            container={false}
            left={loading ? null : <Locations data={data} url={digestUrl} />}
            defaultSizeLeft="25%"
            defaultSizeMiddle="70%">
            <Document />
        </SplitPaneLayout>
    )

    let content

    if (printMode) {
        content = <Document />
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
