import { Component } from 'react';
import Loading from './Loading';
import api from '../api';
import url from 'url';
import cn from 'classnames';

import { connect } from 'react-redux';

import Grid from '@material-ui/core/Grid';
import { withStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import Divider from '@material-ui/core/Divider';
import Card from '@material-ui/core/Card';
import CardHeader from '@material-ui/core/CardHeader';
import CardContent from '@material-ui/core/CardContent';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';

import IconArrowUpward from '@material-ui/icons/ArrowUpward';
import IconLaunch from '@material-ui/icons/Launch';
import IconCloudDownload from '@material-ui/icons/CloudDownload';

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
    section: {
        margin: '1rem',
    },
    content: {
        overflowWrap: 'break-word',
        position: 'relative',
        padding: '1rem 2rem 1rem 0',
        fontSize: 13,
    },

    preWrap: { whiteSpace: 'pre-wrap' },
});

class Document extends Component {
    state = { doc: {}, loaded: false };

    componentDidMount() {
        const docUrl = this.props.docUrl;
        const split = docUrl.split('/');
        const docId = split.pop();

        this.baseUrl = split.join('/');

        if (window.HOOVER_HYDRATE_DOC) {
            console.log('using HOOVER_HYDRATE_DOC');
            this.setState({ doc: window.HOOVER_HYDRATE_DOC, loaded: true });
        }
    }

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
                    <Grid container justify="space-between">
                        {headerLinks.map(({ text, icon, ...props }, index) => (
                            <Button
                                key={index}
                                size="small"
                                color="secondary"
                                variant="flat"
                                component="a"
                                {...props}>
                                {icon}  {text}
                            </Button>
                        ))}
                    </Grid>
                </div>

                <div className={classes.section}>
                    <DocumentMetaSection doc={doc} classes={classes} />
                </div>

                <div className={classes.section}>
                    <DocumentEmailSection doc={doc} classes={classes} />
                </div>

                <div className={classes.section}>
                    <DocumentFilesSection
                        title="Files"
                        data={files}
                        baseUrl={this.baseUrl}
                        fullPage={this.props.fullPage}
                        classes={classes}
                    />
                </div>

                <div className={classes.section}>
                    <DocumentHTMLSection
                        html={doc.safe_html}
                        title="HTML"
                        classes={classes}
                    />
                </div>

                <div className={classes.section}>
                    <DocumentTextSection
                        title="Text"
                        text={doc.content.text}
                        fullPage={this.props.fullPage}
                        classes={classes}
                    />
                </div>

                <div className={classes.section}>
                    <DocumentTextSection
                        title="Headers &amp; Parts"
                        text={doc.content.tree}
                        fullPage={this.props.fullPage}
                        classes={classes}
                    />
                </div>

                {ocrData.map(({ tag, text }) => (
                    <div className={classes.section}>
                        <DocumentTextSection
                            title={tag}
                            text={text}
                            fullPage={this.props.fullPage}
                            classes={classes}
                        />
                    </div>
                ))}
            </div>
        );
    }
}

class DocumentMetaSection extends Component {
    render() {
        const { doc } = this.props;
        const data = doc.content;

        return (
            <Card>
                <CardHeader title="Meta" />

                <CardContent>
                    <Table>
                        <TableBody>
                            <TableRow>
                                <TableCell>Filename</TableCell>
                                <TableCell>{data.filename}</TableCell>
                            </TableRow>

                            <TableRow>
                                <TableCell>Path</TableCell>
                                <TableCell>{data.path}</TableCell>
                            </TableRow>

                            <TableRow>
                                <TableCell>Id</TableCell>
                                <TableCell>{doc.id}</TableCell>
                            </TableRow>

                            {data.filetype && (
                                <TableRow>
                                    <TableCell>Type</TableCell>
                                    <TableCell>{data.filetype}</TableCell>
                                </TableRow>
                            )}
                            {data.filetype != 'folder' &&
                                data.md5 && (
                                    <TableRow>
                                        <TableCell>MD5</TableCell>
                                        <TableCell>{data.md5}</TableCell>
                                    </TableRow>
                                )}
                            {data.filetype != 'folder' &&
                                data.sha1 && (
                                    <TableRow>
                                        <TableCell>SHA1</TableCell>
                                        <TableCell>{data.sha1}</TableCell>
                                    </TableRow>
                                )}
                            {data.lang && (
                                <TableRow>
                                    <TableCell>Language</TableCell>
                                    <TableCell>{data.lang}</TableCell>
                                </TableRow>
                            )}
                            {data['date-created'] && (
                                <TableRow>
                                    <TableCell>Created</TableCell>
                                    <TableCell>{data['date-created']}</TableCell>
                                </TableRow>
                            )}
                            {data.date && (
                                <TableRow>
                                    <TableCell>Modified</TableCell>
                                    <TableCell>{data.date}</TableCell>
                                </TableRow>
                            )}
                            {data.pgp && (
                                <TableRow>
                                    <TableCell>PGP</TableCell>
                                    <TableCell>{data.pgp}</TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        );
    }
}

class DocumentEmailSection extends Component {
    render() {
        let doc = this.props.doc || {};
        let data = doc.content;
        let files = doc.children || [];

        if (data.filetype == 'email') {
            return (
                <Card>
                    <CardHeader title="Email" />
                    <CardContent>
                        <Table>
                            <TableBody>
                                <TableRow>
                                    <TableCell>From</TableCell>
                                    <TableCell>{data.from}</TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell>To</TableCell>
                                    <TableCell>{data.to.join(', ')}</TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell>Date</TableCell>
                                    <TableCell>{data.date}</TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell>Subject</TableCell>
                                    <TableCell>{data.subject || '---'}</TableCell>
                                </TableRow>
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            );
        }
        return null;
    }
}

class DocumentFilesSection extends Component {
    render() {
        const { data, baseUrl, title, fullPage } = this.props;

        const files = data.map(({ id, filename, content_type, size }, index) => {
            return (
                <TableRow key={index}>
                    <TableCell>
                        {id ? (
                            <a
                                href={`${baseUrl}/${id}`}
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
                                href={`${baseUrl}/${id}/raw/${filename}`}
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
                <Card>
                    <CardHeader title={title} />
                    <CardContent>
                        <Table>
                            <TableBody>{files}</TableBody>
                        </Table>
                    </CardContent>
                </Card>
            )
        );
    }
}

class DocumentTextSection extends Component {
    render() {
        const { classes, text, title } = this.props;
        if (!text) return null;

        return (
            <Card>
                <CardHeader title={title} />
                <CardContent>
                    <div className={classes.content}>
                        <pre className={classes.preWrap}>{text.trim()}</pre>
                    </div>
                </CardContent>
            </Card>
        );
    }
}

class DocumentHTMLSection extends Component {
    render() {
        let html = this.props.html;
        if (!html) return null;

        let title = this.props.title;

        return (
            <Card>
                <CardHeader title={title} />
                <CardContent>
                    <div className={classes.content}>
                        <span dangerouslySetInnerHTML={{ __html: html }} />
                    </div>
                </CardContent>
            </Card>
        );
    }
}
const mapStateToProps = ({ preview: { isFetching, doc, url } }) => ({
    isFetching,
    doc,
    docUrl: url,
});
export default withStyles(styles)(connect(mapStateToProps)(Document));
