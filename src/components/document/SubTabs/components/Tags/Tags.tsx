import { AutocompleteChangeReason, AutocompleteInputChangeReason } from '@mui/base/AutocompleteUnstyled/useAutocomplete'
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
    Typography,
} from '@mui/material'
import { blue } from '@mui/material/colors'
import { SelectChangeEvent } from '@mui/material/Select/SelectInput'
import { T, useTranslate } from '@tolgee/react'
import { observer } from 'mobx-react-lite'
import { cloneElement, FC, ReactElement, SyntheticEvent, useEffect, useMemo, useState } from 'react'

import { buildUrl, fetchJson } from '../../../../../backend/api'
import { tooltips } from '../../../../../constants/help'
import { reactIcons } from '../../../../../constants/icons'
import { specialTagsList } from '../../../../../constants/specialTags'
import { Tag } from '../../../../../stores/TagsStore'
import { Aggregations, Bucket, CollectionData } from '../../../../../Types'
import { getTagIcon } from '../../../../../utils/utils'
import { Loading } from '../../../../common/Loading/Loading'
import { useSharedStore } from '../../../../SharedStoreProvider'
import { ToolbarLink } from '../../../Toolbar/Toolbar'

import { useStyles } from './Tags.styles'
import { TagTooltip } from './TagTooltip'

const forbiddenCharsRegex = /[^a-z0-9_!@#$%^&*()-=+:,./?]/gi

export const getChipColor = (chip: Tag) => (chip.public ? blue[200] : undefined)

export const Tags: FC<{ toolbarButtons: ToolbarLink[] }> = observer(({ toolbarButtons }) => {
    const { t } = useTranslate()
    const { classes, cx } = useStyles()
    const {
        user,
        printMode,
        collectionsData,
        documentStore: { digestUrl },
        tagsStore: { tags, tagsLocked, tagsLoading, tagsError, handleTagAdd, handleTagDelete, handleTagLockClick },
    } = useSharedStore()

    const [tagsAggregations, setTagsAggregations] = useState<Aggregations>()
    const [tagsAggregationsLoading, setTagsAggregationsLoading] = useState(false)
    const handleInputFocus = () => {
        ;(async () => {
            if (!tagsAggregations) {
                setTagsAggregationsLoading(true)

                try {
                    const results = await fetchJson<{ aggregations: Aggregations }>(buildUrl('search'), {
                        method: 'POST',
                        body: JSON.stringify({
                            type: 'aggregations',
                            fieldList: ['tags', 'priv-tags'],
                            collections: collectionsData?.map((c: CollectionData) => c.name),
                        }),
                    })

                    setTagsAggregations(results.aggregations)
                    setTagsAggregationsLoading(false)
                } catch (error: any) {
                    if (error.name !== 'AbortError') {
                        setTagsAggregations(undefined)
                        setTagsAggregationsLoading(false)
                    }
                }
            }
        })()
    }

    const [inputValue, setInputValue] = useState('')
    const [newTagVisibility, setNewTagVisibility] = useState('public')

    const handleNewTagVisibilityChange = (event: SelectChangeEvent) => {
        setNewTagVisibility(event.target.value)
    }

    useEffect(() => {
        setInputValue('')
    }, [tags])

    const otherUsersTags = useMemo(() => {
        const usersTags = {} as { [key: string]: Tag[] }
        tags.forEach((tag) => {
            if (tag.user !== user?.username) {
                if (!usersTags[tag.user]) {
                    usersTags[tag.user] = []
                }
                usersTags[tag.user].push(tag)
            }
        })
        return Object.entries(usersTags)
    }, [tags, user])

    if (tagsError) {
        return (
            <Typography color="error" className={classes.error}>
                Error: Request to <a href={tagsError.url}>{tagsError.url}</a> returned HTTP {tagsError.status} {tagsError.statusText}
            </Typography>
        )
    }

    if (!digestUrl) {
        return null
    }

    const simpleTags = (tags: Tag[]) => (
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

                {otherUsersTags.map(([user, tags], index) => (
                    <Box key={index} my={3} pb={0.7}>
                        <Typography variant="subtitle2" className={classes.otherTagsInfo}>
                            Public tags from <i>{user}</i>:
                        </Typography>

                        {simpleTags(tags)}
                    </Box>
                ))}
            </>
        )
    }

    const handleInputChange = (event: SyntheticEvent, value: string, reason: AutocompleteInputChangeReason) => {
        if (reason === 'input') {
            setInputValue(value.replace(' ', '-').replace(forbiddenCharsRegex, ''))
        }
    }

    const handleChange = (event: SyntheticEvent, value: any[], reason: AutocompleteChangeReason) => {
        switch (reason) {
            case 'createOption':
                value.forEach((tag) => {
                    if (typeof tag === 'string') {
                        handleTagAdd(tag, newTagVisibility === 'public')
                    }
                })
                break

            case 'selectOption':
                value.forEach((tag) => {
                    if (tag.key) {
                        handleTagAdd(tag.key, newTagVisibility === 'public')
                    }
                })
                break

            case 'removeOption':
                tagsValue.forEach((tag) => {
                    if (!value.includes(tag)) {
                        handleTagDelete(tag)
                    }
                })
                break
        }
    }

    const tagsValue = tags.filter((tag) => tag.user === user?.username)

    const options =
        newTagVisibility === 'public'
            ? (tagsAggregations?.tags?.values?.buckets as unknown as Tag[])
            : (tagsAggregations?.['priv-tags']?.values?.buckets as unknown as Tag[])

    return tagsLoading ? (
        <Loading />
    ) : (
        <>
            <ButtonGroup className={classes.toolbarButtons}>
                {toolbarButtons &&
                    toolbarButtons.map(({ tooltip, label, icon, ...props }, index) => (
                        <Tooltip title={tooltip} key={index}>
                            <Button className={classes.toolbarButton} size="small" component="a" endIcon={icon} {...props}>
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
                        getOptionDisabled={(option) =>
                            tagsValue
                                .filter((tag) => (newTagVisibility === 'public' ? tag.public : !tag.public))
                                .map((tag) => tag.tag)
                                .includes(option.key)
                        }
                        getOptionLabel={(option) => (option as unknown as Bucket).key}
                        renderOption={(props, option) => (
                            <span {...props} className={cx(props.className, classes.option)}>
                                <span>{option.key}</span>
                                <span className={classes.optionCount}>{(option as unknown as Bucket).doc_count}</span>
                            </span>
                        )}
                        loading={tagsAggregationsLoading}
                        renderTags={(value, getTagProps) =>
                            value.map((chip, index) => (
                                <TagTooltip key={index} chip={chip}>
                                    <Chip
                                        label={
                                            !!getTagIcon(chip.tag, chip.public) ? (
                                                <>
                                                    {cloneElement(getTagIcon(chip.tag, chip.public) as ReactElement, {
                                                        style: {
                                                            ...(getTagIcon(chip.tag, chip.public) as ReactElement).props.style,
                                                            marginLeft: -8,
                                                            marginRight: 4,
                                                            verticalAlign: 'middle',
                                                        },
                                                    })}
                                                    <span style={{ verticalAlign: 'middle' }}>{chip.tag}</span>
                                                </>
                                            ) : (
                                                chip.tag
                                            )
                                        }
                                        icon={
                                            chip.user === user?.username && !specialTagsList.includes(chip.tag) ? (
                                                <Tooltip title={`make ${chip.public ? 'private' : 'public'}`}>
                                                    <IconButton size="small" onClick={handleTagLockClick(chip)}>
                                                        {chip.public ? reactIcons.publicTag : reactIcons.privateTag}
                                                    </IconButton>
                                                </Tooltip>
                                            ) : undefined
                                        }
                                        style={{ backgroundColor: getChipColor(chip) }}
                                        {...getTagProps({ index })}
                                    />
                                </TagTooltip>
                            ))
                        }
                        inputValue={inputValue}
                        onInputChange={handleInputChange}
                        renderInput={(params) => (
                            <TextField
                                variant="standard"
                                {...params}
                                placeholder={t('tag_add_placeholder', '{tagsCount, plural, =0 {no tags, } other {}}start typing to add', {
                                    tagsCount: tagsValue.length,
                                })}
                                InputProps={{
                                    ...params.InputProps,
                                    endAdornment: (
                                        <>
                                            {tagsAggregationsLoading ? <CircularProgress color="inherit" size={20} /> : null}
                                            {params.InputProps.endAdornment}
                                        </>
                                    ),
                                    onFocus: handleInputFocus,
                                    onBlur: () => false,
                                }}
                            />
                        )}
                        onChange={handleChange}
                    />
                </Grid>

                <Grid item style={{ marginLeft: 20 }}>
                    <Tooltip classes={{ tooltip: classes.noMaxWidth }} title={tooltips.tags}>
                        {cloneElement(reactIcons.help, { className: classes.help })}
                    </Tooltip>
                </Grid>
            </Grid>

            <Grid container className={classes.buttons} justifyContent="flex-end">
                <Grid item>
                    <FormControl size="small" color="primary" variant="outlined">
                        <Select variant="standard" value={newTagVisibility} onChange={handleNewTagVisibilityChange}>
                            <MenuItem value="public">
                                <T keyName="public">Public</T>
                            </MenuItem>
                            <MenuItem value="private">
                                <T keyName="private">Private</T>
                            </MenuItem>
                        </Select>
                    </FormControl>
                </Grid>
            </Grid>

            {otherUsersTags.map(([user, tags], index) => (
                <Box key={index} my={3} pb={0.7} className={classes.otherTags}>
                    <Typography variant="subtitle2" className={classes.otherTagsInfo}>
                        Public tags from <i>{user}</i>:
                    </Typography>

                    <Grid container>
                        {tags.map((chip, key) => (
                            <Grid item className={classes.tag} key={key}>
                                <TagTooltip key={key} chip={chip}>
                                    <Chip
                                        label={
                                            !!getTagIcon(chip.tag, chip.public) ? (
                                                <>
                                                    {cloneElement(getTagIcon(chip.tag, chip.public) as ReactElement, {
                                                        style: {
                                                            ...(getTagIcon(chip.tag, chip.public) as ReactElement).props.style,
                                                            marginLeft: -8,
                                                            marginRight: 4,
                                                            verticalAlign: 'middle',
                                                        },
                                                    })}
                                                    <span style={{ verticalAlign: 'middle' }}>{chip.tag}</span>
                                                </>
                                            ) : (
                                                chip.tag
                                            )
                                        }
                                        icon={
                                            !specialTagsList.includes(chip.tag) ? (
                                                <Tooltip title={`make ${chip.public ? 'private' : 'public'}`}>
                                                    <IconButton size="small">{chip.public ? reactIcons.publicTag : reactIcons.privateTag}</IconButton>
                                                </Tooltip>
                                            ) : undefined
                                        }
                                        style={{
                                            pointerEvents: 'none',
                                            backgroundColor: getChipColor(chip),
                                        }}
                                    />
                                </TagTooltip>
                            </Grid>
                        ))}
                    </Grid>
                </Box>
            ))}
        </>
    )
})
