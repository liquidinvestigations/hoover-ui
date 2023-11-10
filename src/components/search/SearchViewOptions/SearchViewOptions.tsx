import { Fab, Grid } from '@mui/material'
import { observer } from 'mobx-react-lite'

import { reactIcons } from '../../../constants/icons'
import { useSharedStore } from '../../SharedStoreProvider'
import { SearchFields } from '../filters/SearchFields/SearchFields'
import { SortingChips } from '../sorting/SortingChips/SortingChips'
import { SortingMenu } from '../sorting/SortingMenu/SortingMenu'

import { useStyles } from './SearchViewOptions.style'

export const SearchViewOptions = observer(() => {
    const { classes } = useStyles()
    const {
        fields,
        searchStore: {
            searchViewStore: { resultsViewType, setResultsViewType, toggleDateDetails, showDateInsights },
        },
    } = useSharedStore()

    return (
        <Grid container justifyContent="space-between" mt={1}>
            <Grid item>
                <Grid container spacing={0.5}>
                    <Grid item>
                        <Fab
                            size="small"
                            color={resultsViewType === 'list' ? 'primary' : 'default'}
                            className={classes.viewTypeIcon}
                            onClick={() => setResultsViewType('list')}>
                            {reactIcons.listView}
                        </Fab>
                    </Grid>
                    <Grid item>
                        <Fab
                            size="small"
                            color={resultsViewType === 'table' ? 'primary' : 'default'}
                            className={classes.viewTypeIcon}
                            onClick={() => setResultsViewType('table')}>
                            {reactIcons.tableView}
                        </Fab>
                    </Grid>
                </Grid>
            </Grid>
            <Grid item>
                <Grid container spacing={0.5}>
                    <Grid item>
                        <Fab size="small" color={showDateInsights ? 'primary' : 'default'} className={classes.viewTypeIcon} onClick={toggleDateDetails}>
                            {reactIcons.categoryDates}
                        </Fab>
                    </Grid>
                    {fields?.all && (
                        <Grid item>
                            <SearchFields />
                        </Grid>
                    )}
                    <Grid item>
                        <SortingChips />
                        <SortingMenu />
                    </Grid>
                </Grid>
            </Grid>
        </Grid>
    )
})
