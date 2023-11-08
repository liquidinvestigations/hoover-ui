import { Box, Chip, Typography } from '@mui/material'
import { T } from '@tolgee/react'
import { observer } from 'mobx-react-lite'

import { useSharedStore } from '../../../SharedStoreProvider'

export const ExcludedChips = observer(() => {
    const {
        excludedFields,
        searchStore: { onFieldInclusionChange },
    } = useSharedStore()

    return (
        <Box>
            <Typography my={1}>
                <T keyName="excluded">Excluded</T>
            </Typography>
            {excludedFields.map((field: string) => (
                <Chip size="small" variant="outlined" key={field} label={field} onDelete={onFieldInclusionChange(field)} />
            ))}
        </Box>
    )
})
