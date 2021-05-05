import React, { memo } from 'react'
import { makeStyles } from '@material-ui/core/styles'
import { Checkbox, List, ListItem, ListItemText, Typography } from '@material-ui/core'
import { formatThousands } from '../../../utils'

const useStyles = makeStyles(theme => ({
    checkbox: {
        padding: 5,
    },
    label: {
        margin: 0,
    },
    progress: {
        fontSize: '7.5pt',
    },
}))

function CollectionsFilter({ collections, selected, changeSelection, counts }) {
    const classes = useStyles()

    const handleChange = name => () => {
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
            changeSelection(collections.map(c => c.name))
        }
    }

    return (
        <List dense disablePadding>
            {!collections?.length ? <Typography>no collections available</Typography> :
                <>
                    {collections.map(collection =>
                        <ListItem
                            key={collection.name}
                            role={undefined}
                            dense
                            button
                            onClick={handleChange(collection.name)}
                        >
                            <Checkbox
                                size="small"
                                tabIndex={-1}
                                disableRipple
                                classes={{ root: classes.checkbox }}
                                checked={selected.includes(collection.name)}
                                onChange={handleChange(collection.name)}
                            />

                            <ListItemText
                                primary={collection.name}
                                secondary={collection.stats.progress_str}
                                className={classes.label}
                                secondaryTypographyProps={{
                                    className: classes.progress
                                }}
                            />

                            <ListItemText
                                primary={
                                    <Typography variant="caption">
                                        {counts && counts[collection.name] &&
                                            formatThousands(counts[collection.name])
                                        }
                                    </Typography>
                                }
                                disableTypography
                                align="right"
                            />
                        </ListItem>
                    )}
                    {collections.length > 1 &&
                        <ListItem
                            dense
                            button
                            onClick={handleAllChange}
                        >
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
                    }
                </>
            }
        </List>
    )
}

export default memo(CollectionsFilter)
