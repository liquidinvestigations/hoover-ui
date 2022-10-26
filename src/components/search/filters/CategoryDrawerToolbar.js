import React, { cloneElement } from 'react'
import cn from 'classnames'
import { IconButton, InputAdornment, TextField, Toolbar, Tooltip } from '@mui/material'
import { duration } from '@mui/material/styles'
import { makeStyles } from '@mui/styles'
import { reactIcons } from '../../../constants/icons'

const useStyles = makeStyles(theme => ({
    toolbar: {
        backgroundColor: theme.palette.grey[100],
        borderBottomColor: theme.palette.grey[400],
        borderBottomWidth: 1,
        borderBottomStyle: 'solid',
    },
    search: {
        marginLeft: theme.spacing(1),
        marginRight: theme.spacing(1),
    },
    searchInput: {
        fontSize: theme.typography.body2.fontSize,
        paddingTop: theme.spacing(1),
        paddingBottom: theme.spacing(1),
    },
    searchInputStart: {
        paddingLeft: theme.spacing(1.3),
    },
    searchInputEnd: {
        paddingRight: theme.spacing(0.7),
    },
    searchIcon: {
        fontSize: 16
    },
    pinButton: {
        marginLeft: 'auto',
        marginRight: 11,
    },
    pinIcon: {
        transition: theme.transitions.create('transform', {
            duration: theme.transitions.duration.shortest,
        }),
    },
    unPinned: {
        transform: 'translateY(-3px) rotate(45deg) scale(0.85)',
    },
}))

export default function CategoryDrawerToolbar({ search, onSearch, drawerPinned, setDrawerPinned, setOpenCategory }) {
    const classes = useStyles()

    const handleSearch = event => onSearch(event.target.value)
    const handleSearchDelete = () => onSearch('')

    return (
        <Toolbar variant="dense" className={classes.toolbar} disableGutters>
            <TextField
                fullWidth
                size="small"
                variant="outlined"
                placeholder="Quick filter"
                className={classes.search}
                onChange={handleSearch}
                value={search}
                InputProps={{
                    startAdornment: (
                        <InputAdornment position="start">
                            {cloneElement(reactIcons.search, {
                                className: classes.searchIcon
                            })}
                        </InputAdornment>
                    ),
                    endAdornment: (
                        <InputAdornment position="end">
                            <IconButton
                                size="small"
                                onClick={handleSearchDelete}
                            >
                                {cloneElement(reactIcons.cancel, {
                                    className: classes.searchIcon
                                })}
                            </IconButton>
                        </InputAdornment>
                    ),
                    classes: {
                        inputMarginDense: classes.searchInput,
                        adornedStart: classes.searchInputStart,
                        adornedEnd: classes.searchInputEnd,
                    }
                }}
            />
            <Tooltip title={drawerPinned ? 'Unpin' : 'Pin'}>
                <IconButton
                    size="small"
                    className={classes.pinButton}
                    onClick={() => setDrawerPinned(pinned => {
                        if (!pinned) {
                            setOpenCategory(category => {
                                setTimeout(() => setOpenCategory(category), duration.leavingScreen)
                                return null
                            })
                        }
                        return !pinned
                    })}
                >
                    {drawerPinned ? (
                        cloneElement(reactIcons.pinned, { className: classes.pinIcon})
                    ) : (
                        cloneElement(reactIcons.unpinned, { className: cn(classes.pinIcon, classes.unPinned)})
                    )}
                </IconButton>
            </Tooltip>
        </Toolbar>
    )
}
