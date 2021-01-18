import React, { memo, useContext, useMemo, useState } from 'react'
import { DateTime } from 'luxon'
import ChipInput from 'material-ui-chip-input'
import { Box, Button, ButtonGroup, Chip, Grid, IconButton, Tooltip, Typography } from '@material-ui/core'
import { Lock, LockOpen } from '@material-ui/icons'
import { makeStyles } from '@material-ui/core/styles'
import { blue } from '@material-ui/core/colors'
import Loading from '../Loading'
import { UserContext } from '../../../pages/_app'
import { createTag, deleteTag, updateTag } from '../../backend/api'
import { publicTagsList, specialTags, specialTagsList } from './specialTags'

const onlyAlphanumericRegex = /[^a-z0-9_!@#$%^&*()-=+:,./?]/gi

const useStyles = makeStyles(theme => ({
    toolbarButtons: {
        marginBottom: theme.spacing(3),
    },
    toolbarButton: {
        textTransform: 'none',
    },
    buttons: {
        marginTop: theme.spacing(1),
    },
    info: {
        display: 'block',
        marginTop: theme.spacing(1),
        color: theme.palette.grey.A700,
    },
    otherTags: {
        borderBottom: '1px solid rgba(0, 0, 0, 0.42)',
    },
    otherTagsInfo: {
        marginTop: theme.spacing(1),
        marginBottom: theme.spacing(1),
    },
    tag: {
        marginRight: theme.spacing(1),
    }
}))

const getChipColor = chip => {
    const data = specialTags.find(tag => tag.tag === chip.tag)
    if (data?.color) {
        return data.color
    } else if (chip.public) {
        return blue[200]
    }
}

function Tags({ loading, digestUrl, tags, onChanged, toolbarButtons, locked, onLocked, printMode }) {
    const classes = useStyles()
    const whoAmI = useContext(UserContext)

    const [inputValue, setInputValue] = useState('')

    const otherUsersTags = useMemo(() => {
        const usersTags = {}
        tags.forEach(tag => {
            if (tag.user !== whoAmI.username) {
                if (!usersTags[tag.user]) {
                    usersTags[tag.user] = []
                }
                usersTags[tag.user].push(tag)
            }
        })
        return Object.entries(usersTags)
    }, [tags])

    if (!digestUrl) {
        return null
    }

    const simpleTags = tags => (
        <Grid container>
            {tags.map(({ tag }, index) => (
                <Grid item className={classes.tag} key={index}>
                    <Chip label={tag} />
                </Grid>
            ))}
        </Grid>
    )

    if (printMode) {
        return (
            <>
                <Box my={3} pb={0.7}>
                    {simpleTags(tags)}
                </Box>

                {otherUsersTags.map(([user, tags], index) =>
                    <Box key={index} my={3} pb={0.7}>
                        <Typography variant="subtitle2" className={classes.otherTagsInfo}>
                            Public tags from <i>{user}</i>:
                        </Typography>

                        {simpleTags(tags)}
                    </Box>
                )}
            </>
        )
    }

    const handleTagInputUpdate = event => {
        setInputValue(event.target.value.replace(onlyAlphanumericRegex, ""))
    }

    const handleTagAdd = (tag, publicTag = false) => {
        onLocked(true)
        createTag(digestUrl, { tag, public: publicTagsList.includes(tag) || publicTag }).then(newTag => {
            onChanged([...tags, newTag])
            setInputValue('')
            onLocked(false)
        }).catch(() => {
            onLocked(false)
        })
    }

    const handleTagDelete = tag => {
        tag.isMutating = true
        onChanged([...tags])
        onLocked(true)
        deleteTag(digestUrl, tag.id).then(() => {
            onChanged([...(tags.filter(t => t.id !== tag.id))])
            onLocked(false)
        }).catch(() => {
            tag.isMutating = false
            onChanged([...tags])
            onLocked(false)
        })
    }

    const handleClick = tag => () => {
        tag.isMutating = true
        onChanged([...tags])
        onLocked(true)
        updateTag(digestUrl, tag.id, {public: !tag.public}).then(changedTag => {
            Object.assign(tag, {
                ...changedTag,
                isMutating: false,
            })
            onChanged([...tags])
            onLocked(false)
        }).catch(() => {
            tag.isMutating = false
            onChanged([...tags])
            onLocked(false)
        })
    }

    const handleButtonClick = publicTag => () => {
        if (inputValue.length) {
            handleTagAdd(inputValue, publicTag)
        }
    }

    const renderChip = ({ value, text, chip, isDisabled, isReadOnly, handleDelete, className }, key) => (
        <Tooltip
            key={key}
            placement="top"
            title={
                <>
                    <Box>
                        <strong>Created on:</strong>{' '}
                        {DateTime.fromISO(chip.date_created, { locale: 'en-US' })
                            .toLocaleString(DateTime.DATETIME_FULL)}
                    </Box>
                    <Box>
                        {chip.date_indexed ?
                            <>
                                Indexed in
                                <strong>
                                    {DateTime.fromISO(chip.date_indexed)
                                        .diff(DateTime.fromISO(chip.date_modified))
                                        .toFormat(' s.SSS ')}
                                </strong>
                                seconds
                            </>:
                            'Not indexed yet'
                        }
                    </Box>
                </>
            }
        >
            <Chip
                icon={chip.user === whoAmI.username && !specialTagsList.includes(chip.tag) ? chip.public ?
                    <Tooltip title="make private">
                        <IconButton
                            size="small"
                            onClick={handleClick(chip)}
                        >
                            <LockOpen />
                        </IconButton>
                    </Tooltip> :
                    <Tooltip title="make public">
                        <IconButton
                            size="small"
                            onClick={handleClick(chip)}
                        >
                            <Lock />
                        </IconButton>
                    </Tooltip> : null
                }
                disabled={chip.isMutating}
                className={className}
                style={{
                    pointerEvents: isDisabled || isReadOnly ? 'none' : undefined,
                    backgroundColor: getChipColor(chip)
                }}
                onDelete={chip.user === whoAmI.username ? handleDelete : null}
                label={chip.tag}
            />
        </Tooltip>
    )

    return (
        loading ? <Loading /> :
            <>
                <ButtonGroup className={classes.toolbarButtons}>
                    {toolbarButtons && toolbarButtons.map(({tooltip, label, icon, ...props}, index) => (
                        <Tooltip title={tooltip} key={index}>
                            <Button
                                className={classes.toolbarButton}
                                color="default"
                                size="small"
                                component="a"
                                endIcon={icon}
                                {...props}>
                                {label}
                            </Button>
                        </Tooltip>
                    ))}
                </ButtonGroup>

                <ChipInput
                    value={tags.filter(tag => tag.user === whoAmI.username)}
                    onAdd={handleTagAdd}
                    onDelete={handleTagDelete}
                    disabled={locked}
                    chipRenderer={renderChip}
                    newChipKeys={['Enter', ' ']}
                    newChipKeyCodes={[13, 32]}
                    inputValue={inputValue}
                    onUpdateInput={handleTagInputUpdate}
                    placeholder="no tags, start typing to add"
                    fullWidth
                />

                <Grid container className={classes.buttons} justify="flex-end">
                    <Grid item>
                        <ButtonGroup size="small" color="primary">
                            <Button onClick={handleButtonClick(false)}>Private</Button>
                            <Button onClick={handleButtonClick(true)}>Public</Button>
                        </ButtonGroup>
                    </Grid>
                </Grid>

                <Typography variant="caption" className={classes.info}>
                    Tags are made of lowercase ASCII letters, digits, and symbols:{' '}
                    <code>_!@#$%^&*()-=+:,./?</code>.<br />
                    Changes to tags may take a minute to appear in search.<br />
                    Tags must be matched exactly when searching.
                </Typography>

                {otherUsersTags.map(([user, tags], index) =>
                    <Box key={index} my={3} pb={0.7} className={classes.otherTags}>
                        <Typography variant="subtitle2" className={classes.otherTagsInfo}>
                            Public tags from <i>{user}</i>:
                        </Typography>

                        <Grid container>
                            {tags.map((chip, key) =>
                                <Grid item>
                                    {renderChip({chip}, key)}
                                </Grid>
                            )}
                        </Grid>
                    </Box>
                )}
            </>
    )
}

export default memo(Tags)
