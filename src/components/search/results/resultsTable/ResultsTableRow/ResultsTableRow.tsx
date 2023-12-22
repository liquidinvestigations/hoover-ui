import { IconButton, Paper, Popper, TableCell, TableRow, Tooltip } from '@mui/material'
import { useTolgee } from '@tolgee/react'
import { observer } from 'mobx-react-lite'
import { cloneElement, FC, ReactElement, useEffect, useRef, useState } from 'react'

import { createDownloadUrl, createThumbnailSrc } from '../../../../../backend/api'
import { ResultColumnFormat } from '../../../../../constants/availableColumns'
import { reactIcons } from '../../../../../constants/icons'
import { Hit, ValueOf } from '../../../../../Types'
import { defaultSearchParams } from '../../../../../utils/queryUtils'
import {
    documentViewUrl,
    extractStringFromField,
    formatDateTime,
    getPreviewParams,
    getTagIcon,
    getTypeIcon,
    humanFileSize,
    shortenName,
} from '../../../../../utils/utils'
import { Loading } from '../../../../common/Loading/Loading'
import { useSharedStore } from '../../../../SharedStoreProvider'

import { useStyles } from './ResultsTableRow.styles'

interface ResultsTableRowProps {
    hit: Hit
    index: number
}

export const ResultsTableRow: FC<ResultsTableRowProps> = observer(({ hit, index }) => {
    const { classes, cx } = useStyles()
    const {
        query: { page, size } = defaultSearchParams,
        searchViewStore: { resultsColumns },
    } = useSharedStore().searchStore
    const tolgee = useTolgee(['language'])

    const start = 1 + (page - 1) * size

    const nodeRef = useRef<HTMLTableRowElement>(null)
    const { hashState, setHashState } = useSharedStore().hashStore

    const url = documentViewUrl(hit)
    const fields = hit._source || {}
    const collection = hit._collection || ''
    const downloadUrl = createDownloadUrl(url, extractStringFromField(fields?.filename))
    const isPreview = collection === hashState.preview?.c && hit._id === hashState.preview?.i

    const handleResultClick = () => {
        setHashState({ ...getPreviewParams(hit), tab: undefined, subTab: undefined, previewPage: undefined })
    }

    useEffect(() => {
        if (nodeRef.current && isPreview && 'scrollIntoView' in nodeRef.current) {
            nodeRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' })
        }
    }, [isPreview])

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

    const getValue = (path: string) => {
        const pathParts = path.split('.')
        let pathPart,
            value: ValueOf<Hit> = hit[pathParts[0] as keyof Hit]

        while ((pathPart = pathParts.shift())) {
            value = hit[pathPart as keyof Hit]
        }
        return value
    }

    const formatString = (value: ValueOf<Hit>): JSX.Element | undefined | null | string =>
        value && typeof value === 'string' ? shortenName(value, 60) : null

    const formatBoolean = (value: ValueOf<Hit>): string => (value ? 'yes' : 'no')

    const formatDate = (value: ValueOf<Hit>): JSX.Element | string | null =>
        value && typeof value === 'string' ? formatDateTime(value, tolgee.getLanguage()) : null

    const formatSize = (value: ValueOf<Hit>): JSX.Element | null => (value && typeof value === 'number' ? humanFileSize(value) : null)

    const formatIcon = (value: ValueOf<Hit>): JSX.Element => (
        <Tooltip placement="top" title={value ? String(value) : 'unknown'}>
            <span>{cloneElement(getTypeIcon(String(value)), { className: classes.infoIcon })}</span>
        </Tooltip>
    )

    const formatArray = (value: ValueOf<Hit>): JSX.Element | null =>
        value && typeof value === 'string' ? (
            <>
                {[value.slice(0, 7)].map((el: string) => (
                    <>
                        {shortenName(el)}
                        <br />
                    </>
                ))}
                {value.length > 7 && '...'}
            </>
        ) : null

    const formatTags = (icon: (tag: string) => ReactElement | null, value: ValueOf<Hit>): JSX.Element | null =>
        value && typeof value === 'string' ? (
            <>
                {[value.slice(0, 7)].map((el: string) => (
                    <>
                        {icon(el) && cloneElement(icon(el) as ReactElement, { className: classes.tagIcon })}
                        {shortenName(el)}
                        <br />
                    </>
                ))}
                {value.length > 7 && '...'}
            </>
        ) : null

    const formatThumbnail = (value: ValueOf<Hit>): JSX.Element | null =>
        !value ? null : (
            <>
                {cloneElement(reactIcons.visibility, {
                    ref: thumbRef,
                    className: classes.infoIcon,
                    onMouseEnter: handleThumbEnter,
                    onMouseLeave: handleThumbLeave,
                })}
                <Popper
                    anchorEl={thumbRef.current}
                    open={showPreview}
                    placement="right-start"
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
                            alt="preview image"
                            className={previewLoading ? classes.previewImgLoading : classes.previewImg}
                            onLoad={() => setPreviewLoading(false)}
                            src={createThumbnailSrc(`doc/${hit._collection}/${hit._id}`, 400)}
                        />
                    </Paper>
                </Popper>
            </>
        )

    const formatField = (field: string, path: string, format: ResultColumnFormat) => {
        const value = getValue(path)
        const icon = (tag: string) => getTagIcon(tag, field === 'tags')

        switch (format) {
            case 'string':
                return formatString(value)
            case 'boolean':
                return formatBoolean(value)
            case 'date':
                return formatDate(value)
            case 'size':
                return formatSize(value)
            case 'icon':
                return formatIcon(value)
            case 'array':
                return formatArray(value)
            case 'tags':
                return formatTags(icon, value)
            case 'thumbnail':
                return formatThumbnail(value)
        }
    }

    return (
        <TableRow ref={nodeRef} onClick={handleResultClick} className={cx({ [classes.selected]: isPreview })}>
            <TableCell>{start + index}</TableCell>
            {resultsColumns.map(([field, { align, path, format }]) => (
                <TableCell key={field} align={align}>
                    {formatField(field, path, format)}
                </TableCell>
            ))}
            <TableCell>
                <Tooltip title="Open in new tab">
                    <IconButton size="small" style={{ marginRight: 15 }}>
                        <a href={url} target="_blank" rel="noreferrer" className={classes.buttonLink}>
                            {cloneElement(reactIcons.openNewTab, { className: classes.actionIcon })}
                        </a>
                    </IconButton>
                </Tooltip>
                <Tooltip title="Download original file">
                    <IconButton size="small">
                        <a href={downloadUrl} className={classes.buttonLink}>
                            {cloneElement(reactIcons.downloadOutlined, { className: classes.actionIcon })}
                        </a>
                    </IconButton>
                </Tooltip>
            </TableCell>
        </TableRow>
    )
})
