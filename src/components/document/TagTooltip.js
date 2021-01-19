import React, { memo, useContext } from 'react'
import { DateTime } from 'luxon'
import { Box, Tooltip } from '@material-ui/core'
import { UserContext } from '../../../pages/_app'

function TagTooltip({ chip, count, children }) {
    const whoAmI = useContext(UserContext)

    return (
        <Tooltip
            placement="top"
            title={
                <>
                    <Box>
                        <strong>Created on:</strong>{' '}
                        {DateTime.fromISO(chip.date_created, { locale: 'en-US' })
                            .toLocaleString(DateTime.DATETIME_FULL)}
                    </Box>
                    <Box>
                        {chip.date_indexed ?
                            <>
                                Indexed in
                                <strong>
                                    {DateTime.fromISO(chip.date_indexed)
                                        .diff(DateTime.fromISO(chip.date_modified))
                                        .toFormat(' s.SSS ')}
                                </strong>
                                seconds
                            </>:
                            'Not indexed yet'
                        }
                    </Box>
                    <Box>
                        {chip.user === whoAmI.username ?
                            <>Tagged by you</> :
                            <>Tagged by user <i>{chip.user}</i></>
                        }
                    </Box>
                    {count > 1 && (
                        <Box>
                            ...and {count - 1} other(s)
                        </Box>
                    )}
                </>
            }
        >
            {children}
        </Tooltip>
    )
}

export default memo(TagTooltip)
