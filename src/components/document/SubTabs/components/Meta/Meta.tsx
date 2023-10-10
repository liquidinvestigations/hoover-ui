import { Box, Divider, List, ListItem, ListItemText, Typography } from '@mui/material'
import { useTranslate } from '@tolgee/react'
import { observer } from 'mobx-react-lite'
import Link from 'next/link'
import { MouseEvent, useEffect, useState } from 'react'

import { SourceField } from '../../../../../Types'
import { useSharedStore } from '../../../../SharedStoreProvider'
import { LinkMenu } from '../../../LinkMenu'

import { useStyles } from './Meta.styles'

export const Meta = observer(() => {
    const { t } = useTranslate()
    const { classes } = useStyles()
    const {
        data,
        collection,
        collectionBaseUrl,
        metaStore: { tableData, metaData },
        documentSearchStore: { query, setActiveSearch, metaSearchStore },
    } = useSharedStore().documentStore

    useEffect(() => {
        setActiveSearch(metaSearchStore)
    }, [setActiveSearch, metaSearchStore])

    useEffect(() => {
        metaSearchStore.scrollToHighlight()
    }, [metaSearchStore])

    const [menuPosition, setMenuPosition] = useState<{ left: number; top: number } | undefined>()
    const [currentLink, setCurrentLink] = useState<{ field: string; term: string | string[] } | undefined>()

    const handleLinkClick = (field: string, term: any) => (event: MouseEvent) => {
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

    const getFieldValue = (key: string, value: any) => {
        switch (key) {
            case 'detected-objects':
                return value['object']
            case 'image-classes':
                return value['class']
            default:
                return value.toString()
        }
    }

    const getFieldScore = (key: string, value: any) => {
        switch (key) {
            case 'detected-objects':
            case 'image-classes':
                return <span className={classes.score}>({value.score})</span>
            default:
                return null
        }
    }

    const renderElement = (key: string, value: any, componentKey: string) => {
        const fieldValue = getFieldValue(key, value)

        return (
            <Typography key={componentKey} component="pre" variant="caption" className={classes.raw}>
                <strong>{key}:</strong>{' '}
                <span className={classes.searchField} onClick={handleLinkClick(getFieldSearchKey(key), fieldValue)}>
                    {/* I have removed the Tooltip temporarily */}
                    <span dangerouslySetInnerHTML={{ __html: fieldValue }}></span>
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
                                <Link href={`${collectionBaseUrl}/${data.digest}`} title={t('open_digest_url', 'open digest URL')} shallow>
                                    {data.digest}
                                </Link>
                            }
                        />
                    </ListItem>
                )}

                {(query ? metaSearchStore.highlightedTableData : tableData).map((tableData) => (
                    <ListItem key={tableData.field} disableGutters>
                        <ListItemText
                            primary={tableData.label}
                            secondary={
                                <span
                                    className={classes.searchField}
                                    onClick={handleLinkClick(tableData.searchKey, tableData.searchTerm)}
                                    dangerouslySetInnerHTML={{ __html: tableData.display }}
                                />
                            }
                        />
                    </ListItem>
                ))}
            </List>

            <Divider />

            <Box>
                {(query ? metaSearchStore.highlightedMetaData : metaData).map(({ key, value, componentKey }) =>
                    Array.isArray(value) ? value.map((v) => renderElement(key, v, componentKey)) : renderElement(key, value, componentKey),
                )}
            </Box>

            <LinkMenu link={currentLink as { field: SourceField; term: string }} anchorPosition={menuPosition} onClose={handleLinkMenuClose} />
        </Box>
    )
})
