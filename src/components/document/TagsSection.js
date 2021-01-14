import React, { memo, useContext, useMemo, useState } from 'react'
import { DateTime } from 'luxon'
import ChipInput from 'material-ui-chip-input'
import { Box, Button, ButtonGroup, Chip, Grid, IconButton, Tooltip, Typography } from '@material-ui/core'
import { Lock, LockOpen } from '@material-ui/icons';
import { makeStyles } from '@material-ui/core/styles'
import { blue, brown, green, red } from '@material-ui/core/colors'
import Section from './Section'
import Loading from '../Loading'
import { UserContext } from '../../../pages/_app'
import { createTag, deleteTag, updateTag } from '../../backend/api'

const onlyAlphanumericRegex = /[^a-z0-9]/gi
const specialTags = ['important', 'seen', 'trash', 'interesting']
export const publicTags = ['interesting']

const useStyles = makeStyles(theme => ({
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
    }
}))

const getChipColor = chip => {
    if (chip.tag === 'seen') {
        return brown[200]
    } else if (chip.tag === 'trash') {
        return red[200]
    } else if (chip.tag === 'important') {
        return 'rgba(255,180,0,0.5)'
    } else if (chip.tag === 'interesting') {
        return green[200]
    } else if (chip.public) {
        return blue[200]
    }
}

function TagsSection({ loading, digestUrl, tags, onChanged, toolbarButtons, locked, onLocked }) {
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

    const handleTagInputUpdate = event => {
        setInputValue(event.target.value.replace(onlyAlphanumericRegex, ""))
    }

    const handleTagAdd = (tag, publicTag = false) => {
        onLocked(true)
        createTag(digestUrl, { tag, public: publicTags.includes(tag) || publicTag }).then(newTag => {
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
        <Tooltip placement="top" title={
            <>
                <Box>
                    <strong>Created on</strong>:{' '}
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
        }>
            <Chip
                key={key}
                icon={chip.user === whoAmI.username && !specialTags.includes(chip.tag) ? chip.public ?
                    <Tooltip title="Make private">
                        <IconButton
                            size="small"
                            onClick={handleClick(chip)}
                        >
                            <LockOpen />
                        </IconButton>
                    </Tooltip> :
                    <Tooltip title="Make public">
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
        <Section title="Tags" toolbarButtons={toolbarButtons}>
            {loading ? <Loading /> :
                <>
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
                        Changes to tags may take a minute to appear in search.
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
            }
        </Section>
    )
}

export default memo(TagsSection)
