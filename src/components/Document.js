import IconButton from '@material-ui/core/IconButton';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import { withStyles } from '@material-ui/core/styles';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableRow from '@material-ui/core/TableRow';
import Toolbar from '@material-ui/core/Toolbar';
import Tooltip from '@material-ui/core/Tooltip';
import Typography from '@material-ui/core/Typography';
import IconCloudDownload from '@material-ui/icons/CloudDownload';
import IconLaunch from '@material-ui/icons/Launch';
import cn from 'classnames';
import langs from 'langs';
import { Component } from 'react';
import { connect } from 'react-redux';
import url from 'url';
import Loading from './Loading';

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
        color: theme.palette.text.secondary,
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
});

const SectionHeader = withStyles(styles)(({ classes, title }) => (
    <div className={classes.sectionHeader}>
        <Typography variant="h6">{title}</Typography>
    </div>
));

const SectionContent = withStyles(styles)(
    ({ classes, children, scrollX, ...props }) => (
        <div className={cn(classes.sectionContent, { [classes.scrollX]: scroll })}>
            {children}
        </div>
    )
);

class Document extends Component {
    render() {
        const { docUrl, collection, fullPage, classes, isFetching } = this.props;

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
                href: `${docUrl}/raw/${data.filename}`,
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
                    icon: <IconCloudDownload />,
                };
            })
        );

        return (
            <div>
                {headerLinks.length > 0 && (
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
                        title={tag}
                        text={text}
                        fullPage={this.props.fullPage}
                        classes={classes}
                    />
                ))}

                {!fullPage && (
                    <DocumentMetaSection
                        doc={doc}
                        collection={collection}
                        classes={classes}
                    />
                )}

                {!fullPage && (
                    <DocumentFilesSection
                        title="Files"
                        data={files}
                        fullPage={fullPage}
                        baseUrl={collectionBaseUrl}
                        classes={classes}
                    />
                )}
            </div>
        );
    }
}

class DocumentMetaSection extends Component {
    getLanguage(key) {
        const found = langs.where('1', data.lang);
        return found ? found.name : data.lang;
    }

    render() {
        const { doc, collection, classes } = this.props;
        const data = doc ? doc.content : null;

        return (
            <section className={classes.section}>
                <SectionHeader title="Meta" />

                <SectionContent>
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

                            <ListItem disableGutters>
                                <ListItemText primary="Id" secondary={doc.id} />
                            </ListItem>

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
                                        secondary={this.getLanguage(data.lang)}
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
                </SectionContent>
            </section>
        );
    }
}

class DocumentEmailSection extends Component {
    render() {
        let { classes, doc } = this.props;

        doc = doc || {};

        let data = doc.content;
        let files = doc.children || [];

        if (data.filetype !== 'email') {
            return null;
        }

        return (
            <section className={this.props.classes.section}>
                <SectionHeader title="Email" />
                <SectionContent>
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
                                        {data.to.filter(Boolean).join(', ')}
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
                </SectionContent>
            </section>
        );
    }
}

class DocumentFilesSection extends Component {
    render() {
        const { data, baseUrl, title, fullPage, classes } = this.props;

        const files = data.map(({ id, filename, content_type, size }, index) => {
            return (
                <TableRow key={id || filename}>
                    <TableCell className="text-muted">{content_type}</TableCell>
                    <TableCell className="text-muted">{size}</TableCell>
                    <TableCell>
                        {id ? (
                            <a
                                href={url.resolve(baseUrl, `${id}/raw/${filename}`)}
                                target={fullPage ? null : '_blank'}
                                title="Original file">
                                <IconCloudDownload />
                            </a>
                        ) : (
                            <p>-- broken link --</p>
                        )}
                    </TableCell>
                    <TableCell>
                        {id ? (
                            <a
                                href={url.resolve(baseUrl, id)}
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
                <section className={classes.section}>
                    <SectionHeader title={title} />
                    <SectionContent scrollX>
                        <Table>
                            <TableBody>{files}</TableBody>
                        </Table>
                    </SectionContent>
                </section>
            )
        );
    }
}

class DocumentTextSection extends Component {
    render() {
        const { classes, text, title } = this.props;
        if (!text) return null;

        return (
            <section className={classes.section}>
                <SectionHeader title={title} />
                <SectionContent>
                    <div className={classes.content}>
                        <pre className={classes.preWrap}>{text.trim()}</pre>
                    </div>
                </SectionContent>
            </section>
        );
    }
}

class DocumentHTMLSection extends Component {
    render() {
        let html = this.props.html;
        if (!html) return null;

        let title = this.props.title;

        return (
            <div>
                <SectionHeader title={title} />
                <SectionContent>
                    <div className={classes.content}>
                        <span dangerouslySetInnerHTML={{ __html: html }} />
                    </div>
                </SectionContent>
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
