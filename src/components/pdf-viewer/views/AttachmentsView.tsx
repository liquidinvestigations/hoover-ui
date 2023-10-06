import { List, ListItem, ListItemIcon, ListItemText } from '@mui/material'
import { useTranslate } from '@tolgee/react'
import { FC, useEffect, useState } from 'react'
import { makeStyles } from 'tss-react/mui'

import { reactIcons } from '../../../constants/icons'
import { downloadFile } from '../../../utils/utils'
import { useDocument } from '../DocumentProvider'

const useStyles = makeStyles()((theme) => ({
    container: {
        backgroundColor: theme.palette.grey[100],
    },
}))

interface AttachmentFiles {
    data: any
    fileName: string
}

export const AttachmentsView: FC = () => {
    const { t } = useTranslate()
    const { classes } = useStyles()
    const doc = useDocument()?.doc
    const [attachments, setAttachments] = useState<AttachmentFiles[]>([])

    useEffect(() => {
        ;(async () => {
            const files: AttachmentFiles[] = await new Promise((resolve) => {
                doc?.getAttachments().then((response) => {
                    resolve(
                        !response
                            ? []
                            : Object.keys(response).map((file) => ({
                                  data: response[file].content,
                                  fileName: response[file].filename?.[0] ?? '',
                              })),
                    )
                })
            })
            setAttachments(files)
        })()
    }, [doc])

    const handleFileDownload = (fileName: string, data: any) => () => downloadFile(fileName, data)

    return (
        <div className={classes.container}>
            <List dense>
                {attachments.length ? (
                    attachments.map(({ fileName, data }, index) => (
                        <ListItem key={index} button onClick={handleFileDownload(fileName, data)}>
                            <ListItemText primary={fileName} />
                            <ListItemIcon>{reactIcons.download}</ListItemIcon>
                        </ListItem>
                    ))
                ) : (
                    <ListItem>
                        <ListItemText primary={t('no_attachments', 'No attachments')} />
                    </ListItem>
                )}
            </List>
        </div>
    )
}
