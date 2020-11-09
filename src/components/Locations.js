import React, { useEffect } from 'react'
import { connect } from 'react-redux';
import Link from "next/link";
import url from 'url';
import path from 'path';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import Typography from '@material-ui/core/Typography';
import Folder from '@material-ui/icons/Folder';
import Loading from './Loading';
import { fetchDocLocations } from '../actions';

function Locations({ url: docUrl, data, dispatch, locations, locationsPage,
                       locationsHasNextPage, isFetchingLocationsPage }) {

    const fetch = (pageIndex = 1) => dispatch(fetchDocLocations(docUrl, { pageIndex }))

    const loadMore = event => {
        event.preventDefault()
        fetch(locationsPage + 1)
    }

    useEffect(() => {
        fetch()
    }, [docUrl])

    if (!locations.length && data.has_locations) {
        return <Loading />;
    } else if (!locations.length) {
        return null;
    }

    const baseUrl = url.resolve(docUrl, './');
    const basePath = url.parse(baseUrl).pathname;

    return (
        <>
            <List component="nav" dense>
                <ListItem dense>
                    <Typography variant="h6">Locations</Typography>
                </ListItem>

                {locations.length && (
                    <>
                        {locations.map(loc => (
                            <Link key={loc.id} href={`${basePath}${loc.id}`}>
                                <a>
                                    <ListItem button>
                                        <ListItemIcon>
                                            <Folder />
                                        </ListItemIcon>

                                        <Typography classes={{}}>
                                            {path.normalize(loc.parent_path)}/<em>{loc.filename}</em>
                                        </Typography>
                                    </ListItem>
                                </a>
                            </Link>
                        ))}
                    </>
                )}
                {locationsHasNextPage && <ListItem dense>
                    {isFetchingLocationsPage ? <Loading /> : <a href="#" onClick={loadMore}>load more...</a>}
                </ListItem>}
            </List>
        </>
    )
}

const mapStateToProps = ({ doc: {
    locations,
    locationsPage,
    locationsHasNextPage,
    isFetchingLocationsPage,
}}) => ({
    locations,
    locationsPage,
    locationsHasNextPage,
    isFetchingLocationsPage,
})

export default connect(mapStateToProps)(Locations)
