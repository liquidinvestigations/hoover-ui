import React, { useState } from 'react'
import { GlobalHotKeys } from 'react-hotkeys'
import { makeStyles } from '@material-ui/core/styles'
import { List, ListItem, ListItemText, Modal, Snackbar, Typography } from '@material-ui/core'

const useStyles = makeStyles(theme => ({
    keyHelp: {
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        backgroundColor: theme.palette.background.paper,
        boxShadow: theme.shadows[5],
        padding: theme.spacing(4),
    },
    helpDescription: {
        marginLeft: theme.spacing(2)
    }
}))

export default function HotKeysWithHelp({ keys, children }) {
    const classes = useStyles()
    const [keyHelpOpen, setKeyHelpOpen] = useState(false)
    const openHelp = event => {
        event.preventDefault()
        setKeyHelpOpen(true)
    }
    const hideKeyHelp = () => setKeyHelpOpen(false)

    const [snackbarMessage, setSnackbarMessage] = useState(null)
    const handleSnackbarClose = () => setSnackbarMessage(null)

    const keysWithHelp = {
        ...keys,
        openHelp: {
            key: ['F1', '?', 'shift+?', 'h'],
            help: 'Open this help',
            handler: openHelp
        },
    }

    const keyMap = {}
    const handlers = {}

    Object.entries(keysWithHelp).forEach(([name, { key, handler }]) => {
        keyMap[name] = key
        handlers[name] = event => handler(event, setSnackbarMessage)
    })

    return (
        <>
            <GlobalHotKeys keyMap={keyMap} handlers={handlers} allowChanges>
                {children}
            </GlobalHotKeys>

            <Modal open={keyHelpOpen} onClose={hideKeyHelp}>
                <div className={classes.keyHelp}>
                    <Typography variant="h6">Keyboard shortcuts</Typography>

                    <List dense>
                        {Object.entries(keysWithHelp).map(([ name, { key, help } ]) => (
                            <ListItem key={key}>
                                <span className="mono">
                                    {Array.isArray(key) ? key.join(' or ') : key}
                                </span>
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
                open={Boolean(snackbarMessage)}
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
