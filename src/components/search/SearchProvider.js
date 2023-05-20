import { Button, IconButton, Snackbar } from '@mui/material'
import { createContext, useContext, useEffect, useState } from 'react'
import { makeStyles } from 'tss-react/mui'

import { tags as tagsAPI } from '../../backend/api'
import { TAGS_REFRESH_DELAYS } from '../../constants/general'
import { reactIcons } from '../../constants/icons'

const useStyles = makeStyles()((theme) => ({
    close: {
        padding: theme.spacing(0.5),
    },
}))

const SearchContext = createContext({})

export function SearchProvider({ children, serverQuery }) {
    const { classes } = useStyles()

    const periodicallyCheckIndexedTime = (digestUrl) => {
        let timeout,
            delayIndex = 0

        const promise = new Promise((resolve, reject) => {
            const runDelayedQuery = (delay) => {
                timeout = setTimeout(() => {
                    tagsAPI(digestUrl).then((data) => {
                        if (data.every((tag) => !!tag.date_indexed)) {
                            resolve()
                        } else if (delayIndex < TAGS_REFRESH_DELAYS.length) {
                            runDelayedQuery(TAGS_REFRESH_DELAYS[delayIndex++])
                        } else {
                            reject()
                        }
                    })
                }, delay)
            }
            runDelayedQuery(TAGS_REFRESH_DELAYS[delayIndex++])
        })

        const cancel = () => clearTimeout(timeout)

        return { cancel, promise }
    }

    const [tagsRefreshQueue, setTagsRefreshQueue] = useState(null)
    const addTagToRefreshQueue = (digestUrl) => {
        if (tagsRefreshQueue) {
            tagsRefreshQueue.cancel()
        }
        setTagsRefreshQueue(periodicallyCheckIndexedTime(digestUrl))
    }

    const [snackbarMessage, setSnackbarMessage] = useState(null)
    const handleSnackbarClose = () => setSnackbarMessage(null)
    useEffect(() => {
        if (tagsRefreshQueue) {
            tagsRefreshQueue.promise
                .then(() => {
                    setTagsRefreshQueue(null)
                    setSnackbarMessage(
                        <Button
                            color="inherit"
                            startIcon={reactIcons.refresh}
                            onClick={() => {
                                handleSnackbarClose()
                                forceRefresh({})
                            }}>
                            Refresh for new tags
                        </Button>
                    )
                })
                .catch(() => {
                    setTagsRefreshQueue(null)
                })
        }

        return () => {
            if (tagsRefreshQueue) {
                tagsRefreshQueue.cancel()
            }
        }
    }, [tagsRefreshQueue])

    return (
        <SearchContext.Provider
            value={{
                addTagToRefreshQueue,
            }}>
            {children}
            <Snackbar
                anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'left',
                }}
                open={Boolean(snackbarMessage)}
                autoHideDuration={30000}
                onClose={handleSnackbarClose}
                message={snackbarMessage}
                ClickAwayListenerProps={{
                    mouseEvent: false,
                    touchEvent: false,
                }}
                action={
                    <IconButton aria-label="close" color="inherit" className={classes.close} onClick={handleSnackbarClose} size="large">
                        {reactIcons.close}
                    </IconButton>
                }
            />
        </SearchContext.Provider>
    )
}

export const useSearch = () => useContext(SearchContext)
