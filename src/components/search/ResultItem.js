import React, { cloneElement, memo, useContext, useEffect, useRef } from 'react'
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
import { specialTags, specialTagsList } from '../document/specialTags'

const useStyles = makeStyles(theme => ({
    card: {
        cursor: 'pointer',
        position: 'relative',
        marginTop: theme.spacing(1),
        borderLeft: '3px solid transparent',
        transition: theme.transitions.create('border', {
            duration: theme.transitions.duration.short,
        }),
    },
    cardContentRoot: {
        '&:last-child': {
            paddingBottom: 32,
        },
    },
    cardHeaderAction: {
        left: 16,
        bottom: 4,
        position: 'absolute',
    },
    cardHeaderContent: {
        width: '100%',
    },
    title: {
        display: 'block',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
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
    actionIcon: {
        fontSize: 18,
        color: theme.palette.grey[600],
    },
    infoIcon: {
        fontSize: 18,
        verticalAlign: 'sub',
        color: theme.palette.grey[600],
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

    const cardHeaderClasses = {
        action: classes.cardHeaderAction,
        content: classes.cardHeaderContent,
    }
    const cardContentClasses = {
        root: classes.cardContentRoot
    }

    return (
        <Card
            ref={nodeRef}
            className={cn(classes.card, { [classes.selected]: isPreview })}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
        >
            <CardHeader
                classes={cardHeaderClasses}
                title={
                    <span className={classes.title}>
                        {index}. {fields.filename}
                    </span>
                }
                subheader={
                    <span className={classes.title}>
                        {truncatePath(fields.path)}
                    </span>
                }
                action={
                    <>
                        <Grid container alignItems="center">
                            <Grid item>
                                <Tooltip title="Download original file">
                                    <IconButton size="small">
                                        <a href={downloadUrl} className={classes.buttonLink}>
                                            <CloudDownloadOutlined className={classes.actionIcon} />
                                        </a>
                                    </IconButton>
                                </Tooltip>
                            </Grid>

                            <Grid item>
                                <Tooltip title="Open in new tab">
                                    <IconButton size="small" style={{ marginRight: 15 }}>
                                        <a href={url} target="_blank" className={classes.buttonLink}>
                                            <Launch className={classes.actionIcon} />
                                        </a>
                                    </IconButton>
                                </Tooltip>
                            </Grid>

                            {specialTags.map((s, k) => {
                                const tagsField = s.public ? fields.tags : fields[`priv-tags.${whoAmI.username}`]
                                if (tagsField?.includes(s.tag)) {
                                    return (
                                        <Grid item>
                                            <Tooltip placement="top" title={s.tag}>
                                                {cloneElement(s.present.icon, {
                                                    className: classes.infoIcon,
                                                    style: { color: s.present.color }
                                                })}
                                            </Tooltip>
                                        </Grid>
                                    )
                                }
                            })}

                            {fields.ocr && (
                                <Grid item>
                                    <Tooltip placement="top" title="OCR">
                                        <TextFields className={classes.infoIcon} color="action" />
                                    </Tooltip>
                                </Grid>
                            )}

                            {fields.pgp && (
                                <Grid item>
                                    <Tooltip placement="top" title="encrypted">
                                        <Lock className={classes.infoIcon} color="action" />
                                    </Tooltip>
                                </Grid>
                            )}

                            <Grid item>
                                <Tooltip placement="top" title={fields['content-type']}>
                                    <Box>
                                        <SvgIcon
                                            className={classes.infoIcon}
                                            component={getIconReactComponent(fields.filetype)}
                                        />
                                    </Box>
                                </Tooltip>
                            </Grid>

                            {!!fields.attachments && (
                                <Grid item>
                                    <Tooltip placement="top" title="has attachment(s)">
                                        <Box>
                                            <AttachFile className={classes.actionIcon} />
                                        </Box>
                                    </Tooltip>
                                </Grid>
                            )}
                        </Grid>
                    </>
                }
            />
            <CardContent classes={cardContentClasses}>
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

                        {fields.tags?.filter(tag => !specialTagsList.includes(tag)).length > 0 && (
                            <Box>
                                <Typography variant="caption">
                                    <strong>Public tags:</strong>{' '}
                                    {fields.tags.filter(tag => !specialTagsList.includes(tag)).join(', ')}
                                </Typography>
                            </Box>
                        )}

                        {fields[`priv-tags.${whoAmI.username}`]?.filter(tag => !specialTagsList.includes(tag)).length > 0 && (
                            <Box>
                                <Typography variant="caption">
                                    <strong>Private tags:</strong>{' '}
                                    {
                                        fields[`priv-tags.${whoAmI.username}`]
                                        .filter(tag => !specialTagsList.includes(tag))
                                        .join(', ')
                                    }
                                </Typography>
                            </Box>
                        )}
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
