import React, { useRef, useState } from 'react'
import { FormControlLabel, Input, Switch, Toolbar as MuiToolbar, Tooltip } from '@material-ui/core'
import { makeStyles } from '@material-ui/core/styles'
import { useSearch } from '../SearchProvider'

const useStyles = makeStyles(theme => ({
    toolbar: {
        backgroundColor: theme.palette.grey[100],
        borderBottomColor: theme.palette.grey[400],
        borderBottomWidth: 1,
        borderBottomStyle: 'solid',
        justifyContent: 'space-between',
    },
    missingName: {
        width: 80,
        '& input': {
            textAlign: 'center',
        }
    },
}))

export default function Toolbar() {
    const classes = useStyles()
    const { query, search, aggregationsLoading } = useSearch()

    const missingNameInputRef = useRef()
    const [missingName, setMissingName] = useState(query.missing || 'N/A')
    const handleMissingChange = () => {
        search({ missing: query.missing ? undefined : missingName })
    }

    const onMissingNameFocus = () => missingNameInputRef.current.select()
    const onMissingNameBlur = () => onMissingNameChange()
    const onMissingNameKey = event => {
        if (event.keyCode === 13) {
            onMissingNameChange()
            missingNameInputRef.current.blur()
        }
    }
    const onMissingNameChange = () => {
        const name = missingNameInputRef.current.value.trim()
        if (name && name !== missingName) {
            setMissingName(name)
            if (query.missing) {
                search({missing: name})
            }
        } else {
            missingNameInputRef.current.value = missingName
        }
    }

    return (
        <MuiToolbar variant="dense" className={classes.toolbar}>
            <FormControlLabel
                control={
                    <Switch
                        checked={!!query.missing}
                        onChange={handleMissingChange}
                        disabled={aggregationsLoading}
                        color="primary"
                    />
                }
                label={
                    <>
                        missing ( <Tooltip title="missing bucket name">
                            <Input
                                margin="none"
                                inputRef={missingNameInputRef}
                                defaultValue={missingName}
                                className={classes.missingName}
                                onFocus={onMissingNameFocus}
                                onBlur={onMissingNameBlur}
                                onKeyDown={onMissingNameKey}
                                disabled={aggregationsLoading}
                            />
                        </Tooltip> )
                    </>
                }
            />
        </MuiToolbar>
    )
}
