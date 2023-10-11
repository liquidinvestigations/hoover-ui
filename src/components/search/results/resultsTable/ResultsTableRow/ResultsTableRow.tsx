import { IconButton, Paper, Popper, TableCell, TableRow, Tooltip } from '@mui/material'
import { useTolgee } from '@tolgee/react'
import { observer } from 'mobx-react-lite'
import Image from 'next/image'
import { cloneElement, FC, ReactElement, useEffect, useRef, useState } from 'react'

import { createDownloadUrl, createThumbnailSrc } from '../../../../../backend/api'
import { ResultColumnFormat } from '../../../../../constants/availableColumns'
import { reactIcons } from '../../../../../constants/icons'
import { Hit } from '../../../../../Types'
import { defaultSearchParams } from '../../../../../utils/queryUtils'
import { documentViewUrl, formatDateTime, getPreviewParams, getTagIcon, getTypeIcon, humanFileSize, shortenName } from '../../../../../utils/utils'
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
    const downloadUrl = createDownloadUrl(url, fields.filename[0] ?? '')
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
        let pathParts = path.split('.'),
            pathPart,
            value: any = hit

        while ((pathPart = pathParts.shift())) {
            value = value[pathPart as keyof Hit]
        }
        return value
    }

    const formatField = (field: string, path: string, format: ResultColumnFormat) => {
        const value = getValue(path)

        switch (format) {
            case 'string':
                return value ? shortenName(value, 60) : null
            case 'boolean':
                return value ? 'yes' : 'no'
            case 'date':
                return value ? formatDateTime(value, tolgee.getLanguage()) : null
            case 'size':
                return value ? humanFileSize(value) : null
            case 'icon':
                return (
                    <Tooltip placement="top" title={value ? value : 'unknown'}>
                        <span>{cloneElement(getTypeIcon(value), { className: classes.infoIcon })}</span>
                    </Tooltip>
                )
            case 'array':
                return !value ? null : (
                    <>
                        {value.slice(0, 7).map((el: string) => (
                            <>
                                {shortenName(el)}
                                <br />
                            </>
                        ))}
                        {value.length > 7 && '...'}
                    </>
                )
            case 'tags':
                const icon = (tag: string) => getTagIcon(tag, field === 'tags')
                return !value ? null : (
                    <>
                        {value.slice(0, 7).map((el: string) => (
                            <>
                                {icon(el) && cloneElement(icon(el) as ReactElement, { className: classes.tagIcon })}
                                {shortenName(el)}
                                <br />
                            </>
                        ))}
                        {value.length > 7 && '...'}
                    </>
                )
            case 'thumbnail':
                return !value ? null : (
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
                            ]}
                        >
                            <Paper elevation={10} className={classes.preview}>
                                {previewLoading && <Loading />}
                                <Image
                                    alt="preview image"
                                    className={previewLoading ? classes.previewImgLoading : classes.previewImg}
                                    onLoad={() => setPreviewLoading(false)}
                                    src={createThumbnailSrc(`doc/${hit._collection}/${hit._id}`, 400)}
                                />
                            </Paper>
                        </Popper>
                    </>
                )
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
