import { Fab, Grid } from '@mui/material'
import { observer } from 'mobx-react-lite'
import { FC } from 'react'
import { makeStyles } from 'tss-react/mui'

import { reactIcons } from '../../constants/icons'
import { useSharedStore } from '../SharedStoreProvider'

import { ResultsGroup } from './ResultsGroup'

import type { Theme } from '@mui/material'

const useStyles = makeStyles()((theme: Theme) => ({
    viewTypeIcon: {
        flex: 'none',
        boxShadow: 'none',
        marginLeft: theme.spacing(2),
        marginTop: theme.spacing(1),
        marginBottom: theme.spacing(2),
    },
}))

export const Results: FC = observer(() => {
    const { classes } = useStyles()
    const {
        query,
        searchResultsStore: { resultsQueryTasks, viewType, setViewType },
    } = useSharedStore().searchStore

    return (
        <>
            <Grid container>
                <Grid item container justifyContent="flex-end">
                    <Grid item>
                        <Fab
                            size="small"
                            color={viewType === 'list' ? 'primary' : 'default'}
                            className={classes.viewTypeIcon}
                            onClick={() => setViewType('list')}>
                            {reactIcons.listView}
                        </Fab>
                    </Grid>
                    <Grid item>
                        <Fab
                            size="small"
                            color={viewType === 'table' ? 'primary' : 'default'}
                            className={classes.viewTypeIcon}
                            onClick={() => setViewType('table')}>
                            {reactIcons.tableView}
                        </Fab>
                    </Grid>
                </Grid>
            </Grid>

            {!query?.collections?.length ? (
                <i>no collections selected</i>
            ) : (
                Object.keys(resultsQueryTasks).map((collection) => <ResultsGroup collection={collection} key={collection} />)
            )}
        </>
    )
})
