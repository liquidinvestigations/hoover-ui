import { DateTime } from 'luxon'
import { Box, Tooltip } from '@mui/material'
import { useSharedStore } from '../SharedStoreProvider'
import { formatDateTime } from '../../utils'

export const TagTooltip = ({ chip, count, children }) => {
    const { user } = useSharedStore()

    return (
        <Tooltip
            placement="top"
            title={
                <>
                    <Box>
                        <strong>Created on:</strong> {formatDateTime(chip.date_created)}
                    </Box>
                    <Box>
                        {chip.date_indexed ? (
                            <>
                                Indexed in
                                <strong>{DateTime.fromISO(chip.date_indexed).diff(DateTime.fromISO(chip.date_modified)).toFormat(' s.SSS ')}</strong>
                                seconds
                            </>
                        ) : (
                            'Not indexed yet'
                        )}
                    </Box>
                    <Box>
                        {chip.user === user.username ? (
                            <>Tagged by you</>
                        ) : (
                            <>
                                Tagged by user <i>{chip.user}</i>
                            </>
                        )}
                    </Box>
                    {count > 1 && <Box>...and {count - 1} other(s)</Box>}
                </>
            }>
            {children}
        </Tooltip>
    )
}
