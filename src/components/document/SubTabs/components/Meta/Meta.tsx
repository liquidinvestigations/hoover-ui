import { Box, Divider, List, ListItem, ListItemText, Tooltip, Typography } from '@mui/material'
import { useTranslate } from '@tolgee/react'
import { observer } from 'mobx-react-lite'
import { MouseEvent, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

import { ELLIPSIS_TERM_LENGTH } from '../../../../../constants/general'
import { SourceField } from '../../../../../Types'
import { useSharedStore } from '../../../../SharedStoreProvider'
import { LinkMenu } from '../../../LinkMenu'

import { useStyles } from './Meta.styles'

interface Value {
    object?: string
    class?: string
    score?: number
}

export const Meta = observer(() => {
    const { t } = useTranslate()
    const { classes } = useStyles()
    const {
        data,
        collection,
        collectionBaseUrl,
        metaStore: { tableData, metaData },
        documentSearchStore: { query, metaSearchStore },
    } = useSharedStore().documentStore

    useEffect(() => {
        metaSearchStore.scrollToHighlight()
    }, [metaSearchStore])

    const [menuPosition, setMenuPosition] = useState<{ left: number; top: number } | undefined>()
    const [currentLink, setCurrentLink] = useState<{ field: string; term: string | string[] } | undefined>()

    const handleLinkClick = (field: string, term: string | string[]) => (event: MouseEvent) => {
        setCurrentLink({ field, term })
        setMenuPosition({ left: event.clientX, top: event.clientY })
    }

    const handleLinkMenuClose = () => {
        setMenuPosition(undefined)
    }

    const getFieldSearchKey = (key: string) => {
        switch (key) {
            case 'detected-objects':
                return `${key}.object.keyword`
            case 'image-classes':
                return `${key}.class.keyword`
            default:
                return key
        }
    }

    const getFieldValue = (key: string, value: Value): string => {
        switch (key) {
            case 'detected-objects':
                return value['object'] || ''
            case 'image-classes':
                return value['class'] || ''
            default:
                return value.toString()
        }
    }

    const getFieldScore = (key: string, value: Value) => {
        switch (key) {
            case 'detected-objects':
            case 'image-classes':
                return <span className={classes.score}>({value.score})</span>
            default:
                return null
        }
    }

    const renderElement = (key: string, value: Value, componentKey: string) => {
        const fieldValue = getFieldValue(key, value)

        return (
            <Typography key={componentKey} component="pre" variant="caption" className={classes.raw}>
                <strong>{key}:</strong>{' '}
                <span className={classes.searchField} onClick={handleLinkClick(getFieldSearchKey(key), fieldValue)}>
                    {fieldValue.length > ELLIPSIS_TERM_LENGTH ? (
                        <Tooltip title={fieldValue}>
                            <span dangerouslySetInnerHTML={{ __html: fieldValue }}></span>
                        </Tooltip>
                    ) : (
                        <span dangerouslySetInnerHTML={{ __html: fieldValue }}></span>
                    )}
                    {getFieldScore(key, value)}
                </span>
            </Typography>
        )
    }

    return (
        <Box className={classes.container}>
            <List dense>
                <ListItem disableGutters>
                    <ListItemText primary={t('collection', 'Collection')} secondary={collection} />
                </ListItem>

                {!!data?.digest && (
                    <ListItem disableGutters>
                        <ListItemText
                            primary="ID"
                            secondary={
                                <Link to={`${collectionBaseUrl}/${data.digest}`} title={t('open_digest_url', 'open digest URL')}>
                                    {data.digest}
                                </Link>
                            }
                        />
                    </ListItem>
                )}

                {(query.length > 2 ? metaSearchStore.highlightedTableData : tableData).map((tableData) => (
                    <ListItem key={tableData.field} disableGutters>
                        <ListItemText
                            primary={tableData.label}
                            secondary={
                                typeof tableData.display === 'string' ? (
                                    <span
                                        className={classes.searchField}
                                        onClick={handleLinkClick(tableData.searchKey, tableData.searchTerm)}
                                        dangerouslySetInnerHTML={{ __html: tableData.display }}
                                    />
                                ) : (
                                    tableData.display
                                )
                            }
                        />
                    </ListItem>
                ))}
            </List>

            <Divider />

            <Box>
                {(query.length > 2 ? metaSearchStore.highlightedMetaData : metaData).map(({ key, value, componentKey }) =>
                    Array.isArray(value)
                        ? value.map((v) => renderElement(key, v as Value, componentKey))
                        : renderElement(key, value as Value, componentKey),
                )}
            </Box>

            <LinkMenu link={currentLink as { field: SourceField; term: string }} anchorPosition={menuPosition} onClose={handleLinkMenuClose} />
        </Box>
    )
})
