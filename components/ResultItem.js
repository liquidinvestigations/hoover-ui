import { Component } from 'react';
import PropTypes from 'prop-types';
import cn from 'classnames';
import { DateTime } from 'luxon';
import makeUnsearchable from '../utils/make-unsearchable';

import Grid from '@material-ui/core/Grid';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import CardActions from '@material-ui/core/CardActions';
import Typography from '@material-ui/core/Typography';
import { withStyles } from '@material-ui/core/styles';

const styles = theme => ({
    card: {
        marginTop: theme.spacing.unit,
    },
});

function timeMs() {
    return new Date().getTime();
}

const documentViewUrl = item => `doc/${item._collection}/${item._id}`;
class ResultItem extends Component {
    static propTypes = {
        classes: PropTypes.object.isRequired,
    };

    handleClick = e => {
        const modifier = e.metaKey || e.ctrlKey || e.shiftKey || e.altKey;

        if (!modifier) {
            e.preventDefault();
            this.props.onPreview(this.props.url);
        }
    };

    render() {
        let { hit, url, isSelected, unsearchable, classes } = this.props;
        let fields = hit._source || {};
        let highlight = hit.highlight || {};

        var attachIcon = null;
        if (fields.attachments) {
            attachIcon = <i className="fa fa-paperclip" aria-hidden="true" />;
        }

        var title = fields.filename;
        var text = null;
        if (highlight) {
            if (highlight.text) {
                text = highlight.text.map((hi, n) => (
                    <li key={`${hit._url}${n}`}>
                        <span
                            dangerouslySetInnerHTML={{
                                __html: unsearchable ? makeUnsearchable(hi) : hi,
                            }}
                        />
                    </li>
                ));
            }
        }

        let wordCount = null;

        if (fields['word-count']) {
            wordCount = fields['word-count'] + ' words';
        }

        return (
            <div
                className={classes.card}
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
                <Card>
                    <CardContent>
                        <Typography variant="title">
                            {this.props.n}.{' '}
                            <a href={url} target="_blank" onClick={this.handleClick}>
                                {title} {attachIcon}
                            </a>
                        </Typography>

                        <Typography variant="caption">{fields.path}</Typography>

                        <Grid container>
                            <Grid item md={3}>
                                <Typography
                                    variant="caption"
                                    className="results-item-default">
                                    {wordCount}
                                </Typography>

                                {fields.date && (
                                    <div className="results-item-default">
                                        <strong>Date:</strong>{' '}
                                        {DateTime.fromISO(
                                            fields.date
                                        ).toLocaleString(DateTime.DATE_FULL)}
                                    </div>
                                )}

                                {fields['date-created'] && (
                                    <div className="results-item-default">
                                        <strong>Date created: </strong>
                                        {DateTime.fromISO(
                                            fields['date-created']
                                        ).toLocaleString(DateTime.DATE_FULL)}
                                    </div>
                                )}
                            </Grid>

                            <Grid item md={9}>
                                <ul className="results-highlight">{text}</ul>
                            </Grid>
                        </Grid>
                    </CardContent>
                </Card>
            </div>
        );
    }
}

export default withStyles(styles)(ResultItem);
