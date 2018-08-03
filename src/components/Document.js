import { Component } from 'react';
import url from 'url';

import cn from 'classnames';
import langs from 'langs';

import { connect } from 'react-redux';

import Grid from '@material-ui/core/Grid';
import { withStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import Divider from '@material-ui/core/Divider';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import Typography from '@material-ui/core/Typography';

import IconArrowUpward from '@material-ui/icons/ArrowUpward';
import IconLaunch from '@material-ui/icons/Launch';
import IconCloudDownload from '@material-ui/icons/CloudDownload';

import Loading from './Loading';
import api from '../api';

const styles = theme => ({
    header: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-end',
        padding: '0 8px',
        marginLeft: '1rem',
        marginRight: '1rem',
        ...theme.mixins.toolbar,
    },
    root: {
        // backgroundColor: theme.palette.background.default,
    },
    section: {},

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

    preWrap: { whiteSpace: 'pre-wrap' },
});

const SectionHeader = withStyles(styles)(({ classes, title }) => (
    <div className={classes.sectionHeader}>
        <Typography variant="title">{title}</Typography>
    </div>
));

const SectionContent = withStyles(styles)(({ classes, children, ...props }) => (
    <div className={classes.sectionContent}>{children}</div>
));

class Document extends Component {
    state = { doc: {}, loaded: false };

    render() {
        const { docUrl, fullPage, classes, isFetching } = this.props;
        let doc = this.props.doc;

        if (isFetching) {
            return <Loading />;
        }

        if (!isFetching && !doc) {
            doc = this.state.doc;
        }

        if (!doc || !Object.keys(doc).length) {
            return null;
        }

        const collectionBaseUrl = url.resolve(docUrl, './');

        const data = doc.content;
        const files = doc.children || [];
        const headerLinks = [];

        if (fullPage) {
            if (doc.parent_id) {
                if (doc.has_locations) {
                    headerLinks.push({
                        href: `${docUrl}?locations=on`,
                        text: 'Locations',
                        icon: <IconArrowUpward />,
                    });
                } else {
                    headerLinks.push({
                        href: `${collectionBaseUrl}${doc.parent_id}`,
                        text: 'Up',
                        icon: <IconArrowUpward />,
                    });
                }
            }
        } else {
            headerLinks.push({
                href: docUrl,
                text: 'Open in new tab',
                icon: <IconLaunch />,
                target: '_blank',
            });
        }

        if (data.filetype != 'folder') {
            headerLinks.push({
                href: `${docUrl}/raw/${data.filename}`,
                text: `Original file`,
                icon: <IconCloudDownload />,
                target: fullPage ? null : '_blank',
            });
        }

        let ocrData = Object.keys(data.ocrtext || {}).map((tag, index) => {
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
            <div className={cn('document', classes.root)}>
                <div className={classes.header}>
                    <Grid container justify="space-between" spacing={0}>
                        {headerLinks.map(({ text, icon, ...props }, index) => (
                            <Button
                                key={props.href}
                                size="small"
                                color="secondary"
                                variant="raised"
                                component="a"
                                {...props}>
                                {icon}  {text}
                            </Button>
                        ))}
                    </Grid>
                </div>

                <DocumentMetaSection doc={doc} classes={classes} />
                <DocumentEmailSection doc={doc} classes={classes} />

                <DocumentFilesSection
                    title="Files"
                    data={files}
                    baseUrl={collectionBaseUrl}
                    fullPage={this.props.fullPage}
                    classes={classes}
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
                        title={tag}
                        text={text}
                        fullPage={this.props.fullPage}
                        classes={classes}
                    />
                ))}
            </div>
        );
    }
}

class DocumentMetaSection extends Component {
    render() {
        const { doc, classes } = this.props;
        const data = doc.content;

        return (
            <section className={classes.section}>
                <SectionHeader title="Meta" />

                <SectionContent>
                    <List>
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

                        {data.filetype != 'folder' &&
                            data.md5 && (
                                <ListItem disableGutters>
                                    <ListItemText
                                        primary="MD5"
                                        secondary={data.md5}
                                    />
                                </ListItem>
                            )}

                        {data.filetype != 'folder' &&
                            data.sha1 && (
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
                                    secondary={
                                        langs.where('1', data.lang).name || data.lang
                                    }
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
                                <ListItemText primary="PGP" secondary={data.pgp} />
                            </ListItem>
                        )}
                    </List>
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
                                        {data.to.join(', ')}
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
                    <TableCell className="text-muted">{content_type}</TableCell>
                    <TableCell className="text-muted">{size}</TableCell>
                    <TableCell>
                        {id ? (
                            <a
                                href={url.resolve(baseUrl, `${id}/raw/${filename}`)}
                                target={fullPage ? null : '_blank'}
                                title="Original file">
                                <i className="fa fa-file-o" />
                            </a>
                        ) : (
                            <p>-- broken link --</p>
                        )}
                    </TableCell>
                </TableRow>
            );
        });

        return (
            files.length > 0 && (
                <section classes={classes.section}>
                    <SectionHeader title={title} />
                    <SectionContent>
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
const mapStateToProps = ({ preview: { isFetching, doc, url } }) => ({
    isFetching,
    doc,
    docUrl: url,
});

export default connect(mapStateToProps)(withStyles(styles)(Document));
