import { CircularProgress, Typography } from '@mui/material'
import { T, useTranslate } from '@tolgee/react'
import { observer } from 'mobx-react-lite'
import Head from 'next/head'
import { FC } from 'react'
import SplitPane from 'react-split-pane'

import Error from '../../../../pages/_error'
import { copyMetadata, shortenName } from '../../../utils/utils'
import { HotKeysWithHelp } from '../../common/HotKeysWithHelp/HotKeysWithHelp'
import { SplitPaneLayout } from '../../common/SplitPaneLayout/SplitPaneLayout'
import { Finder } from '../../finder/Finder'
import { useSharedStore } from '../../SharedStoreProvider'
import { Document } from '../Document'
import { Locations } from '../Locations/Locations'

import { useStyles } from './DocPage.styles'

export const DocPage: FC = observer(() => {
    const { t } = useTranslate()
    const { classes } = useStyles()
    const {
        user,
        printMode,
        documentStore: { data, loading, error, digest, digestUrl, urlIsSha },
    } = useSharedStore()

    const [fileName] = data?.content.filename ?? ['']

    if (error) {
        return (
            <Error
                statusCode={error.status}
                title={error.statusText}
                message={
                    (
                        <>
                            <T keyName="request_to_url_error" params={{ url: error.url, status: error.status, statusText: error.statusText }}>
                                {'Request to {url} returned HTTP {status} {statusText}'}
                            </T>
                        </>
                    ) as unknown as string
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
            defaultSizeMiddle="70%"
        >
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
                        {t('document', 'Document')} <b>{data?.id}</b> {t('filename', 'Filename').toLowerCase()}: <b>{shortenName(fileName, 50)}</b> -{' '}
                        {t('pick_location_for_finder', 'please pick a location to see the Finder')}
                    </Typography>
                )}
                <div className={classes.splitPane}>{infoPane}</div>
            </>
        ) : (
            <>
                <Typography variant="subtitle2" className={classes.title}>
                    {data ? (
                        <>
                            {!!digest ? t('file', 'File') : t('directory', 'Directory')} <b>{data.content?.path?.[0] ?? ''}</b>
                        </>
                    ) : (
                        <CircularProgress size={16} thickness={4} />
                    )}
                </Typography>

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
        )
    }

    const keys = {
        copyMetadata: {
            key: 'c',
            help: t('help_copy_md5_path', 'Copy MD5 and path to clipboard'),
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
                <title>{`Hoover ${data && `- ${fileName}`}`}</title>
            </Head>
            <HotKeysWithHelp keys={keys}>
                <div tabIndex={-1}>{content}</div>
            </HotKeysWithHelp>
        </>
    )
})
