import { Box, Card, CardContent, CardHeader, Grid, IconButton, Paper, Popper, Tooltip, Typography } from '@mui/material'
import { DateTime } from 'luxon'
import { observer } from 'mobx-react-lite'
import { cloneElement, FC, RefObject, useEffect, useRef, useState } from 'react'
import { makeStyles } from 'tss-react/mui'

import { createDownloadUrl, createThumbnailSrc, createThumbnailSrcSet } from '../../backend/api'
import { reactIcons } from '../../constants/icons'
import { specialTags, specialTagsList } from '../../constants/specialTags'
import { Hit } from '../../Types'
import { getPreviewParams, getTypeIcon, humanFileSize, makeUnsearchable, truncatePath } from '../../utils/utils'
import Loading from '../Loading'
import { useSharedStore } from '../SharedStoreProvider'

import type { Theme } from '@mui/material'

const useStyles = makeStyles()((theme: Theme) => ({
    card: {
        cursor: 'pointer',
        position: 'relative',
        marginTop: theme.spacing(1),
        borderLeft: '3px solid transparent',
        transition: (theme.transitions as any).create('border', {
            duration: (theme.transitions as any).duration.short,
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
    headerText: {
        overflow: 'hidden',
    },
    title: {
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
        fontFamily: (theme.typography as any).fontFamilyMono,
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
    },
    thumbnail: {
        padding: theme.spacing(1),
        paddingBottom: 0,
    },
    thumbnailImg: {
        height: 72,
        maxWidth: 100,
    },
    preview: {
        padding: theme.spacing(1),
    },
    previewImg: {
        width: 400,
    },
    previewImgLoading: {
        width: 1,
    },
}))

const timeMs = () => new Date().getTime()

interface ResultItemProps {
    hit: Hit
    url: string
    index: number
}

export const ResultItem: FC<ResultItemProps> = observer(({ hit, url, index }) => {
    const { classes, cx } = useStyles()
    const {
        user,
        hashStore: { hashState, setHashState },
    } = useSharedStore()

    const isPreview = hit._collection === hashState.preview?.c && hit._id === hashState.preview?.i
    const unsearchable = !!hashState.preview

    const nodeRef = useRef()
    const handleMouseDown = () => {
        ;(nodeRef.current as any).willFocus = !((nodeRef.current as any).tUp && timeMs() - (nodeRef.current as any).tUp < 300)
    }
    const handleMouseMove = () => {
        ;(nodeRef.current as any).willFocus = false
    }
    const handleMouseUp = () => {
        if ((nodeRef.current as any).willFocus) {
            ;(nodeRef.current as any).tUp = timeMs()
            setHashState({ ...getPreviewParams(hit), tab: undefined, subTab: undefined, previewPage: undefined })
        }
    }

    const thumbRef = useRef()
    const [showPreview, setShowPreview] = useState(false)
    const [previewLoading, setPreviewLoading] = useState(true)
    const handleThumbEnter = () => {
        setShowPreview(true)
        setPreviewLoading(true)
    }
    const handleThumbLeave = () => {
        setShowPreview(false)
    }

    useEffect(() => {
        if (isPreview && 'scrollIntoView' in (nodeRef.current as any)) {
            ;(nodeRef.current as any).scrollIntoView({ behavior: 'smooth', block: 'center' })
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
        root: classes.cardContentRoot,
    }

    return (
        <Card
            ref={nodeRef as unknown as RefObject<HTMLDivElement>}
            className={cx(classes.card, { [classes.selected]: isPreview })}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            data-test="result">
            <CardHeader
                classes={cardHeaderClasses}
                title={
                    <Grid container component="span" justifyContent="space-between" wrap="nowrap">
                        <Grid container item component="span" className={classes.headerText}>
                            <Grid item className={classes.title} component="span">
                                <Box component="span" className={classes.index}>
                                    {index}.
                                </Box>{' '}
                                {fields.filename}
                            </Grid>

                            <Grid container component="span">
                                {fields.ocr && (
                                    <Grid item component="span" className={classes.infoBox}>
                                        <Tooltip placement="top" title="OCR">
                                            {cloneElement(reactIcons.ocr, { className: classes.infoIcon })}
                                        </Tooltip>
                                    </Grid>
                                )}

                                {fields.pgp && (
                                    <Grid item component="span" className={classes.infoBox}>
                                        <Tooltip placement="top" title="encrypted">
                                            {cloneElement(reactIcons.pgp, { className: classes.infoIcon })}
                                        </Tooltip>
                                    </Grid>
                                )}

                                <Grid item component="span" className={classes.infoBox}>
                                    <Tooltip placement="top" title={fields['content-type']}>
                                        <Box component="span" className={classes.infoBox}>
                                            {cloneElement(getTypeIcon(fields.filetype), { className: classes.infoIcon })}
                                        </Box>
                                    </Tooltip>
                                </Grid>

                                {!!fields.attachments && (
                                    <Grid item component="span" className={classes.infoBox}>
                                        <Tooltip placement="top" title="has attachment(s)">
                                            <Box component="span" className={classes.infoBox}>
                                                {cloneElement(reactIcons.attachment, { className: classes.infoIcon })}
                                            </Box>
                                        </Tooltip>
                                    </Grid>
                                )}

                                <Grid item component="span" className={classes.collection}>
                                    {collection}
                                </Grid>
                            </Grid>

                            <Grid item component="span" className={classes.title}>
                                <Typography variant="body1" className={classes.title} component="span" color="textSecondary">
                                    {truncatePath(fields.path)}
                                </Typography>
                            </Grid>
                        </Grid>

                        <Grid item component="span">
                            {hit._source['has-thumbnails'] && (
                                <Box className={classes.thumbnail}>
                                    <img
                                        ref={thumbRef as unknown as RefObject<HTMLImageElement>}
                                        className={classes.thumbnailImg}
                                        srcSet={createThumbnailSrcSet(`doc/${hit._collection}/${hit._id}`)}
                                        onMouseEnter={handleThumbEnter}
                                        onMouseLeave={handleThumbLeave}
                                    />
                                    <Popper
                                        anchorEl={thumbRef.current}
                                        open={showPreview}
                                        placement="left-start"
                                        modifiers={[
                                            {
                                                name: 'preventOverflow',
                                                options: {
                                                    boundary: 'clippingParents',
                                                },
                                            },
                                        ]}>
                                        <Paper elevation={10} className={classes.preview}>
                                            {previewLoading && <Loading />}
                                            <img
                                                className={previewLoading ? classes.previewImgLoading : classes.previewImg}
                                                onLoad={() => setPreviewLoading(false)}
                                                src={createThumbnailSrc(`doc/${hit._collection}/${hit._id}`, 400)}
                                            />
                                        </Paper>
                                    </Popper>
                                </Box>
                            )}
                        </Grid>
                    </Grid>
                }
                action={
                    <>
                        <Grid container alignItems="center">
                            <Grid item>
                                <Tooltip title="Download original file">
                                    <IconButton size="small">
                                        <a href={downloadUrl} className={classes.buttonLink}>
                                            {cloneElement(reactIcons.downloadOutlined, { className: classes.actionIcon })}
                                        </a>
                                    </IconButton>
                                </Tooltip>
                            </Grid>

                            <Grid item>
                                <Tooltip title="Open in new tab">
                                    <IconButton size="small" style={{ marginRight: 15 }}>
                                        <a href={url} target="_blank" rel="noreferrer" className={classes.buttonLink}>
                                            {cloneElement(reactIcons.openNewTab, { className: classes.actionIcon })}
                                        </a>
                                    </IconButton>
                                </Tooltip>
                            </Grid>

                            {Object.entries(specialTags).map(([tag, params], tagIndex) => {
                                const tagsField = params.public ? fields.tags : fields[`priv-tags.${user.uuid}` as 'priv-tags.*']
                                if (tagsField?.includes(tag)) {
                                    return (
                                        <Grid item key={tagIndex}>
                                            <Tooltip placement="top" title={tag}>
                                                {cloneElement(reactIcons[params.present.icon], {
                                                    className: classes.actionIcon,
                                                    style: { color: params.present.color },
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
                                <Typography variant="caption">{fields['word-count']} words</Typography>
                            </Box>
                        )}

                        {!!fields.size && (
                            <Box>
                                <Typography variant="caption">
                                    <strong>Size:</strong> {humanFileSize(fields.size)}
                                </Typography>
                            </Box>
                        )}

                        {!!fields.date && (
                            <Box>
                                <Typography variant="caption">
                                    <strong>{fields.filetype === 'email' ? 'Date' : 'Modified'}:</strong>{' '}
                                    {DateTime.fromISO(fields.date, { locale: 'en-US' }).toLocaleString(DateTime.DATE_FULL)}
                                </Typography>
                            </Box>
                        )}

                        {fields.filetype === 'email' && fields.from && (
                            <Box>
                                <Typography variant="caption" className={classes.textField}>
                                    <strong>From:</strong> {fields.from}
                                </Typography>
                            </Box>
                        )}

                        {fields.filetype === 'email' && fields.subject && (
                            <Box>
                                <Typography variant="caption">
                                    <strong>Subject:</strong> {fields.subject}
                                </Typography>
                            </Box>
                        )}

                        {!!fields['date-created'] && (
                            <Box>
                                <Typography variant="caption">
                                    <strong>Created:</strong>{' '}
                                    {DateTime.fromISO(fields['date-created'], { locale: 'en-US' }).toLocaleString(DateTime.DATE_FULL)}
                                </Typography>
                            </Box>
                        )}

                        {fields.tags?.filter((tag: string) => !specialTagsList.includes(tag)).length > 0 && (
                            <Box>
                                <Typography variant="caption">
                                    <strong>Public tags:</strong> {fields.tags.filter((tag: string) => !specialTagsList.includes(tag)).join(', ')}
                                </Typography>
                            </Box>
                        )}

                        {fields[`priv-tags.${user.uuid}` as 'priv-tags.*']?.filter((tag: string) => !specialTagsList.includes(tag)).length > 0 && (
                            <Box>
                                <Typography variant="caption">
                                    <strong>Private tags:</strong>{' '}
                                    {fields[`priv-tags.${user.uuid}` as 'priv-tags.*']
                                        .filter((tag: string) => !specialTagsList.includes(tag))
                                        .join(', ')}
                                </Typography>
                            </Box>
                        )}
                    </Grid>
                    <Grid item md={8} className={classes.text}>
                        {Object.entries(highlights).map(([key, highlight]) => (
                            <Grid container key={key} spacing={1} wrap="nowrap">
                                {key !== 'text' && (
                                    <Grid item>
                                        <span className={classes.key}>{`${key}:`}</span>
                                    </Grid>
                                )}
                                <Grid item container direction="column">
                                    {[...highlight].map((item, index) => (
                                        <Grid
                                            item
                                            key={index}
                                            dangerouslySetInnerHTML={{
                                                __html: unsearchable ? makeUnsearchable(item) : item,
                                            }}
                                        />
                                    ))}
                                </Grid>
                            </Grid>
                        ))}
                    </Grid>{' '}
                </Grid>
            </CardContent>
        </Card>
    )
})
