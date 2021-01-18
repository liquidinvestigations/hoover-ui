import React from 'react'
import {
    Delete,
    DeleteOutlined,
    Error,
    ErrorOutline,
    Star,
    StarOutline,
    Visibility,
    VisibilityOffOutlined
} from '@material-ui/icons'
import { brown, green, grey, red } from '@material-ui/core/colors'

export const specialTags = [{
    tag: 'starred',
    color: '#ffda80',
    public: false,
    tooltip: 'mark/unmark as starred (private, for yourself)',
    present: {
        icon: <Star />,
        color: '#ffb400',
    },
    absent: {
        icon: <StarOutline />,
        color: grey[600],
    },
    showInToolbar: true,
    showInTagsTab: false,
},{
    tag: 'recommended',
    color: green[200],
    public: true,
    tooltip: 'mark/unmark as recommended (public, for everybody)',
    present: {
        icon: <Error />,
        color: green[500],
    },
    absent: {
        icon: <ErrorOutline />,
        color: grey[600],
    },
    showInToolbar: true,
    showInTagsTab: false,
},{
    tag: 'seen',
    color: brown[200],
    public: true,
    tooltip: 'mark / unmark seen (public)',
    present: {
        label: 'seen',
        icon: <Visibility />,
        color: brown[500],
    },
    absent: {
        label: 'not seen',
        icon: <VisibilityOffOutlined />,
        color: grey[600],
    },
    showInToolbar: false,
    showInTagsTab: true,
},{
    tag: 'trash',
    color: red[200],
    public: true,
    tooltip: 'mark / unmark trash (public)',
    present: {
        label: 'trash',
        icon: <Delete />,
        color: red[500],
    },
    absent: {
        label: 'not trash',
        icon: <DeleteOutlined />,
        color: grey[600],
    },
    showInToolbar: false,
    showInTagsTab: true,
}]

export const specialTagsList = specialTags.map(tag => tag.tag)
export const publicTagsList = specialTags.filter(tag => tag.public).map(tag => tag.tag)
