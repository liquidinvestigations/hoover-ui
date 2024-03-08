import { Typography } from '@mui/material'
import { useTolgee } from '@tolgee/react'
import { cloneElement, ReactElement, useEffect, useRef } from 'react'

import { createDownloadUrl } from '../../../../../../backend/api'
import { ResultColumnFormat } from '../../../../../../constants/availableColumns'
import { Hit } from '../../../../../../Types'
import { defaultSearchParams } from '../../../../../../utils/queryUtils'
import {
    documentViewUrl,
    extractStringFromField,
    formatDateTime,
    formatThousands,
    getPreviewParams,
    getTagIcon,
    humanFileSize,
} from '../../../../../../utils/utils'
import { IconWithTooltip } from '../../../../../common/IconWithTooltip/IconWithTooltip'
import { TypographyWithTooltip } from '../../../../../common/TypographyWithTooltip/TypographyWithTooltip'
import { useSharedStore } from '../../../../../SharedStoreProvider'
import { Thumbnail } from '../components/Thumbnail/Thumbnail'
import { MAX_FILE_NAMES } from '../ResultsTableRow.const'
import { useStyles } from '../ResultsTableRow.styles'
import { createNestedHitPathMap } from '../utils'

export const useResultsTableRow = (hit: Hit) => {
    const {
        searchStore: { query: { page, size } = defaultSearchParams },
        hashStore: { hashState, setHashState },
    } = useSharedStore()
    const { classes } = useStyles()
    const tolgee = useTolgee(['language'])
    const hitPathMap = createNestedHitPathMap(hit)
    const nodeRef = useRef<HTMLTableRowElement>(null)
    const start = 1 + (page - 1) * size
    const url = documentViewUrl(hit)
    const fields = hit._source || {}
    const collection = hit._collection || ''
    const downloadUrl = createDownloadUrl(url, extractStringFromField(fields?.filename))
    const isPreview = collection === hashState.preview?.c && hit._id === hashState.preview?.i

    useEffect(() => {
        if (nodeRef.current && isPreview && 'scrollIntoView' in nodeRef.current) {
            nodeRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' })
        }
    }, [isPreview])

    const handleResultClick = () => {
        setHashState({ ...getPreviewParams(hit), tab: undefined, subTab: undefined, previewPage: undefined })
    }

    // eslint-disable-next-line complexity
    const formatField = (field: string, path: string, format: ResultColumnFormat) => {
        const value = hitPathMap[path as keyof typeof hitPathMap]
        if (!value) return null

        switch (format) {
            case 'string':
                return <TypographyWithTooltip value={value as string} maxCharacters={60} />
            case 'number':
                return <Typography>{formatThousands(value as number)}</Typography>
            case 'boolean':
                return <Typography>{value ? 'yes' : 'no'}</Typography>
            case 'date':
                return <Typography>{formatDateTime(value as string, tolgee.getLanguage())}</Typography>
            case 'size':
                return <Typography>{humanFileSize(value as number)}</Typography>
            case 'icon':
                return <IconWithTooltip value={value as string} className={classes.infoIcon} />
            case 'array':
                return [
                    ...(value as string[])
                        .slice(0, MAX_FILE_NAMES)
                        .map((el: string) => <TypographyWithTooltip sx={{ display: 'block' }} key={el} value={el as string} />),
                    ...((value as string[]).length > MAX_FILE_NAMES ? [<Typography key="ellipsis">...</Typography>] : []),
                ]
            case 'tags':
                return [
                    ...(value as string[]).slice(0, MAX_FILE_NAMES).map((el: string) => {
                        const tagIcon = getTagIcon(el, field === 'tags') as ReactElement
                        return (
                            <>
                                {tagIcon && cloneElement(tagIcon, { className: classes.tagIcon })}
                                <TypographyWithTooltip sx={{ display: 'block' }} key={el} value={el as string} />
                            </>
                        )
                    }),
                    ...((value as string[]).length > MAX_FILE_NAMES ? [<Typography key="ellipsis">...</Typography>] : []),
                ]
            case 'thumbnail':
                return <Thumbnail hit={hit} />
        }
    }

    return { formatField, nodeRef, isPreview, start, url, downloadUrl, handleResultClick }
}
