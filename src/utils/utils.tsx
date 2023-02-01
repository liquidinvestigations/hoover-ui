import { cloneElement } from 'react'
import url from 'url'
import copy from 'copy-text-to-clipboard'
import langs from 'langs'
import { Tooltip } from '@mui/material'
import { ELLIPSIS_TERM_LENGTH } from '../constants/general'
import { DateTime, DurationLikeObject, DurationObjectUnits, DurationUnit } from 'luxon'
import { reactIcons } from '../constants/icons'
import { specialTags } from '../constants/specialTags'
import { Hit } from '../Types'
import { DocumentData } from '../stores/DocumentStore'

const typeIconsMap: Record<string, string> = {
    archive: 'typeArchive',
    audio: 'typeAudio',
    default: 'typeFile',
    doc: 'typeDoc',
    email: 'typeEmail',
    'email-archive': 'typeEmailArchive',
    folder: 'typeFolder',
    html: 'typeHtml',
    image: 'typeImage',
    pdf: 'typePdf',
    text: 'typeText',
    video: 'typeVideo',
    xls: 'typeXls',
}

export const getTypeIcon = (fileType: string) => reactIcons[typeIconsMap[fileType] || typeIconsMap.default]

export const getTagIcon = (tag: string, isPublic = false, absent = false) => {
    if (specialTags[tag]) {
        const state = absent ? 'absent' : 'present'
        if ((isPublic && specialTags[tag].public) || (!isPublic && !specialTags[tag].public)) {
            return cloneElement(reactIcons[specialTags[tag][state].icon], {
                style: {
                    color: specialTags[tag][state].color,
                },
            })
        }
    }
    return null
}

export const getLanguageName = (key: string) => {
    const found = langs.where('1', key)
    return found ? found.name : key
}

export const formatDateTime = (dateTime: string) => DateTime.fromISO(dateTime, { locale: 'en-US' }).toLocaleString(DateTime.DATETIME_FULL)

export const daysInMonth = (date: string) => {
    const [, year, month] = /(\d{4})-(\d{2})/.exec(date) as string[]
    return new Date(parseInt(year), parseInt(month), 0).getDate()
}

const intervalsList = ['year', 'month', 'week', 'day', 'hour']
export const getClosestInterval = (range: any) => {
    const from = range.from + 'T00:00:00'
    const to = range.to + 'T23:59:59'

    let selectedInterval = range.interval

    intervalsList.some((interval) => {
        const intervalPlural = `${interval}s` as keyof DurationObjectUnits
        const duration = DateTime.fromISO(to).diff(DateTime.fromISO(from), intervalPlural).toObject()

        if (duration[intervalPlural] || 0 > 1) {
            if (intervalsList.indexOf(interval) > intervalsList.indexOf(selectedInterval)) {
                selectedInterval = interval
            }
            return true
        }
    })

    return selectedInterval
}

export const getBasePath = (docUrl: string) => url.parse(url.resolve(docUrl, './')).pathname

export const makeUnsearchable = (text: string) => {
    let inMark = false

    const chars = text.split('')

    return chars
        .map((c, i) => {
            if (c === '<') {
                const slice = text.slice(i)
                inMark = slice.indexOf('<mark>') === 0 || slice.indexOf('</mark>') === 0
            }

            if (c === '>') {
                const prefix = text.slice(i - 5, i)
                inMark = !(prefix.indexOf('<mark') === 0 || prefix.indexOf('</mark'))
            }

            if (inMark || c === ' ' || c === '\n') {
                return c
            } else {
                return `${c}<span class="no-find">S</span>`
            }
        })
        .join('')
}

export const truncatePath = (str: string) => {
    if (str.length < 100) {
        return str
    }
    const parts = str.split('/')

    return [...parts.slice(0, parts.length / 3), '…', ...parts.slice(-(parts.length / 3))].join('/')
}

export const shortenName = (name: string, length = ELLIPSIS_TERM_LENGTH) =>
    name && name.length > length ? (
        <Tooltip title={name}>
            <span>{`${name.substr(0, (2 / 3) * length - 3)}...${name.substr((-1 / 3) * length)}`}</span>
        </Tooltip>
    ) : (
        name
    )

export const formatThousands = (number: number) => {
    let decimalPart = ''
    let n: string | number = number.toString()
    if (n.indexOf('.') !== -1) {
        decimalPart = '.' + n.split('.')[1]
        n = parseInt(n.split('.')[0])
    }

    const array = n.toString().split('')
    let index = -3
    while (array.length + index > 0) {
        array.splice(index, 0, ',')
        // Decrement by 4 since we just added another unit to the array.
        index -= 4
    }

    return array?.join('') + decimalPart
}

export const copyMetadata = (doc: DocumentData) => {
    const string = [doc.content.md5, doc.content.path].join('\n')

    return copy(string) ? `Copied MD5 and path to clipboard` : `Could not copy meta metadata – unsupported browser?`
}

const documentUrlPrefix = '/doc'
export const collectionUrl = (collection: string) => [documentUrlPrefix, collection].join('/')
export const documentViewUrl = (item: Pick<Hit, '_collection' | '_id'>) => [documentUrlPrefix, item._collection, item._id].join('/')
export const getPreviewParams = (item: Pick<Hit, '_collection' | '_id'>) => ({ preview: { c: item._collection, i: item._id } })

export const removeCommentsAndSpacing = (str = '') => str.replace(/\/\*.*\*\//g, ' ').replace(/\s+/g, ' ')

export const humanFileSize = (bytes: number, si = true, dp = 1) => {
    const thresh = si ? 1000 : 1024

    if (Math.abs(bytes) < thresh) {
        return bytes + ' B'
    }

    const units = si ? ['kB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'] : ['KiB', 'MiB', 'GiB', 'TiB', 'PiB', 'EiB', 'ZiB', 'YiB']
    let u = -1
    const r = 10 ** dp

    do {
        bytes /= thresh
        ++u
    } while (Math.round(Math.abs(bytes) * r) / r >= thresh && u < units.length - 1)

    return bytes.toFixed(dp) + ' ' + units[u]
}

export const titleCase = (string: string) => {
    let sentence = string.includes('_') ? string.toLowerCase().split('_') : string.includes('-') ? string.toLowerCase().split('-') : [string]

    return sentence.map((word) => word[0].toUpperCase() + word.slice(1)).join(' ')
}

export const formatTitleCase = (name: string) => {
    const [group, func] = name.split('.')
    return (
        <>
            <strong>{titleCase(group)}</strong>: {titleCase(func)}
        </>
    )
}

// $roots keeps previous parent properties as they will be added as a prefix for each prop.
// $sep is just a preference if you want to seperate nested paths other than dot.
export const flatten = (obj: Record<string, any>, roots: Record<string, any> = [], sep = '.'): Record<string, any> =>
    Object
        // find props of given object
        .keys(obj)
        // return an object by iterating props
        .reduce(
            (memo, prop) =>
                Object.assign(
                    // create a new object
                    {},
                    // include previously returned object
                    memo,
                    Object.prototype.toString.call(obj[prop]) === '[object Object]'
                        ? // keep working if value is an object
                          flatten(obj[prop], roots.concat([prop]))
                        : // include current prop and value and prefix prop with the roots
                          { [roots.concat([prop]).join(sep)]: obj[prop] }
                ),
            {}
        )

export const getFileName = (url: string) => {
    const str = url.split('/').pop()
    return str ? str.split('#')[0].split('?')[0] : url
}

export const downloadFile = (url: string, data: string | BlobPart) => {
    const blobUrl = typeof data === 'string' ? '' : URL.createObjectURL(new Blob([data], { type: '' }))
    const link = document.createElement('a')
    link.style.display = 'none'
    link.href = blobUrl || url
    link.setAttribute('download', getFileName(url))

    document.body.appendChild(link)
    link.click()

    document.body.removeChild(link)
    if (blobUrl) {
        URL.revokeObjectURL(blobUrl)
    }
}

export const numberArray = (start: number, count: number) =>
    Array.from(
        {
            length: count,
        },
        (_, i) => i + start
    )
