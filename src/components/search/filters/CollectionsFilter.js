import { memo } from 'react'
import Highlighter from 'react-highlight-words'
import { makeStyles } from '@mui/styles'
import { Checkbox, List, ListItem, ListItemText, Typography } from '@mui/material'
import { formatThousands } from '../../../utils'

const useStyles = makeStyles((theme) => ({
    checkbox: {
        padding: 5,
    },
    label: {
        margin: 0,
    },
    progress: {
        fontSize: '7.5pt',
    },
    docCount: {
        flex: '1 0 auto',
        paddingLeft: 6,
    },
}))

function CollectionsFilter({ collections, selected, changeSelection, counts, search = '' }) {
    const classes = useStyles()

    const handleChange = (name) => () => {
        const selection = new Set(selected || [])

        if (selection.has(name)) {
            selection.delete(name)
        } else {
            selection.add(name)
        }

        changeSelection(Array.from(selection))
    }

    const handleAllChange = () => {
        if (collections.length === selected.length) {
            changeSelection([])
        } else {
            changeSelection(collections.map((c) => c.name))
        }
    }

    return (
        <List dense disablePadding>
            {!collections?.length ? (
                <Typography>no collections available</Typography>
            ) : (
                <>
                    {collections
                        .filter((collection) => collection.name.includes(search))
                        .map((collection) => (
                            <ListItem key={collection.name} role={undefined} dense button onClick={handleChange(collection.name)}>
                                <Checkbox
                                    size="small"
                                    tabIndex={-1}
                                    disableRipple
                                    classes={{ root: classes.checkbox }}
                                    checked={selected.includes(collection.name)}
                                    onChange={handleChange(collection.name)}
                                />

                                <ListItemText
                                    primary={
                                        !search.length ? (
                                            collection.name
                                        ) : (
                                            <Highlighter searchWords={[search]} autoEscape={true} textToHighlight={collection.name} />
                                        )
                                    }
                                    secondary={collection.stats.progress_str}
                                    className={classes.label}
                                    secondaryTypographyProps={{
                                        className: classes.progress,
                                    }}
                                />

                                <ListItemText
                                    primary={
                                        <Typography variant="caption">
                                            {counts && counts[collection.name] && formatThousands(counts[collection.name])}
                                        </Typography>
                                    }
                                    className={classes.docCount}
                                    disableTypography
                                    align="right"
                                />
                            </ListItem>
                        ))}
                    {collections.length > 1 && (
                        <ListItem dense button onClick={handleAllChange}>
                            <Checkbox
                                size="small"
                                tabIndex={-1}
                                disableRipple
                                classes={{ root: classes.checkbox }}
                                checked={collections.length === selected.length}
                                onChange={handleAllChange}
                            />

                            <ListItemText primary="Select all" />
                        </ListItem>
                    )}
                </>
            )}
        </List>
    )
}

export default memo(CollectionsFilter)
