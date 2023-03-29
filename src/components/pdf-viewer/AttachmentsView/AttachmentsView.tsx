import { List, ListItem, ListItemIcon, ListItemText } from '@mui/material'
import { observer } from 'mobx-react-lite'
import { FC, useEffect, useState } from 'react'

import { reactIcons } from '../../../constants/icons'
import { downloadFile } from '../../../utils/utils'
import { useSharedStore } from '../../SharedStoreProvider'
import { useStyles } from '../PDFViever.styles'

interface Attachments {
    fileName: string
    data: any
}

export const AttachmentsView: FC = observer(() => {
    const { classes } = useStyles()
    const { doc } = useSharedStore().pdfViewerStore
    const [attachments, setAttachments] = useState<Attachments[]>([])

    useEffect(() => {
        ;(async () => {
            if (doc) {
                const files = await new Promise((resolve) => {
                    doc.getAttachments().then((response) => {
                        resolve(
                            !response
                                ? []
                                : Object.keys(response).map((file) => ({
                                      data: response[file].content,
                                      fileName: response[file].filename,
                                  }))
                        )
                    })
                })
                setAttachments(files as Attachments[])
            }
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
                        <ListItemText primary="No attachments" />
                    </ListItem>
                )}
            </List>
        </div>
    )
})
