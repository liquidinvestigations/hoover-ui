import React, { memo, useEffect, useRef } from 'react'
import cn from 'classnames'
import { DateTime } from 'luxon'
import { makeStyles } from '@material-ui/core/styles'
import { Box, Card, CardContent, CardHeader, Grid, IconButton, Tooltip, Typography } from '@material-ui/core'
import { AttachFile, CloudDownloadOutlined, Launch } from '@material-ui/icons'
import { makeUnsearchable, truncatePath } from '../../utils'
import { createDownloadUrl } from '../../backend/api'

const useStyles = makeStyles(theme => ({
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
        marginTop: theme.spacing(2),
    },
    key: {
        whiteSpace: 'nowrap',
        fontWeight: 'bold',
    },
    text: {
        cursor: 'text',
        fontFamily: theme.typography.fontFamilyMono,
        fontSize: '.7rem',
        color: '#555',
    },
    iconButton: {
        marginRight: theme.spacing(0.3),
    },
    buttonLink: {
        lineHeight: 0,
    }
}))

const timeMs = () => new Date().getTime()

function ResultItem({ hit, url, index, isPreview, onPreview, unsearchable }) {
    const classes = useStyles()

    const nodeRef = useRef()
    const handleMouseDown = () => {
        nodeRef.current.willFocus = !(nodeRef.current.tUp && timeMs() - nodeRef.current.tUp < 300)
    }
    const handleMouseMove = () => {
        nodeRef.current.willFocus = false
    }
    const handleMouseUp = () => {
        if (nodeRef.current.willFocus) {
            nodeRef.current.tUp = timeMs()
            onPreview(url)
        }
    }

    useEffect(() => {
        if (isPreview && 'scrollIntoView' in nodeRef.current) {
            nodeRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' })
        }
    }, [isPreview])

    const fields = hit._source || {}
    const highlights = hit.highlight || {}
    const downloadUrl = createDownloadUrl(url, fields.filename)

    return (
        <Card
            ref={nodeRef}
            className={cn(classes.card, { [classes.selected]: isPreview })}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
        >
            <CardHeader
                title={
                    <span>
                        {index}. {fields.filename}
                    </span>
                }
                action={!!fields.attachments && <AttachFile style={{ fontSize: 18 }} />}
                subheader={truncatePath(fields.path)}
            />
            <CardContent>
                <Grid container alignItems="flex-end">
                    <Grid item md={4}>
                        {!!fields['word-count'] && (
                            <Box>
                                <Typography variant="caption">
                                    {fields['word-count']} words
                                </Typography>
                            </Box>
                        )}

                        {!!fields.date && (
                            <Box>
                                <Typography variant="caption">
                                    <strong>Modified:</strong>{' '}
                                    {DateTime.fromISO(fields.date, { locale: 'en-US' })
                                        .toLocaleString(DateTime.DATE_FULL)}
                                </Typography>
                            </Box>
                        )}

                        {!!fields['date-created'] && (
                            <Box>
                                <Typography variant="caption">
                                    <strong>Created:</strong>{' '}
                                    {DateTime.fromISO(fields['date-created'], { locale: 'en-US' })
                                        .toLocaleString(DateTime.DATE_FULL)}
                                </Typography>
                            </Box>
                        )}

                        <Box>
                            <Tooltip title="Open in new tab">
                                <IconButton size="small" className={classes.iconButton}>
                                    <a href={url} target="_blank" className={classes.buttonLink}>
                                        <Launch color="action" />
                                    </a>
                                </IconButton>
                            </Tooltip>

                            <Tooltip title="Download original file">
                                <IconButton size="small" className={classes.iconButton}>
                                    <a href={downloadUrl} className={classes.buttonLink}>
                                        <CloudDownloadOutlined color="action" />
                                    </a>
                                </IconButton>
                            </Tooltip>
                        </Box>
                    </Grid>
                    <Grid item md={8} className={classes.text}>
                        {Object.entries(highlights).map(([key, highlight]) =>
                            <Grid container key={key} spacing={1} wrap="nowrap">
                                {key !== 'text' &&
                                    <Grid item>
                                        <span className={classes.key}>{`${key}:`}</span>
                                    </Grid>
                                }
                                <Grid item container direction="column">
                                    {[...highlight].map((item, index) =>
                                        <Grid item key={index}
                                              dangerouslySetInnerHTML={{
                                                  __html: unsearchable ? makeUnsearchable(item) : item,
                                              }}
                                        />
                                    )}
                                </Grid>
                            </Grid>
                        )}
                    </Grid>{' '}
                </Grid>
            </CardContent>
        </Card>
    )
}

export default memo(ResultItem)
