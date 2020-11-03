import { Component } from 'react';
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

class Locations extends Component {
    componentDidMount() {
        this.fetch();
    }

    componentDidUpdate(prevProps, prevState) {
        if (prevProps.url !== this.props.url) {
            this.fetch();
        }
    }

    fetch() {
        const { url: docUrl, data, dispatch } = this.props;
        dispatch(fetchDocLocations(docUrl));
    }

    render() {
        const { url: docUrl, data, locations } = this.props;

        if (!locations.length && data.has_locations) {
            return <Loading />;
        } else if (!locations.length) {
            return null;
        }

        const baseUrl = url.resolve(docUrl, './');
        const basePath = url.parse(baseUrl).pathname;

        return (
            <div>
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
                </List>
            </div>
        );
    }
}

const mapStateToProps = ({ doc: { locations } }) => ({ locations });
export default connect(mapStateToProps)(Locations);
