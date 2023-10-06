import { List, ListItem, ListItemText, Modal, Snackbar, Typography } from '@mui/material'
import { useTranslate } from '@tolgee/react'
import { FC, ReactNode, useState } from 'react'
import { HotKeys } from 'react-hotkeys'

import { useStyles } from './HotKeysWithHelp.styles'

type KeyWithHelpHandler = (keyEvent?: KeyboardEvent, showMessage?: (message: string) => void) => void

interface KeyWithHelp {
    key: string | string[]
    help: string
    handler: KeyWithHelpHandler
}

interface HotKeysWithHelpProps {
    keys: Record<string, any>
    children: ReactNode | ReactNode[]
}

export const HotKeysWithHelp: FC<HotKeysWithHelpProps> = ({ keys, children }) => {
    const { t } = useTranslate()
    const { classes } = useStyles()
    const [keyHelpOpen, setKeyHelpOpen] = useState(false)
    const openHelp = () => setKeyHelpOpen(true)
    const hideKeyHelp = () => setKeyHelpOpen(false)

    const [snackbarMessage, setSnackbarMessage] = useState<string | undefined>(undefined)
    const handleSnackbarClose = () => setSnackbarMessage(undefined)

    const keysWithHelp: Record<string, KeyWithHelp> = {
        ...keys,
        openHelp: {
            key: ['?', 'h'],
            help: t('help_open', 'Open this help'),
            handler: openHelp,
        },
    }

    const keyMap: Record<string, any> = {}
    const handlers: {
        [key: string]: KeyWithHelpHandler
    } = {}

    Object.entries(keysWithHelp).forEach(([name, { key, handler }]) => {
        keyMap[name] = key
        handlers[name] = (event) => handler(event, setSnackbarMessage)
    })

    return (
        <>
            <HotKeys keyMap={keyMap} handlers={handlers} allowChanges>
                {children}
            </HotKeys>

            <Modal open={keyHelpOpen} onClose={hideKeyHelp}>
                <div className={classes.keyHelp}>
                    <Typography variant="h6">Keyboard shortcuts</Typography>

                    <List dense>
                        {Object.entries(keysWithHelp).map(([name, { key, help }]) => (
                            <ListItem key={Array.isArray(key) ? key.join() : key}>
                                <span className="mono">{Array.isArray(key) ? key.join(' or ') : key}</span>
                                <ListItemText primary={help} className={classes.helpDescription} />
                            </ListItem>
                        ))}
                    </List>
                </div>
            </Modal>

            <Snackbar
                anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'left',
                }}
                open={!!snackbarMessage}
                autoHideDuration={6000}
                onClose={handleSnackbarClose}
                ContentProps={{
                    'aria-describedby': 'snackbar-message',
                }}
                message={<span id="snackbar-message-id">{snackbarMessage}</span>}
            />
        </>
    )
}
