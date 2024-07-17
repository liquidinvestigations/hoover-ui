import { Box, Checkbox, Fab, ListItem, ListItemText, Popover, Typography } from '@mui/material'
import { observer } from 'mobx-react-lite'
import { FC, useRef } from 'react'

import { reactIcons } from '../../../../constants/icons'
import { SourceField } from '../../../../Types'
import { useSharedStore } from '../../../SharedStoreProvider'

import { useStyles } from './SearchFields.styles'
import { getSearchFields } from './utils'

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
    const toggleSearchFields = () => setSearchFieldsOpen(!searchFieldsOpen)
    const searchFields = getSearchFields(fields!.all as SourceField[])

    return (
        <>
            <Fab ref={anchorEl} size="small" color="primary" onClick={toggleSearchFields} sx={{ boxShadow: 'none' }}>
                {reactIcons.searchFields}
            </Fab>
            <Popover
                anchorEl={anchorEl.current}
                open={searchFieldsOpen}
                onBlur={toggleSearchFields}
                disableEnforceFocus
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
                PaperProps={{ style: { height: '50vh', padding: 8 } }}>
                {searchFields.map(({ label, icon, filters }) =>
                    filters.map((field, index) => (
                        <Box key={field}>
                            {!index && (
                                <Box alignItems="center" display="flex" gap={0.5} mt={1}>
                                    {reactIcons[icon]}
                                    <Typography>{label}</Typography>
                                </Box>
                            )}
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
                        </Box>
                    )),
                )}
            </Popover>
        </>
    )
})
