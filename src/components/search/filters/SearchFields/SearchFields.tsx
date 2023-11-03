import { Checkbox, Fab, Grid, ListItem, ListItemText, Popover } from '@mui/material'
import { observer } from 'mobx-react-lite'
import { FC, useRef } from 'react'

import { reactIcons } from '../../../../constants/icons'
import { useSharedStore } from '../../../SharedStoreProvider'

import { useStyles } from './SearchFields.styles'
import { chunkArray } from './utils'

export const SearchFields: FC = observer(() => {
    const { classes } = useStyles()
    const anchorEl = useRef<HTMLButtonElement>(null)
    const {
        user,
        fields,
        excludedFields,
        searchStore: {
            onFieldInclusionChange,
            searchViewStore: { searchFieldsOpen, setSearchFieldsOpen },
        },
    } = useSharedStore()
    const chunkSize = fields?.all ? Math.ceil(fields?.all.length / 4) : 10
    const chunkedFields = chunkArray(fields?.all || [], chunkSize)
    const toggleSearchFields = () => setSearchFieldsOpen(!searchFieldsOpen)

    return (
        <>
            <Fab ref={anchorEl} size="small" color="primary" onClick={toggleSearchFields} sx={{ boxShadow: 'none' }}>
                {reactIcons.searchFields}
            </Fab>
            <Popover
                anchorEl={anchorEl.current}
                open={searchFieldsOpen}
                onBlur={toggleSearchFields}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
                <Grid container padding={1}>
                    {chunkedFields.map((chunk, index) => (
                        <Grid item key={index}>
                            {chunk.map((field) => (
                                <ListItem key={field} role={undefined} dense button onClick={onFieldInclusionChange(field)}>
                                    <Checkbox
                                        size="small"
                                        tabIndex={-1}
                                        disableRipple
                                        value={field}
                                        checked
                                        indeterminate={excludedFields.includes(field)}
                                        classes={{ root: classes.checkbox }}
                                    />
                                    <ListItemText
                                        primary={field.replace(`.${user?.uuid}`, '')}
                                        primaryTypographyProps={{
                                            className: classes.label,
                                        }}
                                    />
                                </ListItem>
                            ))}
                        </Grid>
                    ))}
                </Grid>
            </Popover>
        </>
    )
})
