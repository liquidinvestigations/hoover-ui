import { Checkbox, Fab, FormControlLabel, Grid } from '@mui/material'
import { useTranslate } from '@tolgee/react'
import { observer } from 'mobx-react-lite'

import { reactIcons } from '../../../constants/icons'
import { DEDUPLICATE_OPTIONS } from '../../../consts'
import { useSharedStore } from '../../SharedStoreProvider'
import { SearchFields } from '../filters/SearchFields/SearchFields'
import { SortingChips } from '../sorting/SortingChips/SortingChips'
import { SortingMenu } from '../sorting/SortingMenu/SortingMenu'

import { useStyles } from './SearchViewOptions.style'

export const SearchViewOptions = observer(() => {
    const { t } = useTranslate()
    const { classes } = useStyles()
    const {
        fields,
        searchStore: {
            query,
            searchViewStore: { resultsViewType, setResultsViewType, toggleDateDetails, showDateInsights, handleDeduplicateResults, handleUnifyResults },
        },
    } = useSharedStore()

    return (
        <>
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
                    <FormControlLabel
                        control={
                            <Checkbox
                                size="small"
                                tabIndex={-1}
                                disableRipple
                                checked={query?.dedup_results === DEDUPLICATE_OPTIONS.hide}
                                indeterminate={query?.dedup_results === DEDUPLICATE_OPTIONS.mark}
                                onClick={handleDeduplicateResults}
                            />
                        }
                        label={t('dedup_results', 'Deduplicate results')}
                    />
                </Grid>
                <Grid item>
                    <FormControlLabel
                        control={<Checkbox size="small" tabIndex={-1} disableRipple checked={!!query?.unify_results} onClick={handleUnifyResults} />}
                        label={t('unify_results', 'Unify results')}
                    />
                </Grid>
                <Grid item>
                    <Grid container spacing={0.5}>
                        <Grid item>
                            <Fab
                                size="small"
                                color={showDateInsights ? 'primary' : 'default'}
                                className={classes.viewTypeIcon}
                                onClick={toggleDateDetails}>
                                {reactIcons.categoryDates}
                            </Fab>
                        </Grid>
                        {fields?.all && (
                            <Grid item>
                                <SearchFields />
                            </Grid>
                        )}
                        <Grid item>
                            <SortingMenu />
                        </Grid>
                    </Grid>
                </Grid>
            </Grid>
            <Grid container justifyContent="end" mt={1}>
                <SortingChips />
            </Grid>
        </>
    )
})
