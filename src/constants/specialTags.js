export const specialTags = [{
    tag: 'starred',
    color: '#ffda80',
    public: false,
    tooltip: 'mark / unmark as starred (private, for yourself)',
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
},{
    tag: 'recommended',
    color: '#a5d6a7',
    public: true,
    tooltip: 'mark / unmark as recommended (public, for everybody)',
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
},{
    tag: 'seen',
    color: '#bcaaa4',
    public: true,
    tooltip: 'mark / unmark seen (public)',
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
},{
    tag: 'trash',
    color: '#ef9a9a',
    public: true,
    tooltip: 'mark / unmark trash (public)',
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
}]

export const specialTagsList = specialTags.map(tag => tag.tag)
export const publicTagsList = specialTags.filter(tag => tag.public).map(tag => tag.tag)
