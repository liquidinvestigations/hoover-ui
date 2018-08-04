import { Component } from 'react';
import PropTypes from 'prop-types';
import cn from 'classnames';
import { DateTime } from 'luxon';
import makeUnsearchable from '../make-unsearchable';
import { connect } from 'react-redux';

import Grid from '@material-ui/core/Grid';
import Card from '@material-ui/core/Card';
import CardHeader from '@material-ui/core/CardHeader';
import CardContent from '@material-ui/core/CardContent';
import CardActions from '@material-ui/core/CardActions';
import Typography from '@material-ui/core/Typography';
import AttachIcon from '@material-ui/icons/AttachFile';
import { withStyles } from '@material-ui/core/styles';

import { fetchDoc } from '../actions';

const styles = theme => ({
    card: {
        cursor: 'pointer',
        marginTop: theme.spacing.unit,
        borderLeft: '3px solid transparent',
        transition: theme.transitions.create('border', {
            duration: theme.transitions.duration.short,
        }),
    },
    selected: {
        borderLeft: `3px solid ${theme.palette.secondary.main}`,
    },
    spaceBottom: {
        marginBottom: theme.spacing.unit,
    },
    spaceTop: {
        marginTop: theme.spacing.unit,
    },
    path: {
        // overflow: 'hidden',
        // whiteSpace: 'nowrap',
        marginTop: theme.spacing.unit * 2,
    },
    text: {
        cursor: 'text',
        display: 'inline',
        fontFamily: theme.typography.fontFamilyMono,
        fontSize: '.7rem',
        color: '#555',
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
            this.onPreview();
        }
    };

    onPreview = () => this.props.dispatch(fetchDoc(this.props.url));

    render() {
        const { hit, url, classes, n, doc } = this.props;

        const isSelected = url === doc.url;
        const unsearchable = !!doc.url;

        const fields = hit._source || {};
        const highlight = hit.highlight || {};

        const icon = fields.attachments ? (
            <AttachIcon style={{ fontSize: 18 }} />
        ) : null;

        const text = (highlight.text || []).map((hi, n) => (
            <div key={`${hit._url}${n}`}>
                <span
                    dangerouslySetInnerHTML={{
                        __html: unsearchable ? makeUnsearchable(hi) : hi,
                    }}
                />
            </div>
        ));

        let wordCount = null;

        if (fields['word-count']) {
            wordCount = fields['word-count'] + ' words';
        }

        return (
            <div
                className={cn(classes.card, { [classes.selected]: isSelected })}
                onMouseDown={() => {
                    this.willFocus = !(this.tUp && timeMs() - this.tUp < 300);
                }}
                onMouseMove={() => {
                    this.willFocus = false;
                }}
                onMouseUp={() => {
                    if (this.willFocus) {
                        this.tUp = timeMs();
                        this.onPreview(url);
                    }
                }}>
                <Card>
                    <CardHeader
                        title={fields.filename}
                        action={icon}
                        subheader={fields.path}
                    />
                    <CardContent>
                        <Grid container alignItems="flex-end">
                            <Grid item md={4}>
                                <Typography variant="caption">
                                    {wordCount}
                                </Typography>

                                {fields.date && (
                                    <Typography variant="caption">
                                        <strong>Date modified:</strong>{' '}
                                        {DateTime.fromISO(fields.date)
                                            .toLocaleString(DateTime.DATE_FULL)
                                            .replace(/\s/g, ' ')}
                                    </Typography>
                                )}

                                {fields['date-created'] && (
                                    <Typography variant="caption">
                                        <strong>Date created: </strong>
                                        {DateTime.fromISO(
                                            fields['date-created']
                                        ).toLocaleString(DateTime.DATE_FULL)}
                                    </Typography>
                                )}
                            </Grid>
                            <Grid item md={8}>
                                <ul className={classes.text}>{text}</ul>
                            </Grid>{' '}
                        </Grid>
                    </CardContent>
                </Card>
            </div>
        );
    }
}

const mapStateToProps = ({ doc }) => ({ doc });
export default withStyles(styles)(connect(mapStateToProps)(ResultItem));
