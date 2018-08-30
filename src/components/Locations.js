import url from 'url';
import { Component, Fragment } from 'react';
import api from '../api';
import Loading from './Loading';
import { formatThousands } from '../utils';

import Link from 'next/link';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import Typography from '@material-ui/core/Typography';
import Tooltip from '@material-ui/core/Tooltip';
import IconButton from '@material-ui/core/IconButton';

import IconArrowUpward from '@material-ui/icons/ArrowUpward';
import Folder from '@material-ui/icons/Folder';
import Attachment from '@material-ui/icons/Attachment';
import LinkOff from '@material-ui/icons/LinkOff';
import IconCloudDownload from '@material-ui/icons/CloudDownloadOutlined';

export default class Locations extends Component {
    state = { locations: [] };

    async componentDidMount() {
        const { url: docUrl, data } = this.props;

        if (data.parent_id && data.has_locations) {
            // TODO: move to redux
            this.setState({
                locations: await api.locationsFor(docUrl).then(d => d.locations),
            });
        }
    }

    render() {
        const { locations } = this.state;
        const { url: docUrl, data } = this.props;

        if (!locations && data.has_locations) {
            return <Loading />;
        }

        const baseUrl = url.resolve(docUrl, './');
        const basePath = url.parse(baseUrl).pathname;
        const children = data.children || [];

        return (
            <div>
                <List component="nav" dense>
                    <ListItem dense>
                        <Typography variant="title">Navigation</Typography>
                    </ListItem>

                    {data.parent_id && (
                        <Link
                            href={{
                                pathname: '/doc',
                                query: {
                                    path: `${basePath}${data.parent_id}`,
                                },
                            }}>
                            <ListItem button dense>
                                <ListItemIcon>
                                    <IconArrowUpward />
                                </ListItemIcon>

                                <ListItemText primary="Up" />
                            </ListItem>
                        </Link>
                    )}

                    {children.length > 0 && (
                        <Fragment>
                            <ListItem dense>
                                <ListItemText
                                    primary={`Children (${formatThousands(
                                        children.length
                                    )})`}
                                />
                            </ListItem>

                            {children.map((child, index) => (
                                <Link
                                    href={{
                                        pathname: '/doc',
                                        query: {
                                            path: `${basePath}${child.id}`,
                                        },
                                    }}
                                    key={child.id || index}>
                                    <ListItem button dense>
                                        <ListItemIcon>
                                            <Attachment />
                                        </ListItemIcon>

                                        <ListItemText
                                            primary={child.filename}
                                            secondary={[
                                                child.content_type,
                                                child.size,
                                            ]
                                                .filter(Boolean)
                                                .join(' / ')}
                                        />

                                        {child.id ? (
                                            <ListItemSecondaryAction>
                                                <IconButton>
                                                    <Tooltip title="Download original file">
                                                        <a
                                                            target="_blank"
                                                            href={url.resolve(
                                                                baseUrl,
                                                                `${child.id}/raw/${
                                                                    child.filename
                                                                }`
                                                            )}>
                                                            <IconCloudDownload color="action" />
                                                        </a>
                                                    </Tooltip>
                                                </IconButton>
                                            </ListItemSecondaryAction>
                                        ) : (
                                            <LinkOff />
                                        )}
                                    </ListItem>
                                </Link>
                            ))}
                        </Fragment>
                    )}

                    {locations.length > 1 && (
                        <Fragment>
                            <ListItem>
                                <Typography variant="subheading">
                                    Locations
                                </Typography>
                            </ListItem>

                            {locations.map((loc, index) => (
                                <Link
                                    href={{
                                        pathname: '/doc',
                                        query: {
                                            path: `${basePath}${data.parent_id}`,
                                        },
                                    }}
                                    key={index}>
                                    <ListItem button>
                                        <ListItemIcon>
                                            <Folder />
                                        </ListItemIcon>

                                        <Typography>
                                            {loc.parent_path}/
                                            <em style={{ color: '#777' }}>
                                                {loc.filename}
                                            </em>
                                        </Typography>
                                    </ListItem>
                                </Link>
                            ))}
                        </Fragment>
                    )}
                </List>
            </div>
        );
    }
}
