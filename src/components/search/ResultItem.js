import React, { memo, useContext, useEffect, useRef } from 'react'
import cn from 'classnames'
import { DateTime } from 'luxon'
import { makeStyles } from '@material-ui/core/styles'
import {
    Box,
    Card,
    CardContent,
    CardHeader,
    Grid,
    IconButton,
    SvgIcon,
    Tooltip,
    Typography
} from '@material-ui/core'

import {
    AttachFile,
    CloudDownloadOutlined,
    Delete,
    Error,
    Launch,
    Lock,
    Star,
    TextFields,
    Visibility
} from '@material-ui/icons'

import { brown, green, red } from '@material-ui/core/colors'
import { UserContext } from '../../../pages/_app'
import { getIconReactComponent, humanFileSize, makeUnsearchable, truncatePath } from '../../utils'
import { createDownloadUrl } from '../../backend/api'
import { specialTags } from '../document/TagsSection'

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
    icons: {
        paddingRight: theme.spacing(1),
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
    const whoAmI = useContext(UserContext)

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

                        {!!fields.size && (
                            <Box>
                                <Typography variant="caption">
                                    <strong>Size:</strong>{' '}
                                    {humanFileSize(fields.size, true)}
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

                        {fields.tags?.filter(tag => !specialTags.includes(tag)).length > 0 &&
                            <Box>
                                <Typography variant="caption">
                                    <strong>Public tags:</strong>{' '}
                                    {fields.tags.filter(tag => !specialTags.includes(tag)).join(', ')}
                                </Typography>
                            </Box>
                        }

                        {fields[`priv-tags.${whoAmI.username}`]?.filter(tag => !specialTags.includes(tag)).length > 0 &&
                            <Box>
                                <Typography variant="caption">
                                    <strong>Private tags:</strong>{' '}
                                    {
                                        fields[`priv-tags.${whoAmI.username}`]
                                        .filter(tag => !specialTags.includes(tag))
                                        .join(', ')
                                    }
                                </Typography>
                            </Box>
                        }

                        <Grid container className={classes.icons}>
                            <Grid item className={classes.iconButton}>
                                <Tooltip title="Open in new tab">
                                    <IconButton size="small">
                                        <a href={url} target="_blank" className={classes.buttonLink}>
                                            <Launch color="action" />
                                        </a>
                                    </IconButton>
                                </Tooltip>
                            </Grid>

                            <Grid item className={classes.iconButton} style={{ flex: 1 }}>
                                <Tooltip title="Download original file">
                                    <IconButton size="small">
                                        <a href={downloadUrl} className={classes.buttonLink}>
                                            <CloudDownloadOutlined color="action" />
                                        </a>
                                    </IconButton>
                                </Tooltip>
                            </Grid>

                            <Grid item className={classes.iconButton}>
                                <Tooltip title={fields['content-type']}>
                                    <Box>
                                        <SvgIcon component={getIconReactComponent(fields.filetype)} color="action" />
                                    </Box>
                                </Tooltip>
                            </Grid>

                            {fields[`priv-tags.${whoAmI.username}`]?.includes('important') &&
                                <Grid item className={classes.iconButton}>
                                    <Tooltip title="important">
                                        <Star style={{ color: '#ffb400' }} />
                                    </Tooltip>
                                </Grid>
                            }

                            {fields.tags?.includes('interesting') &&
                                <Grid item className={classes.iconButton}>
                                    <Tooltip title="interesting">
                                        <Error style={{ color: green[500] }} />
                                    </Tooltip>
                                </Grid>
                            }

                            {fields[`priv-tags.${whoAmI.username}`]?.includes('seen') &&
                                <Grid item className={classes.iconButton}>
                                    <Tooltip title="seen">
                                        <Visibility style={{ color: brown[500] }} />
                                    </Tooltip>
                                </Grid>
                            }

                            {fields[`priv-tags.${whoAmI.username}`]?.includes('trash') &&
                                <Grid item className={classes.iconButton}>
                                    <Tooltip title="trash">
                                        <Delete style={{ color: red[600] }} />
                                    </Tooltip>
                                </Grid>
                            }

                            {fields.ocr &&
                                <Grid item className={classes.iconButton}>
                                    <Tooltip title="OCR">
                                        <TextFields color="action" />
                                    </Tooltip>
                                </Grid>
                            }

                            {fields.pgp &&
                                <Grid item className={classes.iconButton}>
                                    <Tooltip title="encrypted">
                                        <Lock color="action" />
                                    </Tooltip>
                                </Grid>
                            }
                        </Grid>
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
