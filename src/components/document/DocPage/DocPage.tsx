import { CircularProgress, Typography } from '@mui/material'
import { useTranslate } from '@tolgee/react'
import { observer } from 'mobx-react-lite'
import { FC, ReactElement, useEffect } from 'react'
import { Helmet } from 'react-helmet'
import { useParams } from 'react-router-dom'
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
    const { collection, id } = useParams()
    const {
        setFullPage,
        documentStore: { data, loading, error, digest, urlIsSha, setDocument },
    } = useSharedStore()

    useEffect(() => {
        if (collection && id) {
            setFullPage(true)
            setDocument(collection, id)
        }
    })

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
                <InfoPane digest={digest} loading={loading} />
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
                    <InfoPane digest={digest} loading={loading} />
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
            <Helmet>
                <title>{`Hoover ${data && `- ${fileName}`}`}</title>
            </Helmet>
            <HotKeysWithHelp keys={keys}>
                <div tabIndex={-1}>{content}</div>
            </HotKeysWithHelp>
        </>
    )
})
