import { Checkbox, ListItem, ListItemText } from '@mui/material'
import { duration } from '@mui/material/styles'
import { observer } from 'mobx-react-lite'
import { FC } from 'react'
import { Transition } from 'react-transition-group'

import { useSharedStore } from '../../../SharedStoreProvider'

import { useStyles } from './SearchFields.styles'

export const SearchFields: FC = observer(() => {
    const { classes, cx } = useStyles()
    const {
        user,
        fields,
        excludedFields,
        searchStore: {
            onFieldInclusionChange,
            searchViewStore: { searchFieldsOpen },
        },
    } = useSharedStore()

    return (
        <Transition
            in={searchFieldsOpen}
            timeout={{
                enter: duration.enteringScreen,
                exit: duration.leavingScreen,
            }}
        >
            {(state) => (
                <div
                    className={cx(classes.root, {
                        [classes.open]: state === 'entering' || state === 'entered',
                    })}
                >
                    {fields?.all.map((field) => (
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
                                primary={field.replace(`\.${user?.uuid}`, '')}
                                primaryTypographyProps={{
                                    className: classes.label,
                                }}
                            />
                        </ListItem>
                    ))}
                </div>
            )}
        </Transition>
    )
})
