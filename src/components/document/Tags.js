import React, { memo, useEffect, useMemo, useState } from 'react'
import {
    Box,
    Button,
    ButtonGroup,
    Chip,
    CircularProgress,
    FormControl,
    Grid,
    IconButton,
    MenuItem,
    Select,
    TextField,
    Tooltip,
    Typography
} from '@material-ui/core'
import { Autocomplete } from '@material-ui/lab'
import { makeStyles } from '@material-ui/core/styles'
import { blue } from '@material-ui/core/colors'
import Loading from '../Loading'
import TagTooltip from './TagTooltip'
import { useUser } from '../UserProvider'
import { useDocument } from './DocumentProvider'
import { specialTags, specialTagsList } from '../../constants/specialTags'
import { search as searchAPI } from '../../api'
import { reactIcons } from '../../constants/icons'

const forbiddenCharsRegex = /[^a-z0-9_!@#$%^&*()-=+:,./?]/gi

const useStyles = makeStyles(theme => ({
    error: {
        padding: theme.spacing(1),
        fontSize: '14px',

        '& a': {
            color: theme.palette.error.main,
        }
    },
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
    },
    option: {
        width: '100%',
        display: 'inline-flex',
        justifyContent: 'space-between',
    },
    optionCount: {
        color: theme.palette.grey[500],
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
        digestUrl, printMode, tags, tagsLocked, tagsLoading, tagsError,
        handleTagAdd, handleTagDelete, handleTagLockClick, collections
    } = useDocument()

    const [tagsAggregations, setTagsAggregations] = useState()
    const [tagsAggregationsLoading, setTagsAggregationsLoading] = useState(false)
    const handleInputFocus = () => {
        if (!tagsAggregations) {
            setTagsAggregationsLoading(true)

            searchAPI({
                type: 'aggregations',
                fieldList: ['tags', 'priv-tags'],
                collections: collections.map(c => c.name),
            }).then(results => {
                setTagsAggregations(results.aggregations)
                setTagsAggregationsLoading(false)
            }).catch(error => {
                if (error.name !== 'AbortError') {
                    setTagsAggregations(null)
                    setTagsAggregationsLoading(false)
                }
            })
        }
    }

    useEffect(() => {
        return () => {
            searchAPI({
                type: 'aggregations',
                fieldList: ['tags', 'priv-tags'],
                cancel: true
            }).catch(() => {})
        }
    }, [])

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

    if (tagsError) {
        return (
            <Typography color="error" className={classes.error}>
                Error: Request to <a href={tagsError.url}>{tagsError.url}</a>{' '}
                returned HTTP {tagsError.status} {tagsError.statusText}
            </Typography>
        )
    }

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

    const handleInputChange = (event, value, reason) => {
        if (reason === 'input') {
            setInputValue(value.replace(' ', '-').replace(forbiddenCharsRegex, ""))
        }
    }

    const handleChange = (event, value, reason) => {
        switch(reason) {
            case 'create-option':
                value.forEach(tag => {
                    if (typeof tag === 'string') {
                        handleTagAdd(tag, newTagVisibility === 'public')
                    }
                })
                break

            case 'select-option':
                value.forEach(tag => {
                    if (tag.key) {
                        handleTagAdd(tag.key, newTagVisibility === 'public')
                    }
                })
                break

            case 'remove-option':
                tagsValue.forEach(tag => {
                    if (!value.includes(tag)) {
                        handleTagDelete(tag)
                    }
                })
                break
        }
    }

    const tagsValue = tags.filter(tag => tag.user === whoAmI.username)

    const options = newTagVisibility === 'public' ?
        tagsAggregations?.tags?.values?.buckets :
        tagsAggregations?.['priv-tags']?.values?.buckets

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

                <Autocomplete
                    multiple
                    freeSolo
                    fullWidth
                    disableClearable
                    value={tagsValue}
                    disabled={tagsLocked}
                    options={options || []}
                    getOptionDisabled={option => (
                        tagsValue
                            .filter(tag => newTagVisibility === 'public' ? tag.public : !tag.public)
                            .map(tag => tag.tag)
                            .includes(option.key)
                    )}
                    getOptionLabel={option => option.key}
                    renderOption={option => (
                        <span className={classes.option}>
                            <span>{option.key}</span>
                            <span className={classes.optionCount}>{option.doc_count}</span>
                        </span>
                    )}
                    loading={tagsAggregationsLoading}
                    renderTags={(value, getTagProps) =>
                        value.map((chip, index) => (
                            <TagTooltip key={index} chip={chip}>
                                <Chip
                                    label={chip.tag}
                                    icon={chip.user === whoAmI.username && !specialTagsList.includes(chip.tag) ?
                                        <Tooltip title={`make ${chip.public ? 'private' : 'public'}`}>
                                            <IconButton
                                                size="small"
                                                onClick={handleTagLockClick(chip)}
                                            >
                                                {chip.public ? reactIcons.publicTag : reactIcons.privateTag}
                                            </IconButton>
                                        </Tooltip> : null
                                    }
                                    style={{ backgroundColor: getChipColor(chip) }}
                                    {...getTagProps({ index })}
                                />
                            </TagTooltip>
                        ))
                    }
                    inputValue={inputValue}
                    onInputChange={handleInputChange}
                    renderInput={params => (
                        <TextField
                            {...params}
                            placeholder={(tagsValue.length === 0 ? 'no tags, ' : '') + 'start typing to add'}
                            InputProps={{
                                ...params.InputProps,
                                endAdornment: (
                                    <React.Fragment>
                                        {tagsAggregationsLoading ? <CircularProgress color="inherit" size={20} /> : null}
                                        {params.InputProps.endAdornment}
                                    </React.Fragment>
                                ),
                                onFocus: handleInputFocus
                            }}
                        />
                    )}
                    onChange={handleChange}
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
                                    <TagTooltip key={key} chip={chip}>
                                        <Chip
                                            label={chip.tag}
                                            icon={!specialTagsList.includes(chip.tag) ?
                                                <Tooltip title={`make ${chip.public ? 'private' : 'public'}`}>
                                                    <IconButton size="small">
                                                        {chip.public ? reactIcons.publicTag : reactIcons.privateTag}
                                                    </IconButton>
                                                </Tooltip> : null
                                            }
                                            style={{
                                                pointerEvents: 'none',
                                                backgroundColor: getChipColor(chip)
                                            }}
                                        />
                                    </TagTooltip>
                                </Grid>
                            )}
                        </Grid>
                    </Box>
                )}
            </>
    )
}

export default memo(Tags)
