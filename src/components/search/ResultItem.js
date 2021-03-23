import React, { cloneElement, memo, useEffect, useRef } from 'react'
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
import { AttachFile, CloudDownloadOutlined, Launch, Lock, Translate } from '@material-ui/icons'
import { useUser } from '../UserProvider'
import { useHashState } from '../HashStateProvider'
import { getIconReactComponent, getPreviewParams, humanFileSize, makeUnsearchable, truncatePath } from '../../utils'
import { createDownloadUrl } from '../../backend/api'
import { specialTags, specialTagsList } from '../../constants/specialTags'

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
        marginRight: theme.spacing(2),
        display: 'block',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
    },
    subtitle: {
        display: 'block',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
    },
    index: {
        color: theme.palette.grey[500],
    },
    selected: {
        border: `2px solid ${theme.palette.secondary.main}`,
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
        fontSize: 20,
        color: theme.palette.grey[600],
    },
    infoBox: {
        display: 'inline-flex',
        alignItems: 'center',
    },
    infoIcon: {
        fontSize: 20,
        color: theme.palette.grey[600],
        marginRight: theme.spacing(0.3),
    },
    collection: {
        fontSize: 16,
        color: theme.palette.grey.A200,
        display: 'inline-flex',
        alignItems: 'center',
    },
    textField: {
        width: '100%',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        display: 'inline-block',
    },
    buttonLink: {
        lineHeight: 0,
    }
}))

const timeMs = () => new Date().getTime()

function ResultItem({ hit, url, index }) {
    const classes = useStyles()
    const whoAmI = useUser()
    const { hashState, setHashState } = useHashState()

    const isPreview = hit._collection === hashState.preview?.c && hit._id === hashState.preview?.i
    const unsearchable = !!hashState.preview

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
            setHashState({ ...getPreviewParams(hit), tab: undefined, subTab: undefined, previewPage: undefined })
        }
    }

    useEffect(() => {
        if (isPreview && 'scrollIntoView' in nodeRef.current) {
            nodeRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' })
        }
    }, [isPreview])

    const fields = hit._source || {}
    const highlights = hit.highlight || {}
    const collection = hit._collection || ''
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
                    <Grid container component="span">
                        <Grid item className={classes.title} component="span">
                            <Box component="span" className={classes.index}>{index}.</Box> {fields.filename}
                        </Grid>

                        <Grid container component="span">
                            {fields.ocr && (
                                <Grid item component="span" className={classes.infoBox}>
                                    <Tooltip placement="top" title="OCR">
                                        <Translate className={classes.infoIcon} />
                                    </Tooltip>
                                </Grid>
                            )}


                            {fields.pgp && (
                                <Grid item component="span" className={classes.infoBox}>
                                    <Tooltip placement="top" title="encrypted">
                                        <Lock className={classes.infoIcon} />
                                    </Tooltip>
                                </Grid>
                            )}

                            <Grid item component="span" className={classes.infoBox}>
                                <Tooltip placement="top" title={fields['content-type']}>
                                    <Box component="span" className={classes.infoBox}>
                                        <SvgIcon
                                            className={classes.infoIcon}
                                            component={getIconReactComponent(fields.filetype)}
                                        />
                                    </Box>
                                </Tooltip>
                            </Grid>

                            {!!fields.attachments && (
                                <Grid item component="span" className={classes.infoBox}>
                                    <Tooltip placement="top" title="has attachment(s)">
                                        <Box component="span" className={classes.infoBox}>
                                            <AttachFile className={classes.infoIcon} />
                                        </Box>
                                    </Tooltip>
                                </Grid>
                            )}

                            <Grid item component="span" className={classes.collection}>
                                {collection}
                            </Grid>
                        </Grid>
                    </Grid>
                }
                subheader={
                    <span className={classes.subtitle}>
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
                                const tagsField = s.public ? fields.tags : fields[`priv-tags.${whoAmI.uuid}`]
                                if (tagsField?.includes(s.tag)) {
                                    return (
                                        <Grid item key={k}>
                                            <Tooltip placement="top" title={s.tag}>
                                                {cloneElement(s.present.icon, {
                                                    className: classes.actionIcon,
                                                    style: { color: s.present.color }
                                                })}
                                            </Tooltip>
                                        </Grid>
                                    )
                                }
                            })}
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
                                    {humanFileSize(fields.size)}
                                </Typography>
                            </Box>
                        )}

                        {!!fields.date && (
                            <Box>
                                <Typography variant="caption">
                                    <strong>{fields.filetype === 'email' ? 'Date' : 'Modified'}:</strong>{' '}
                                    {DateTime.fromISO(fields.date, { locale: 'en-US' })
                                        .toLocaleString(DateTime.DATE_FULL)}
                                </Typography>
                            </Box>
                        )}

                        {fields.filetype === 'email' && fields.from && (
                            <Box>
                                <Typography variant="caption" className={classes.textField}>
                                    <strong>From:</strong>{' '}
                                    {fields.from}
                                </Typography>
                            </Box>
                        )}

                        {fields.filetype === 'email' && fields.subject && (
                            <Box>
                                <Typography variant="caption">
                                    <strong>Subject:</strong>{' '}
                                    {fields.subject}
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

                        {fields[`priv-tags.${whoAmI.uuid}`]?.filter(tag => !specialTagsList.includes(tag)).length > 0 && (
                            <Box>
                                <Typography variant="caption">
                                    <strong>Private tags:</strong>{' '}
                                    {
                                        fields[`priv-tags.${whoAmI.uuid}`]
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
