import { CircularProgress, Typography } from '@mui/material'
import { useTranslate } from '@tolgee/react'
import { observer } from 'mobx-react-lite'
import Head from 'next/head'
import { FC, ReactElement } from 'react'
import SplitPane from 'react-split-pane'

import { copyMetadata, shortenName, extractStringFromField } from '../../../utils/utils'
import { HotKeysWithHelp } from '../../common/HotKeysWithHelp/HotKeysWithHelp'
import { Finder } from '../../finder/Finder'
import { useSharedStore } from '../../SharedStoreProvider'

import { useStyles } from './DocPage.styles'
import { DocPageError } from './error'
import { InfoPane } from './InfoPane'

export const DocPage: FC = observer(() => {
    const { t } = useTranslate()
    const { classes } = useStyles()
    const {
        documentStore: { data, loading, error, digest, digestUrl, urlIsSha },
    } = useSharedStore()

    const fileName = extractStringFromField(data?.content?.filename)

    if (error) return <DocPageError error={error} />

    const content = urlIsSha ? (
        <>
            {data && (
                <Typography variant="subtitle2" className={classes.title}>
                    {t('document', 'Document')} <b>{data?.id}</b> {t('filename', 'Filename').toLowerCase()}: <b>{shortenName(fileName, 50)}</b> -{' '}
                    {t('pick_location_for_finder', 'please pick a location to see the Finder')}
                </Typography>
            )}
            <div className={classes.splitPane}>
                <InfoPane digest={digest} data={data} digestUrl={digestUrl} loading={loading} />
            </div>
        </>
    ) : (
        <>
            <Typography variant="subtitle2" className={classes.title}>
                {data ? (
                    <>
                        {digest ? t('file', 'File') : t('directory', 'Directory')} <b>{extractStringFromField(data.content?.path)}</b>
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
                    pane2ClassName={classes.horizontalSplitPane}>
                    <Finder />
                    <InfoPane digest={digest} data={data} digestUrl={digestUrl} loading={loading} />
                </SplitPane>
            </div>
        </>
    )

    const keys = {
        copyMetadata: {
            key: 'c',
            help: t('help_copy_md5_path', 'Copy MD5 and path to clipboard'),
            handler: (keyEvent?: KeyboardEvent, showMessage?: (message: ReactElement | string) => void) => {
                if (data?.content && showMessage) {
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
