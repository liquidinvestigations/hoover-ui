import { T } from '@tolgee/react'
import { ReactElement } from 'react'

export interface SpecialTag {
    color: string
    public: boolean
    tooltip: ReactElement
    present: {
        icon: string
        color: string
        label?: string
    }
    absent: {
        icon: string
        color: string
        label?: string
    }
    showInToolbar: boolean
    showInTagsTab: boolean
}

export const specialTags: Record<string, SpecialTag> = {
    starred: {
        color: '#ffda80',
        public: false,
        tooltip: <T keyName="mark_umark_starred">mark / unmark as starred (private, for yourself)</T>,
        present: {
            icon: 'star',
            color: '#ffb400',
        },
        absent: {
            icon: 'starOutlined',
            color: '#757575',
        },
        showInToolbar: true,
        showInTagsTab: false,
    },
    recommended: {
        color: '#a5d6a7',
        public: true,
        tooltip: <T keyName="mark_umark_recommended">mark / unmark as recommended (public, for everybody)</T>,
        present: {
            icon: 'recommended',
            color: '#4caf50',
        },
        absent: {
            icon: 'recommendedOutlined',
            color: '#757575',
        },
        showInToolbar: true,
        showInTagsTab: false,
    },
    seen: {
        color: '#bcaaa4',
        public: true,
        tooltip: <T keyName="mark_umark_seen">mark / unmark seen (public)</T>,
        present: {
            label: 'seen',
            icon: 'visibility',
            color: '#795548',
        },
        absent: {
            label: 'not seen',
            icon: 'visibilityOutlined',
            color: '#757575',
        },
        showInToolbar: true,
        showInTagsTab: false,
    },
    trash: {
        color: '#ef9a9a',
        public: true,
        tooltip: <T keyName="mark_umark_trash">mark / unmark trash (public)</T>,
        present: {
            label: 'trash',
            icon: 'delete',
            color: '#f44336',
        },
        absent: {
            label: 'not trash',
            icon: 'deleteOutlined',
            color: '#757575',
        },
        showInToolbar: true,
        showInTagsTab: false,
    },
}

export const specialTagsList = Object.entries(specialTags).map(([tag]) => tag)
export const publicTagsList = Object.entries(specialTags)
    .filter(([, tag]) => tag.public)
    .map(([tag]) => tag)
