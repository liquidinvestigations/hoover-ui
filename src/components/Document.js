import Collapse from '@material-ui/core/Collapse';
import Divider from '@material-ui/core/Divider';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import Grid from '@material-ui/core/Grid';
import IconButton from '@material-ui/core/IconButton';
import IconChromeReaderMode from '@material-ui/icons/ChromeReaderMode';
import IconClear from '@material-ui/icons/Clear';
import IconCloudDownload from '@material-ui/icons/CloudDownload';
import IconLaunch from '@material-ui/icons/Launch';
import IconPrint from '@material-ui/icons/Print';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import Loading from './Loading';
import PropTypes from 'prop-types';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableRow from '@material-ui/core/TableRow';
import Toolbar from '@material-ui/core/Toolbar';
import Tooltip from '@material-ui/core/Tooltip';
import Typography from '@material-ui/core/Typography';
import cn from 'classnames';
import url from 'url';
import { Component, Fragment } from 'react';
import { connect } from 'react-redux';
import { getLanguageName } from '../utils';
import { withStyles } from '@material-ui/core/styles';

const styles = theme => ({
    toolbar: {
        backgroundColor: theme.palette.grey[100],
        borderBottomColor: theme.palette.grey[400],
        borderBottomWidth: 1,
        borderBottomStyle: 'solid',
        justifyContent: 'space-between',
    },

    sectionHeader: {
        backgroundColor: theme.palette.grey[200],
        color: theme.palette.text.action,
        padding: '1rem',
    },

    sectionContent: {
        margin: '1rem',
        overflowWrap: 'break-word',
        wordWrap: 'break-word',
        position: 'relative',
        // padding: '0 2rem 0 0',
        fontSize: 12,
    },

    preview: {
        overflow: 'hidden',
        height: '50vh',
    },

    scrollX: {
        overflowX: 'scroll',
        '> table': {
            overflowX: 'scroll',
        },
    },

    button: {
        margin: theme.spacing.unit,
    },

    preWrap: { whiteSpace: 'pre-wrap' },

    section: {
        backgroundColor: 'white',
    },

    expand: {
        transform: 'rotate(0deg)',
        transition: theme.transitions.create('transform', {
            duration: theme.transitions.duration.shortest,
        }),
        marginLeft: 'auto',
        [theme.breakpoints.up('sm')]: {
            marginRight: -8,
        },
    },

    expandOpen: {
        transform: 'rotate(180deg)',
    },
});

class Section extends Component {
    static propTypes = {
        classes: PropTypes.object.isRequired,
        defaultOpen: PropTypes.bool,
        scrollX: PropTypes.bool,
    };

    static defaultProps = {
        defaultOpen: true,
        scrollX: false,
    };

    constructor(props) {
        super(props);
        this.state = { open: props.defaultOpen || false };
    }

    toggle = () => this.setState({ open: !this.state.open });

    render() {
        const {
            title,
            children,
            classes,
            defaultOpen,
            scrollX,
        } = this.props;

        const { open } = this.state;

        return (
            <Fragment>
                <ListItem onClick={this.toggle} button dense className={classes.sectionHeader}>
                    <Grid container alignItems="baseline" justify="space-between">
                        <Grid item>
                            <Typography variant="h6">
                                {title}
                            </Typography>
                        </Grid>

                        <Grid item>
                            <IconButton
                                className={cn(classes.expand, {
                                    [classes.expandOpen]: open,
                                })}
                                onClick={this.toggle}
                                aria-expanded={open}
                                aria-label="Show more">
                                <ExpandMoreIcon
                                    color={'action'}
                                />
                            </IconButton>
                        </Grid>
                    </Grid>
                </ListItem>

                <Collapse in={open}>
                    <div className={cn(classes.sectionContent, { [classes.scrollX]: scrollX })}>
                        {children}
                    </div>
                    <Divider />
                </Collapse>
            </Fragment>
        );
    }
}

class Document extends Component {
    static propTypes = {
        showToolbar: PropTypes.bool,
        showMeta: PropTypes.bool,
    };

    static defaultProps = {
        showToolbar: true,
        showMeta: true,
    };

    render() {
        const {
            docUrl,
            collection,
            fullPage,
            classes,
            isFetching,
            showToolbar,
            showMeta,
        } = this.props;

        let doc = this.props.data;

        if (isFetching) {
            return <Loading />;
        }

        if (!doc || !Object.keys(doc).length) {
            return null;
        }

        const collectionBaseUrl = url.resolve(docUrl, './');

        const data = doc.content;
        const files = doc.children || [];
        const headerLinks = [];
        const isFolder = data.filetype === 'folder';

        
        const digest = (doc.digest || doc.id[0] != '_' && doc.id);
        const docRawUrl = `${collectionBaseUrl}${digest}/raw/${data.filename}`

        if (!fullPage) {
            headerLinks.push({
                href: docUrl,
                text: 'Open in new tab',
                icon: <IconLaunch />,
                target: '_blank',
            });
        }

        if (data.filetype !== 'folder') {
            headerLinks.push({
                href: `${docUrl}?print=true`,
                text: `Print metadata and content`,
                icon: <IconPrint />,
                target: '_blank',
            });

            headerLinks.push({
                href: docRawUrl,
                text: `Download original file`,
                icon: <IconCloudDownload />,
                target: fullPage ? null : '_blank',
            });
        }

        const ocrData = Object.keys(data.ocrtext || {}).map((tag, index) => {
            return { tag: tag, text: data.ocrtext[tag] };
        });

        headerLinks.push(
            ...ocrData.map(({ tag }) => {
                return {
                    href: `${docUrl}/ocr/${tag}/`,
                    text: `OCR ${tag}`,
                    icon: <IconChromeReaderMode />,
                };
            })
        );

        return (
            <div>
                {headerLinks.length > 0 && showToolbar !== false && (
                    <Toolbar classes={{ root: classes.toolbar }}>
                        {headerLinks.map(({ text, icon, ...props }) => (
                            <Tooltip title={text} key={props.href}>
                                <IconButton
                                    size="small"
                                    color="default"
                                    component="a"
                                    {...props}>
                                    {icon}
                                </IconButton>
                            </Tooltip>
                        ))}
                    </Toolbar>
                )}

                <DocumentEmailSection doc={doc} classes={classes} />

                <DocumentPreviewSection
                    title="Preview"
                    classes={classes}
                    docTitle={doc.content.filename}
                    type={doc.content["content-type"]}
                    url={docRawUrl}
                />

                <DocumentHTMLSection
                    html={doc.safe_html}
                    title="HTML"
                    classes={classes}
                />

                <DocumentTextSection
                    title="Text"
                    text={doc.content.text}
                    fullPage={this.props.fullPage}
                    classes={classes}
                />

                <DocumentTextSection
                    title="Headers &amp; Parts"
                    text={doc.content.tree}
                    fullPage={this.props.fullPage}
                    classes={classes}
                />

                {ocrData.map(({ tag, text }) => (
                    <DocumentTextSection
                        title={"OCR " + tag}
                        text={text}
                        fullPage={this.props.fullPage}
                        classes={classes}
                        omitIfEmpty={false}
                    />
                ))}

                <DocumentFilesSection
                    title="Files"
                    data={files}
                    fullPage={fullPage}
                    baseUrl={collectionBaseUrl}
                    classes={classes}
                />

                {showMeta && (
                    <DocumentMetaSection
                        doc={doc}
                        collection={collection}
                        classes={classes}
                    />
                )}
            </div>
        );
    }
}

class DocumentMetaSection extends Component {
    render() {
        const { doc, collection, classes } = this.props;
        const data = doc ? doc.content : null;

        return (
                <Section title="Meta" classes={classes}>
                    {data && (
                        <List dense>
                            <ListItem disableGutters>
                                <ListItemText
                                    primary="Collection"
                                    secondary={collection}
                                />
                            </ListItem>

                            <ListItem disableGutters>
                                <ListItemText
                                    primary="Filename"
                                    secondary={data.filename}
                                />
                            </ListItem>

                            <ListItem disableGutters>
                                <ListItemText primary="Path" secondary={data.path} />
                            </ListItem>

                            {doc.digest && (
                                <ListItem disableGutters>
                                    <ListItemText primary="Id" secondary={doc.digest} />
                                </ListItem>
                            )}

                            {data.filetype && (
                                <ListItem disableGutters>
                                    <ListItemText
                                        primary="Type"
                                        secondary={data.filetype}
                                    />
                                </ListItem>
                            )}

                            {data.filetype !== 'folder' && data.md5 && (
                                <ListItem disableGutters>
                                    <ListItemText
                                        primary="MD5"
                                        secondary={data.md5}
                                    />
                                </ListItem>
                            )}

                            {data.filetype !== 'folder' && data.sha1 && (
                                <ListItem disableGutters>
                                    <ListItemText
                                        primary="SHA1"
                                        secondary={data.sha1}
                                    />
                                </ListItem>
                            )}

                            {data.lang && (
                                <ListItem disableGutters>
                                    <ListItemText
                                        primary="Language"
                                        secondary={getLanguageName(data.lang)}
                                    />
                                </ListItem>
                            )}
                            {data.date && (
                                <ListItem disableGutters>
                                    <ListItemText
                                        primary="Modified"
                                        secondary={data['date']}
                                    />
                                </ListItem>
                            )}
                            {data['date-created'] && (
                                <ListItem disableGutters>
                                    <ListItemText
                                        primary="Created"
                                        secondary={data['date-created']}
                                    />
                                </ListItem>
                            )}
                            {data.pgp && (
                                <ListItem disableGutters>
                                    <ListItemText
                                        primary="PGP"
                                        secondary={data.pgp}
                                    />
                                </ListItem>
                            )}
                        </List>
                    )}
                </Section>
        );
    }
}

class DocumentEmailSection extends Component {
    render() {
        const { classes, doc = {} } = this.props;
        const data = doc.content;

        if (data.filetype !== 'email') {
            return null;
        }

        return (
                <Section title="Email" classes={classes}>
                    <Table>
                        <TableBody>
                            <TableRow>
                                <TableCell>From</TableCell>
                                <TableCell>
                                    <pre className={classes.preWrap}>
                                        {data.from}
                                    </pre>
                                </TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell>To</TableCell>
                                <TableCell>
                                    <pre className={classes.preWrap}>
                                        {(data.to || []).filter(Boolean).join(', ')}
                                    </pre>
                                </TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell>Date</TableCell>
                                <TableCell>
                                    <pre className={classes.preWrap}>
                                        {data.date}
                                    </pre>
                                </TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell>Subject</TableCell>
                                <TableCell>
                                    <pre className={classes.preWrap}>
                                        {data.subject || '---'}
                                    </pre>
                                </TableCell>
                            </TableRow>
                        </TableBody>
                    </Table>
                </Section>
        );
    }
}

class DocumentFilesSection extends Component {
    render() {
        const { data, baseUrl, title, fullPage, classes } = this.props;

        const files = data.map(({ id, digest, file, filename, content_type, size }, index) => {
            return (
                <TableRow key={file}>
                    <TableCell className="text-muted">{content_type}</TableCell>
                    <TableCell className="text-muted">{size}</TableCell>
                    <TableCell>
                        {digest && (
                            <a
                                href={url.resolve(baseUrl, `${digest}/raw/${filename}`)}
                                target={fullPage ? null : '_blank'}
                                title="Original file">
                                <IconCloudDownload />
                            </a>
                        )}
                    </TableCell>
                    <TableCell>
                        {id ? (
                            <a
                                href={url.resolve(baseUrl, file||id)}
                                target={fullPage ? null : '_blank'}>
                                {filename}
                            </a>
                        ) : (
                            <span>{filename}</span>
                        )}
                    </TableCell>
                </TableRow>
            );
        });

        return (
            files.length > 0 && (
                    <Section title={title} scrollX={true} classes={classes}>
                        <Table>
                            <TableBody>{files}</TableBody>
                        </Table>
                    </Section>
            )
        );
    }
}

class DocumentPreviewSection extends Component {
    render() {
        const { classes, type, url, title, docTitle } = this.props;
        if (!type || !url) return null;

        let preview = null;
        if (type == "application/pdf") {
            const pdfViewerUrl = `/viewer/web/viewer.html?file=${encodeURIComponent(url)}`;
            preview = ( <>
                          <p> Annotate this document in the <a target="_blank" href={pdfViewerUrl}>PDF viewer</a>. </p>
                          <div id="hoover-pdf-viewer-container" className={classes.preview}>
                            <iframe
                                src={pdfViewerUrl}
                                height="100%"
                                width="100%"
                                allowfullscreen="true"
                            />
                          </div>
                        </> );
        } else if (type.startsWith("image/") || type.startsWith("audio/") || type.startsWith("video/")) {
            preview = ( <div id="hoover-media-viewer-container" className={classes.preview}>
                        <embed
                            style={{"object-fit": "contain"}}
                            src={url}
                            type={type}
                            height="100%"
                            width="100%"
                            title={docTitle}
                        />
                        </div> );

        } else {
            return null;
        }

        return (
                <Section title={title} classes={classes}>
                    <div>
                      {preview}
                    </div>
                </Section>
        );
    }
}

class DocumentTextSection extends Component {
    static propTypes = {
        omitIfEmpty: PropTypes.bool,
    };

    static defaultProps = {
        omitIfEmpty: true,
    };

    render() {
        const { classes, title, omitIfEmpty} = this.props;
        var text = this.props.text;

        if (!text) {
            if (omitIfEmpty)
                return null;

            text = ( <i> (empty) </i> );
        } else {
            text = ( <pre className={classes.preWrap}>{text.trim()}</pre> )
        }

        return (
                <Section title={title} classes={classes}>
                    <div className={classes.content}>
                        {text}
                    </div>
                </Section>
        );
    }
}

class DocumentHTMLSection extends Component {
    render() {
        let html = this.props.html;
        if (!html) return null;

        const {classes, title} = this.props;

        return (
            <div>
                <Section title={title} classes={classes}>
                    <div className={classes.content}>
                        <span dangerouslySetInnerHTML={{ __html: html }} />
                    </div>
                </Section>
            </div>
        );
    }
}
const mapStateToProps = ({ doc: { isFetching, data, url, collection } }) => ({
    isFetching,
    data,
    docUrl: url,
    collection,
});

export const Meta = withStyles(styles)(DocumentMetaSection);
export default connect(mapStateToProps)(withStyles(styles)(Document));
