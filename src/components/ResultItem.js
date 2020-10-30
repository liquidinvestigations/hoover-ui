import { Component } from 'react';
import PropTypes from 'prop-types';
import cn from 'classnames';
import { DateTime } from 'luxon';
import { connect } from 'react-redux';

import Grid from '@material-ui/core/Grid';
import Card from '@material-ui/core/Card';
import CardHeader from '@material-ui/core/CardHeader';
import CardContent from '@material-ui/core/CardContent';
import Typography from '@material-ui/core/Typography';
import AttachIcon from '@material-ui/icons/AttachFile';
import { withStyles } from '@material-ui/core/styles';
import IconCloudDownload from '@material-ui/icons/CloudDownloadOutlined';
import Tooltip from '@material-ui/core/Tooltip';

import api from "../api";
import { fetchDoc } from '../actions';
import { makeUnsearchable, truncatePath } from '../utils';

const styles = theme => ({
    card: {
        cursor: 'pointer',
        marginTop: theme.spacing(1),
        borderLeft: '3px solid transparent',
        transition: theme.transitions.create('border', {
            duration: theme.transitions.duration.short,
        }),
    },
    selected: {
        borderLeft: `3px solid ${theme.palette.secondary.main}`,
    },
    spaceBottom: {
        marginBottom: theme.spacing(1),
    },
    spaceTop: {
        marginTop: theme.spacing(1),
    },
    path: {
        // overflow: 'hidden',
        // whiteSpace: 'nowrap',
        marginTop: theme.spacing(2),
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

function combineHighlights(highlight) {
    var list = [];
    for (const key in highlight) {
        if (highlight.hasOwnProperty(key)) {
            list = list.concat(highlight[key]);
        }
    }
    return list;
}

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

    componentDidUpdate(prevProps) {
        if (this.props.url === this.props.doc.url && 'scrollIntoView' in this.node) {
            this.node.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }

    render() {
        const { hit, url, classes, doc, index } = this.props;

        const isSelected = url === doc.url;
        const unsearchable = !!doc.url;

        const fields = hit._source || {};
        const highlight = hit.highlight || {};

        const icon = fields.attachments ? (
            <AttachIcon style={{ fontSize: 18 }} />
        ) : null;

        const text = combineHighlights(highlight).map((hi, n) => (
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

        let downloadUrl = api.downloadUrl(this.props.url, fields.filename);

        return (
            <div
                ref={node => (this.node = node)}
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
                        title={
                            <span>
                                {index}. {fields.filename}
                            </span>
                        }
                        action={icon}
                        subheader={truncatePath(fields.path)}
                    />
                    <CardContent>
                        <Grid container alignItems="flex-end">
                            <Grid item md={4}>
                                <Typography variant="caption">
                                    {wordCount}
                                </Typography>

                                {fields.date && (
                                    <Typography variant="caption">
                                        <strong>Modified:</strong>{' '}
                                        {DateTime.fromISO(fields.date)
                                            .toLocaleString(DateTime.DATE_FULL)
                                            .replace(/\s/g, ' ')}
                                    </Typography>
                                )}

                                {fields['date-created'] && (
                                    <Typography variant="caption">
                                        <strong>Created: </strong>
                                        {DateTime.fromISO(
                                            fields['date-created']
                                        ).toLocaleString(DateTime.DATE_FULL)}
                                    </Typography>
                                )}

                                <Typography variant="caption">
                                    <Tooltip title="Download original file">
                                        <a
                                            target="_blank"
                                            href={downloadUrl}>
                                            <IconCloudDownload color="action" />
                                        </a>
                                    </Tooltip>
                                </Typography>
                            </Grid>
                            <Grid item md={8}>
                                <div className={classes.text}>{text}</div>
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
