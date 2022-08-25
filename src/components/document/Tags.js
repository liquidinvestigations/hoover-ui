import React, { cloneElement, memo, useEffect, useMemo, useState } from 'react'
import {
    Autocomplete,
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
} from '@mui/material'
import { makeStyles } from '@mui/styles'
import { blue } from '@mui/material/colors'
import Loading from '../Loading'
import TagTooltip from './TagTooltip'
import { useDocument } from './DocumentProvider'
import { useTags } from './TagsProvider'
import { useUser } from '../UserProvider'
import { specialTagsList } from '../../constants/specialTags'
import { search as searchAPI } from '../../api'
import { tooltips } from '../../constants/help'
import { reactIcons } from '../../constants/icons'
import { getTagIcon } from '../../utils'

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
    help: {
        color: theme.palette.grey.A100,
    },
    noMaxWidth: {
        maxWidth: 'none',
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

export const getChipColor = chip => chip.public ? blue[200] : undefined

function Tags({ toolbarButtons }) {
    const classes = useStyles()
    const whoAmI = useUser()

    const {
        digestUrl, printMode, collections
    } = useDocument()

    const {
        tags, tagsLocked, tagsLoading, tagsError,
        handleTagAdd, handleTagDelete, handleTagLockClick
    } = useTags()

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
    }, [tags, whoAmI.username])

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

    return tagsLoading ? <Loading /> :
        <>
            <ButtonGroup className={classes.toolbarButtons}>
                {toolbarButtons && toolbarButtons.map(({tooltip, label, icon, ...props}, index) => (
                    <Tooltip title={tooltip} key={index}>
                        <Button
                            className={classes.toolbarButton}
                            size="small"
                            component="a"
                            endIcon={icon}
                            {...props}>
                            {label}
                        </Button>
                    </Tooltip>
                ))}
            </ButtonGroup>

            <Grid container justifyContent="space-between">
                <Grid item style={{ flex: 1 }}>
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
                                        label={ !!getTagIcon(chip.tag, chip.public) ?
                                            <>
                                                {cloneElement(getTagIcon(chip.tag, chip.public), {
                                                    style: {
                                                        ...getTagIcon(chip.tag, chip.public).props.style,
                                                        marginLeft: -8,
                                                        marginRight: 4,
                                                        verticalAlign: 'middle',
                                                    }
                                                })}
                                                <span style={{ verticalAlign: 'middle' }}>
                                                            {chip.tag}
                                                        </span>
                                            </> : chip.tag
                                        }
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
                                variant="standard"
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
                                }} />
                        )}
                        onChange={handleChange}
                    />
                </Grid>

                <Grid item style={{ marginLeft: 20 }}>
                    <Tooltip
                        interactive="true"
                        classes={{ tooltip: classes.noMaxWidth }}
                        title={tooltips.tags}
                    >
                        {React.cloneElement(reactIcons.help, { className: classes.help })}
                    </Tooltip>
                </Grid>
            </Grid>

            <Grid container className={classes.buttons} justifyContent="flex-end">
                <Grid item>
                    <FormControl size="small" color="primary" variant="outlined">
                        <Select
                            variant="standard"
                            value={newTagVisibility}
                            onChange={handleNewTagVisibilityChange}>
                            <MenuItem value="public">Public</MenuItem>
                            <MenuItem value="private">Private</MenuItem>
                        </Select>
                    </FormControl>
                </Grid>
            </Grid>

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
                                        label={ !!getTagIcon(chip.tag, chip.public) ?
                                            <>
                                                {cloneElement(getTagIcon(chip.tag, chip.public), {
                                                    style: {
                                                        ...getTagIcon(chip.tag, chip.public).props.style,
                                                        marginLeft: -8,
                                                        marginRight: 4,
                                                        verticalAlign: 'middle',
                                                    }
                                                })}
                                                <span style={{ verticalAlign: 'middle' }}>
                                                    {chip.tag}
                                                </span>
                                            </> : chip.tag
                                        }
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
        </>;
}

export default memo(Tags)
