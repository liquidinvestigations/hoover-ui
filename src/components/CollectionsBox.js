import React from 'react'
import { makeStyles } from '@material-ui/core/styles'
import { Checkbox, FormControlLabel, FormGroup, ListItem, Typography } from '@material-ui/core'
import { formatThousands } from '../utils'
import Loading from './Loading'

const useStyles = makeStyles(theme => ({
    root: {
        display: 'flex',
    },
    formControlLabel: {
        width: '100%',
    },
    progress: {
        color: '#999',
        'font-size': '7.5pt',
    },
}))

export default function CollectionsBox({ loading, collections, selected, changeSelection, counts }) {
    const classes = useStyles()

    const handleChange = event => {
        const { name, checked } = event.target
        let newSelection
        if (checked) {
            newSelection = [...selected, name]
        } else {
            newSelection = selected.filter(c => c !== name);
        }
        changeSelection(newSelection)
    }

    const handleAllChange = event => {
        if (event.target.checked) {
            changeSelection(collections.map(c => c.name))
        } else {
            changeSelection([])
        }
    }

    const collectionLabel = collection => {
        let collectionCount = ''
        if (counts && counts[collection.name]) {
            collectionCount = formatThousands(counts[collection.name])
        }
        return (
            <>
                <span>
                    {collection.title}
                    {' '}
                    {collectionCount}
                </span>
                <br/>
                <i className={classes.progress}>
                    {collection.stats.progress_str}
                </i>
            </>
        )
    }

    return (
        <ListItem dense>
            <FormGroup>
                {loading ? <Loading /> :
                    !collections?.length ? <Typography>no collections available</Typography> :
                        <>
                            {collections.length > 1 &&
                                <FormControlLabel
                                    className={classes.formControlLabel}
                                    control={
                                        <Checkbox
                                            checked={collections.every(c => selected.includes(c.name))}
                                            onChange={handleAllChange}
                                        />
                                    }
                                    label="All"
                                />
                            }
                            {collections.map(collection =>
                                <FormControlLabel
                                    key={collection.name}
                                    className={classes.formControlLabel}
                                    control={
                                        <Checkbox
                                            name={collection.name}
                                            checked={selected.includes(collection.name)}
                                            onChange={handleChange}
                                        />
                                    }
                                    label={collectionLabel(collection)}
                                />
                            )}
                        </>
                }
            </FormGroup>
        </ListItem>
    )
}
