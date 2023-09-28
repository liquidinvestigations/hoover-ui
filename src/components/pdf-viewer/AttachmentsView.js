import { List, ListItem, ListItemIcon, ListItemText } from '@mui/material'
import { memo, useEffect, useState } from 'react'
import { makeStyles } from 'tss-react/mui'

import { reactIcons } from '../../constants/icons'
import { downloadFile } from '../../utils/utils'

import { useDocument } from './DocumentProvider'

const useStyles = makeStyles()((theme) => ({
    container: {
        backgroundColor: theme.palette.grey[100],
    },
}))

function AttachmentsView() {
    const { classes } = useStyles()
    const { doc } = useDocument()
    const [attachments, setAttachments] = useState([])

    useEffect(() => {
        ;(async () => {
            const files = await new Promise((resolve) => {
                doc.getAttachments().then((response) => {
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

    const handleFileDownload = (fileName, data) => () => downloadFile(fileName, data)

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
}

export default memo(AttachmentsView)
