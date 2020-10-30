import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import Typography from '@material-ui/core/Typography';
import Folder from '@material-ui/icons/Folder';
import { Component } from 'react';
import url from 'url';
import Loading from './Loading';
import { fetchDocLocations } from '../actions';
import { connect } from 'react-redux';

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

                    {locations.length > 1 && (
                        <>
                            {locations.map((loc, index) => (
                                <a
                                    href={`${basePath}${loc.id}`}
                                    target='_blank'
                                    key={index}
                                >
                                    <ListItem button>
                                        <ListItemIcon>
                                            <Folder />
                                        </ListItemIcon>

                                        <Typography classes={{}}>
                                            {loc.parent_path}/<em>{loc.filename}</em>
                                        </Typography>
                                    </ListItem>
                                </a>
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
