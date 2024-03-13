export const mockHits = [
    {
        _id: 'b40ee8c9026260ffc5cbed7e686d6346eb1f2ff1e1b9424e50415d2eeb44b62e',
        _type: 'doc',
        _index: 'uploads',
        _score: 1,
        _source: {
            ocr: false,
            path: ['/3-short.pdf//page-027-026.png', '/3-short.pdf//page-027-038.png', '/3x2.pdf//page-004-154.png', '/3x2.pdf//page-004-166.png'],
            size: 310,
            skipped: false,
            filename: [
                'page-004-154.png',
                'page-004-166.png',
                'page-027-026.png',
                'page-027-038.png',
                'page-027-238.png',
                'page-027-138.png',
                'page-027-338.png',
                'page-027-438.png',
                'page-027-538.png',
            ],
            filetype: 'image',
            'word-count': 0,
            attachments: null,
            'content-type': 'image/png',
            'has-thumbnails': true,
            'has-pdf-preview': false,
        },
        _url_rel: 'doc/uploads/b40ee8c9026260ffc5cbed7e686d6346eb1f2ff1e1b9424e50415d2eeb44b62e',
        _collection: 'uploads',
        _dedup_hits: null,
        _dedup_hide_result: null,
    },
    {
        _id: '16140a3bd37587a4a5671b8911dc1bb4c03a8dc5473108f4cf1ae86b713d3cef',
        _type: 'doc',
        _index: 'testdata-enron',
        _score: 1,
        _source: {
            to: [
                'tmachej@arcfinancial.com, sheila_kelly@cdnoxy.com, s.goritz@home.com,',
                'rulrich@shl.com, stewart4c@hotmail.com, smedia@telusplanet.net,',
                'rpm@merchant.ca, gaulp@cadvision.com, bergmann@telusplanet.net,',
                'patricia_szmolyan@scotia-mcleod.com, mfazil@globalsec.com,',
                'milan_cacic@ca.ml.com, micheline@cadvision.com,',
                'sainasm@cadvision.com, michael_leahy@scotia-mcleod.com,',
                'maggie_timmins@cdnoxy.com, lcurry@kineticres.com,',
                'lcurrie@arcfinancial.com, kbrown@arcfinancial.com,',
                'kelly_trout@scotia-mcleod.com, john.lavorato@enron.com,',
                'jimmurphy@remax-professional.com, jmuraro@tornado.ab.ca,',
                'grandanj@home.com, jgm@abfg.com, gary.goetsch@shaw.ca,',
                'gabriel_ollivier@canada.com, dfreel@arcfinancial.com,',
                'dbonner@arcfinancial.com, macor@cibc.ca, dlward@telusplanet.net,',
                'saxbyd@tcel.com, dave@rpcl.com, davisc@bennettjones.ca,',
                'bishop06@cn.ca, brianp.jennings@cadvision.com,',
                'bboulang@arcfinancial.com, birdz@telusplanet.net,',
                'vibergd@cadvision.com, william_tribe@ca.ml.com,',
                'bill_ketcheson@pcp.ca, bpoff@home.com, barbrichardson@metronet.ca,',
                'abradford@petersco.com, alkeo@hotmail.com, afowler@arcfinancial.com,',
                'nlever@arcfinancial.com, mstadnyk@arcfinancial.com,',
                'shealy@arcfinancial.com',
            ],
            date: '2000-01-26T22:45:00Z',
            from: ['lizstock@customized.ab.ca'],
            path: [
                '/enron_mail_20150507.tar.gz//enron_mail_20150507.tar//maildir/lavorato-j/all_documents/27.',
                '/maildir/lavorato-j/all_documents/27.',
            ],
            size: 3943,
            skipped: false,
            filename: ['27.'],
            filetype: 'email',
            'word-count': 285,
            attachments: null,
            'content-type': 'message/rfc822',
            'date-created': '2000-01-26T22:45:00Z',
            'email-domains': [
                'remax-professional.com',
                'canada.com',
                'shl.com',
                'cadvision.com',
                'customized.ab.ca',
                'home.com',
                'tcel.com',
                'scotia-mcleod.com',
                'arcfinancial.com',
                'cn.ca',
                'pcp.ca',
                'ca.ml.com',
                'petersco.com',
                'cdnoxy.com',
                'merchant.ca',
            ],
            'has-thumbnails': false,
            'has-pdf-preview': false,
        },
        _url_rel: 'doc/testdata-enron/16140a3bd37587a4a5671b8911dc1bb4c03a8dc5473108f4cf1ae86b713d3cef',
        _collection: 'testdata-enron',
        _dedup_hits: null,
        _dedup_hide_result: null,
    },
]

export const resultsColumnMocks = [
    [
        [
            'filetype',
            {
                label: {
                    key: null,
                    ref: null,
                    props: {
                        keyName: 'filetype',
                        children: 'File type',
                    },
                    _owner: null,
                    _store: {
                        validated: true,
                    },
                    _source: {
                        fileName: '/Users/lnt-soft/Liquid/hoover-ui/src/constants/availableColumns.tsx',
                        lineNumber: 17,
                        columnNumber: 16,
                    },
                },
                align: 'center',
                sortable: true,
                hidden: false,
                format: 'icon',
                path: '_source.filetype',
            },
        ],
        [
            'preview',
            {
                label: {
                    key: null,
                    ref: null,
                    props: {
                        keyName: 'preview',
                        children: 'Preview',
                    },
                    _owner: null,
                    _store: {
                        validated: true,
                    },
                    _source: {
                        fileName: '/Users/lnt-soft/Liquid/hoover-ui/src/constants/availableColumns.tsx',
                        lineNumber: 25,
                        columnNumber: 16,
                    },
                },
                align: 'center',
                sortable: false,
                hidden: false,
                format: 'thumbnail',
                path: '_source.has-thumbnails',
            },
        ],
        [
            'filename',
            {
                label: {
                    key: null,
                    ref: null,
                    props: {
                        keyName: 'filename',
                        children: 'File name',
                    },
                    _owner: null,
                    _store: {
                        validated: true,
                    },
                    _source: {
                        fileName: '/Users/lnt-soft/Liquid/hoover-ui/src/constants/availableColumns.tsx',
                        lineNumber: 33,
                        columnNumber: 16,
                    },
                },
                align: 'left',
                sortable: false,
                hidden: false,
                format: 'array',
                path: '_source.filename',
            },
        ],
        [
            'collection',
            {
                label: {
                    key: null,
                    ref: null,
                    props: {
                        keyName: 'collection',
                        children: 'Collection',
                    },
                    _owner: null,
                    _store: {
                        validated: true,
                    },
                    _source: {
                        fileName: '/Users/lnt-soft/Liquid/hoover-ui/src/constants/availableColumns.tsx',
                        lineNumber: 41,
                        columnNumber: 16,
                    },
                },
                align: 'left',
                sortable: false,
                hidden: false,
                format: 'string',
                path: '_collection',
            },
        ],
        [
            'word-count',
            {
                label: {
                    key: null,
                    ref: null,
                    props: {
                        keyName: 'word-count',
                        children: 'Word count',
                    },
                    _owner: null,
                    _store: {
                        validated: true,
                    },
                    _source: {
                        fileName: '/Users/lnt-soft/Liquid/hoover-ui/src/constants/availableColumns.tsx',
                        lineNumber: 73,
                        columnNumber: 16,
                    },
                },
                align: 'right',
                sortable: true,
                hidden: false,
                format: 'number',
                path: '_source.word-count',
            },
        ],
        [
            'size',
            {
                label: {
                    key: null,
                    ref: null,
                    props: {
                        keyName: 'size',
                        children: 'Size',
                    },
                    _owner: null,
                    _store: {
                        validated: true,
                    },
                    _source: {
                        fileName: '/Users/lnt-soft/Liquid/hoover-ui/src/constants/availableColumns.tsx',
                        lineNumber: 81,
                        columnNumber: 16,
                    },
                },
                align: 'right',
                sortable: true,
                hidden: false,
                format: 'size',
                path: '_source.size',
            },
        ],
    ],
    [
        [
            'filetype',
            {
                label: {
                    key: null,
                    ref: null,
                    props: {
                        keyName: 'filetype',
                        children: 'File type',
                    },
                    _owner: null,
                    _store: {
                        validated: true,
                    },
                    _source: {
                        fileName: '/Users/lnt-soft/Liquid/hoover-ui/src/constants/availableColumns.tsx',
                        lineNumber: 17,
                        columnNumber: 16,
                    },
                },
                align: 'center',
                sortable: true,
                hidden: false,
                format: 'icon',
                path: '_source.filetype',
            },
        ],
        [
            'preview',
            {
                label: {
                    key: null,
                    ref: null,
                    props: {
                        keyName: 'preview',
                        children: 'Preview',
                    },
                    _owner: null,
                    _store: {
                        validated: true,
                    },
                    _source: {
                        fileName: '/Users/lnt-soft/Liquid/hoover-ui/src/constants/availableColumns.tsx',
                        lineNumber: 25,
                        columnNumber: 16,
                    },
                },
                align: 'center',
                sortable: false,
                hidden: false,
                format: 'thumbnail',
                path: '_source.has-thumbnails',
            },
        ],
        [
            'filename',
            {
                label: {
                    key: null,
                    ref: null,
                    props: {
                        keyName: 'filename',
                        children: 'File name',
                    },
                    _owner: null,
                    _store: {
                        validated: true,
                    },
                    _source: {
                        fileName: '/Users/lnt-soft/Liquid/hoover-ui/src/constants/availableColumns.tsx',
                        lineNumber: 33,
                        columnNumber: 16,
                    },
                },
                align: 'left',
                sortable: false,
                hidden: false,
                format: 'array',
                path: '_source.filename',
            },
        ],
        [
            'collection',
            {
                label: {
                    key: null,
                    ref: null,
                    props: {
                        keyName: 'collection',
                        children: 'Collection',
                    },
                    _owner: null,
                    _store: {
                        validated: true,
                    },
                    _source: {
                        fileName: '/Users/lnt-soft/Liquid/hoover-ui/src/constants/availableColumns.tsx',
                        lineNumber: 41,
                        columnNumber: 16,
                    },
                },
                align: 'left',
                sortable: false,
                hidden: false,
                format: 'string',
                path: '_collection',
            },
        ],
        [
            'word-count',
            {
                label: {
                    key: null,
                    ref: null,
                    props: {
                        keyName: 'word-count',
                        children: 'Word count',
                    },
                    _owner: null,
                    _store: {
                        validated: true,
                    },
                    _source: {
                        fileName: '/Users/lnt-soft/Liquid/hoover-ui/src/constants/availableColumns.tsx',
                        lineNumber: 73,
                        columnNumber: 16,
                    },
                },
                align: 'right',
                sortable: true,
                hidden: false,
                format: 'number',
                path: '_source.word-count',
            },
        ],
        [
            'size',
            {
                label: {
                    key: null,
                    ref: null,
                    props: {
                        keyName: 'size',
                        children: 'Size',
                    },
                    _owner: null,
                    _store: {
                        validated: true,
                    },
                    _source: {
                        fileName: '/Users/lnt-soft/Liquid/hoover-ui/src/constants/availableColumns.tsx',
                        lineNumber: 81,
                        columnNumber: 16,
                    },
                },
                align: 'right',
                sortable: true,
                hidden: false,
                format: 'size',
                path: '_source.size',
            },
        ],
    ],
]
