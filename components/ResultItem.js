import { Component } from 'react';
import cn from 'classnames';
import { DateTime } from 'luxon';

function timeMs() {
    return new Date().getTime();
}

export default class ResultItem extends Component {
    handleClick = e => {
        const modifier = e.metaKey || e.ctrlKey || e.shiftKey || e.altKey;

        if (!modifier) {
            e.preventDefault();
            this.props.onPreview(this.props.url);
        }
    };

    render() {
        let { hit, url, isSelected } = this.props;
        let fields = hit.fields || {};
        let highlight = hit.highlight || {};

        var attachIcon = null;
        if (fields.hasOwnProperty('attachments') && fields.attachments[0]) {
            attachIcon = <i className="fa fa-paperclip" aria-hidden="true" />;
        }

        var title = fields.filename;
        var text = null;
        if (highlight) {
            if (highlight.text) {
                text = highlight.text.map((hi, n) => (
                    <li key={`${hit._url}${n}`}>
                        <span dangerouslySetInnerHTML={{ __html: hi }} />
                    </li>
                ));
            }
        }

        let wordCount = null;

        if (fields['word-count'] && fields['word-count'].length == 1) {
            wordCount = fields['word-count'][0] + ' words';
        }

        return (
            <li
                className={cn('card', {
                    'results-item': true,
                    'results-item-selected': isSelected,
                })}
                onMouseDown={() => {
                    this.willFocus = !(this.tUp && timeMs() - this.tUp < 300);
                }}
                onMouseMove={() => {
                    this.willFocus = false;
                }}
                onMouseUp={() => {
                    if (this.willFocus) {
                        this.tUp = timeMs();
                        this.props.onPreview(url);
                    }
                }}>
                <div className="card-body">
                    <div className="card-title">
                        <h3>
                            {this.props.n}.
                            <a href={url} target="_blank" onClick={this.handleClick}>
                                {attachIcon} {title}
                            </a>
                        </h3>
                    </div>

                    <div className="row">
                        <div className="col-md-3 result-item">
                            <p className="results-item-path">{fields.path}</p>
                            <p className="results-item-default">{wordCount}</p>
                            <div className="results-item-default">
                                Modified:{' '}
                                {hit.fields.date
                                    ? DateTime.fromISO(
                                          hit.fields.date
                                      ).toLocaleString(DateTime.DATE_FULL)
                                    : null}
                            </div>
                            <div className="results-item-default">
                                Created:{' '}
                                {hit.fields['date-created']
                                    ? DateTime.fromISO(
                                          hit.fields['date-created']
                                      ).toLocaleString(DateTime.DATE_FULL)
                                    : null}
                            </div>
                        </div>

                        <div className="col-md-9">
                            <div className="card-text">
                                <ul className="results-highlight">{text}</ul>
                            </div>
                        </div>
                    </div>
                </div>
            </li>
        );
    }
}
