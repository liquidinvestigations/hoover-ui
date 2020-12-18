import React, { memo, useContext, useEffect, useState } from 'react'
import { blue } from '@material-ui/core/colors'
import ChipInput from 'material-ui-chip-input'
import { Chip, IconButton, Tooltip } from '@material-ui/core'
import { Lock, LockOpen } from '@material-ui/icons';
import Section from './Section'
import Loading from '../Loading'
import { UserContext } from '../../../pages/_app'
import { createTag, deleteTag, updateTag } from '../../backend/api'

function TagsSection({ loading, digestUrl, tags, onTagsChanged }) {
    const whoAmI = useContext(UserContext)

    const [mutating, setMutating] = useState(false)
    const handleTagAdd = tag => {
        setMutating(true)
        createTag(digestUrl, { tag, public: false }).then(newTag => {
            onTagsChanged([...tags, newTag])
            setMutating(false)
        }).catch(() => {
            setMutating(false)
        })
    }

    const handleTagDelete = tag => {
        tag.isMutating = true
        onTagsChanged([...tags])
        deleteTag(digestUrl, tag.id).then(() => {
            onTagsChanged([...(tags.filter(t => t.id !== tag.id))])
        }).catch(() => {
            tag.isMutating = false
            onTagsChanged([...tags])
        })
    }

    const handleClick = tag => () => {
        if (tag.user === whoAmI.username) {
            tag.isMutating = true
            onTagsChanged([...tags])
            updateTag(digestUrl, tag.id, {public: !tag.public}).then(changedTag => {
                Object.assign(tag, {
                    ...changedTag,
                    isMutating: false,
                })
                onTagsChanged([...tags])
            }).catch(() => {
                tag.isMutating = false
                onTagsChanged([...tags])
            })
        }
    }

    if (!digestUrl) {
        return null
    }

    const renderChip = ({ value, text, chip, isDisabled, isReadOnly, handleDelete, className }, key) => (
        <Chip
            key={key}
            icon={chip.user === whoAmI.username ? chip.public ?
                <Tooltip title="Make private">
                    <IconButton
                        size="small"
                        onClick={handleClick(chip)}
                    >
                        <LockOpen />
                    </IconButton>
                </Tooltip> :
                <Tooltip title="Make public">
                    <IconButton
                        size="small"
                        onClick={handleClick(chip)}
                    >
                        <Lock />
                    </IconButton>
                </Tooltip> : null
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
