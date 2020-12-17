import React, { memo, useContext, useEffect, useState } from 'react'
import { blue } from '@material-ui/core/colors'
import ChipInput from 'material-ui-chip-input'
import { Chip, IconButton } from '@material-ui/core'
import { Lock, LockOpen } from '@material-ui/icons';
import Section from './Section'
import Loading from '../Loading'
import { UserContext } from '../../../pages/_app'
import { createTag, deleteTag, tags as tagsAPI, updateTag } from '../../backend/api'

function TagsSection({ collection, digest }) {
    if (!collection || ! digest) {
        return null
    }

    const whoAmI = useContext(UserContext)

    const docUrl = `/doc/${collection}/${digest}`

    const [tags, setTags] = useState([])
    const [loading, setLoading] = useState(!!docUrl)
    useEffect(() => {
        if (docUrl) {
            setLoading(true)
            tagsAPI(docUrl).then(data => {
                setTags(data)
                setLoading(false)
            })
        }
    }, [collection, digest])

    const [mutating, setMutating] = useState(false)
    const handleTagAdd = tag => {
        setMutating(true)
        createTag(docUrl, { tag, public: false }).then(newTag => {
            setTags([...tags, newTag])
            setMutating(false)
        }).catch(() => {
            setMutating(false)
        })
    }

    const handleTagDelete = tag => {
        tag.isMutating = true
        setTags([...tags])
        deleteTag(docUrl, tag.id).then(() => {
            setTags([...(tags.filter(t => t.id !== tag.id))])
        }).catch(() => {
            tag.isMutating = false
            setTags([...tags])
        })
    }

    const handleClick = tag => () => {
        if (tag.user === whoAmI.username) {
            tag.isMutating = true
            setTags([...tags])
            updateTag(docUrl, tag.id, {public: !tag.public}).then(changedTag => {
                Object.assign(tag, {
                    ...changedTag,
                    isMutating: false,
                })
                setTags([...tags])
            }).catch(() => {
                tag.isMutating = false
                setTags([...tags])
            })
        }
    }

    const renderChip = ({ value, text, chip, isDisabled, isReadOnly, handleDelete, className }, key) => (
        <Chip
            key={key}
            icon={chip.user === whoAmI.username ? chip.public ?
                <IconButton size="small" onClick={handleClick(chip)} ><LockOpen /></IconButton> :
                <IconButton size="small" onClick={handleClick(chip)} ><Lock /></IconButton> : null
            }
            disabled={chip.isMutating}
            className={className}
            style={{
                pointerEvents: isDisabled || isReadOnly ? 'none' : undefined,
                backgroundColor: chip.public ? blue[300] : undefined
            }}
            onDelete={chip.user === whoAmI.username ? handleDelete : null}
            label={chip.tag}
        />
    )

    return (
        <Section title="Tags">
            {loading ? <Loading /> :
                <ChipInput
                    value={tags}
                    onAdd={handleTagAdd}
                    onDelete={handleTagDelete}
                    disabled={mutating}
                    chipRenderer={renderChip}
                    placeholder="no tags, start typing to add"
                    fullWidth
                />
            }
        </Section>
    )
}

export default memo(TagsSection)
