import React, { memo, useCallback, useEffect, useMemo, useState } from 'react'
import ChipInput from 'material-ui-chip-input'
import {
    Box,
    Button,
    ButtonGroup,
    Chip,
    FormControl,
    Grid,
    IconButton,
    MenuItem,
    Select,
    Tooltip,
    Typography
} from '@material-ui/core'
import { Lock, LockOpen } from '@material-ui/icons'
import { makeStyles } from '@material-ui/core/styles'
import { blue } from '@material-ui/core/colors'
import Loading from '../Loading'
import TagTooltip from './TagTooltip'
import { useUser } from '../UserProvider'
import { useDocument } from './DocumentProvider'
import { specialTags, specialTagsList } from '../../constants/specialTags'

const forbiddenCharsRegex = /[^a-z0-9_!@#$%^&*()-=+:,./?]/gi

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
        paddingBottom: 0,
        borderBottom: '1px solid rgba(0, 0, 0, 0.42)',
    },
    otherTagsInfo: {
        marginTop: theme.spacing(1),
        marginBottom: theme.spacing(1),
    },
    tag: {
        marginRight: theme.spacing(1),
        marginBottom: theme.spacing(1),
    }
}))

export const getChipColor = chip => {
    const data = specialTags.find(tag => tag.tag === chip.tag)
    if (data?.color) {
        return data.color
    } else if (chip.public) {
        return blue[200]
    }
}

function Tags({ toolbarButtons }) {
    const classes = useStyles()
    const whoAmI = useUser()

    const {
        digestUrl, printMode, tags, tagsLocked, tagsLoading,
        handleTagAdd, handleTagDelete, handleTagLockClick,
    } = useDocument()

    const [inputValue, setInputValue] = useState('')
    const [newTagVisibility, setNewTagVisibility] = useState('public')

    const handleNewTagVisibilityChange = event => {
        setNewTagVisibility(event.target.value)
    }

    useEffect(() => {
        setInputValue('')
    }, [tags])

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
        setInputValue(event.target.value.replace(' ', '-').replace(forbiddenCharsRegex, ""))
    }

    const handleAdd = tag => {
        handleTagAdd(tag, newTagVisibility === 'public')
    }

    const renderChip = ({ value, text, chip, isDisabled, isReadOnly, handleDelete, className }, key) => (
        <TagTooltip key={key} chip={chip}>
            <Chip
                icon={chip.user === whoAmI.username && !specialTagsList.includes(chip.tag) ?
                    <Tooltip title={`make ${chip.public ? 'private' : 'public'}`}>
                        <IconButton
                            size="small"
                            onClick={handleTagLockClick(chip)}
                        >
                            {chip.public ? <LockOpen /> : <Lock />}
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
        </TagTooltip>
    )

    return (
        tagsLoading ? <Loading /> :
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
                    onAdd={handleAdd}
                    onDelete={handleTagDelete}
                    disabled={tagsLocked}
                    chipRenderer={renderChip}
                    newChipKeys={['Enter']}
                    newChipKeyCodes={[13]}
                    inputValue={inputValue}
                    onUpdateInput={handleTagInputUpdate}
                    placeholder="no tags, start typing to add"
                    fullWidth
                />

                <Grid container className={classes.buttons} justify="flex-end">
                    <Grid item>
                        <FormControl size="small" color="primary" variant="outlined">
                            <Select
                                value={newTagVisibility}
                                onChange={handleNewTagVisibilityChange}
                            >
                                <MenuItem value="public">Public</MenuItem>
                                <MenuItem value="private">Private</MenuItem>
                            </Select>
                        </FormControl>
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
                                <Grid item className={classes.tag} key={key}>
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
