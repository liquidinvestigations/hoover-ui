import { Component } from 'react';
import Loading from './Loading';
import api from '../api';

export default class Document extends Component {
    state = { doc: {}, loaded: false };

    async componentDidMount() {
        let docUrl = this.props.docUrl;
        let split = docUrl.split('/');
        let docId = split.pop();

        this.baseUrl = split.join('/');

        if (window.HOOVER_HYDRATE_DOC) {
            console.log('using HOOVER_HYDRATE_DOC');
            this.setState({ doc: window.HOOVER_HYDRATE_DOC, loaded: true });
        } else {
            const doc = await api.doc(docUrl);
            this.setState({ doc: doc, loaded: true });
        }
    }

    render() {
        const { doc, loaded } = this.state;
        const { docUrl, fullPage, collectionBaseUrl } = this.props;

        if (!loaded) {
            return <Loading />;
        }

        const data = doc.content;
        const files = doc.children || [];
        const headerLinks = [];

        if (fullPage) {
            if (doc.parent_id) {
                if (doc.has_locations) {
                    headerLinks.push({
                        href: `${docUrl}?locations=on`,
                        text: 'Locations',
                        icon: 'fa fa-level-up',
                    });
                } else {
                    headerLinks.push({
                        href: `${collectionBaseUrl}${doc.parent_id}`,
                        text: 'Up',
                        icon: 'fa fa-level-up',
                    });
                }
            }
        } else {
            headerLinks.push({
                href: `${docUrl}`,
                text: 'Open in new tab',
                icon: 'fa fa-external-link-square',
                target: '_blank',
            });
        }

        if (data.filetype != 'folder') {
            headerLinks.push({
                href: `${docUrl}/raw/${data.filename}`,
                text: `Original file`,
                icon: 'fa fa-cloud-download',
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
                    icon: 'fa fa-cloud-download',
                };
            })
        );

        return (
            <div className="doc-page">
                <div className="header-links d-flex justify-content-between mb-3">
                    {headerLinks.map(({ text, icon, ...props }, index) => (
                        <a
                            key={index}
                            className="btn btn-primary btn-sm "
                            {...props}>
                            <i className={icon} />
                            {text}
                        </a>
                    ))}
                </div>

                <DocumentMetaSection doc={doc} />
                <DocumentEmailSection doc={doc} />
                <DocumentFilesSection
                    title="Files"
                    data={files}
                    baseUrl={this.baseUrl}
                    fullPage={this.props.fullPage}
                />
                <DocumentHTMLSection html={doc.safe_html} title="HTML" />
                <DocumentTextSection
                    title="Text"
                    text={doc.content.text}
                    fullPage={this.props.fullPage}
                />
                <DocumentTextSection
                    title="Headers &amp; Parts"
                    text={doc.content.tree}
                    fullPage={this.props.fullPage}
                />
                {ocrData.map(({ tag, text }) => (
                    <DocumentTextSection
                        title={tag}
                        text={text}
                        fullPage={this.props.fullPage}
                    />
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
            <div className="card my-2">
                <div className="card-header">Meta</div>

                <div className="card-body">
                    <table className="table table-sm">
                        <tbody>
                            <tr>
                                <td>Filename</td>
                                <td>
                                    <code>{data.filename}</code>
                                </td>
                            </tr>

                            <tr>
                                <td>Path</td>
                                <td>
                                    <code>{data.path}</code>
                                </td>
                            </tr>

                            <tr>
                                <td>Id</td>
                                <td>
                                    <code>{doc.id}</code>
                                </td>
                            </tr>

                            {data.filetype && (
                                <tr>
                                    <td>Type</td>
                                    <td>
                                        <code>{data.filetype}</code>
                                    </td>
                                </tr>
                            )}
                            {data.filetype != 'folder' &&
                                data.md5 && (
                                    <tr>
                                        <td>MD5</td>
                                        <td>
                                            <code>{data.md5}</code>
                                        </td>
                                    </tr>
                                )}
                            {data.filetype != 'folder' &&
                                data.sha1 && (
                                    <tr>
                                        <td>SHA1</td>
                                        <td>
                                            <code>{data.sha1}</code>
                                        </td>
                                    </tr>
                                )}
                            {data.lang && (
                                <tr>
                                    <td>Language</td>
                                    <td>
                                        <code>{data.lang}</code>
                                    </td>
                                </tr>
                            )}
                            {data['date-created'] && (
                                <tr>
                                    <td>Created</td>
                                    <td>{data['date-created']}</td>
                                </tr>
                            )}
                            {data.date && (
                                <tr>
                                    <td>Modified</td>
                                    <td>{data.date}</td>
                                </tr>
                            )}
                            {data.pgp && (
                                <tr>
                                    <td>PGP</td>
                                    <td>{data.pgp}</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
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
                <div className="card my-2">
                    <div className="card-header">Email</div>
                    <div className="card-body">
                        <table className="table table-sm">
                            <tbody>
                                <tr>
                                    <td>From</td>
                                    <td>{data.from}</td>
                                </tr>
                                <tr>
                                    <td>To</td>
                                    <td>{data.to.join(', ')}</td>
                                </tr>
                                <tr>
                                    <td>Date</td>
                                    <td>{data.date}</td>
                                </tr>
                                <tr>
                                    <td>Subject</td>
                                    <td>{data.subject || '---'}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
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
                <tr key={index}>
                    <td>
                        {id ? (
                            <a
                                href={`${baseUrl}/${id}`}
                                target={fullPage ? null : '_blank'}>
                                {filename}
                            </a>
                        ) : (
                            <span>{filename}</span>
                        )}
                    </td>
                    <td className="text-muted">{content_type}</td>
                    <td className="text-muted">{size}</td>
                    <td>
                        {id ? (
                            <a
                                href={`${baseUrl}/${id}/raw/${filename}`}
                                target={fullPage ? null : '_blank'}
                                title="Original file">
                                <i className="fa fa-file-o" />
                            </a>
                        ) : (
                            <code>-- broken link --</code>
                        )}
                    </td>
                </tr>
            );
        });

        return (
            files.length > 0 && (
                <div className="card my-2">
                    <div className="card-header">{title}</div>
                    <div className="card-body">
                        <table className="table table-sm">
                            <tbody>{files}</tbody>
                        </table>
                    </div>
                </div>
            )
        );
    }
}

class DocumentTextSection extends Component {
    render() {
        let text = this.props.text;
        if (!text) return null;

        let title = this.props.title;

        return (
            <div className="card my-2">
                <div className="card-header">{title}</div>
                <div className="card-body">
                    <div className="content">
                        <pre>{text.trim()}</pre>
                    </div>
                </div>
            </div>
        );
    }
}

class DocumentHTMLSection extends Component {
    render() {
        let html = this.props.html;
        if (!html) return null;

        let title = this.props.title;

        return (
            <div className="card my-2">
                <div className="card-header">{title}</div>
                <div className="card-body">
                    <div className="content">
                        <span dangerouslySetInnerHTML={{ __html: html }} />
                    </div>
                </div>
            </div>
        );
    }
}
