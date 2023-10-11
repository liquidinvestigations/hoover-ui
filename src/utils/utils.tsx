import url from 'url'

import { Tooltip } from '@mui/material'
import { T } from '@tolgee/react'
import copy from 'copy-text-to-clipboard'
import langs from 'langs'
import { DateTime, DurationObjectUnits } from 'luxon'
import { cloneElement, ReactElement } from 'react'

import { ELLIPSIS_TERM_LENGTH } from '../constants/general'
import { reactIcons } from '../constants/icons'
import { specialTags } from '../constants/specialTags'

import type { DocumentData, Hit } from '../Types'

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

export const formatDateTime = (dateTime: string, locale = 'en-US') => DateTime.fromISO(dateTime, { locale }).toLocaleString(DateTime.DATETIME_FULL)

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
    try {
        if (str.length < 100) {
            return str
        }

        const parts = str.split('/')

        return [...parts.slice(0, parts.length / 3), '…', ...parts.slice(-(parts.length / 3))].join('/')
    } catch (error) {
        console.error('An error occurred while truncating path:', error)
        return str
    }
}

export const shortenName = (name: string | undefined, length = ELLIPSIS_TERM_LENGTH) => {
    if (!name) return undefined
    if (name.length < length) return name

    try {
        const shortenedName = `${name.substr(0, (2 / 3) * length - 3)}...${name.substr((-1 / 3) * length)}`
        return (
            <Tooltip title={name}>
                <span>{shortenedName}</span>
            </Tooltip>
        )
    } catch (error) {
        console.error('An error occurred while shortening field name: ', error)
        return 'undefined'
    }
}

export const formatThousands = (number: number) => number.toLocaleString(localStorage.getItem('language') || 'en')

export const copyMetadata = (doc: DocumentData): ReactElement => {
    const { md5, path } = doc.content

    let string = md5
    if (path && Array.isArray(path) && path.length > 0) {
        string += `\n${path[0]}`
    }

    if (copy(string)) {
        return <T keyName="md5_copied">Copied MD5 and path to clipboard</T>
    } else {
        return <T keyName="md5_copy_error">Could not copy meta metadata - unsupported browser?</T>
    }
}

const documentUrlPrefix = '/doc'
export const collectionUrl = (collection: string) => [documentUrlPrefix, collection].join('/')
export const documentViewUrl = (item: Pick<Hit, '_collection' | '_id'>) => [documentUrlPrefix, item._collection, item._id].join('/')
export const getPreviewParams = (item: Pick<Hit, '_collection' | '_id'>) => ({ preview: { c: item._collection, i: item._id } })

export const humanFileSize = (bytes: number): ReactElement => {
    const thresh = 1000

    if (Math.abs(bytes) < thresh) {
        return (
            <T keyName="size_with_unit" params={{ size: bytes, unit: 'B' }}>
                {'{size} {unit, select, B {B} kB {kB} MB {MB} GB {GB} TB {TB} PB {PB} EB {EB} ZB {ZB} YB {YB} other {{unit}}}'}
            </T>
        )
    }

    const units = ['kB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']
    let u = -1
    const r = 10 ** 1

    do {
        bytes /= thresh
        ++u
    } while (Math.round(Math.abs(bytes) * r) / r >= thresh && u < units.length - 1)

    return (
        <T keyName="size_with_unit" params={{ size: bytes.toFixed(1), unit: units[u] }}>
            {'{size} {unit, select, B {B} kB {kB} MB {MB} GB {GB} TB {TB} PB {PB} EB {EB} ZB {ZB} YB {YB} other {{unit}}}'}
        </T>
    )
}

export const titleCase = (string: string) => {
    const sentence = string.includes('_') ? string.toLowerCase().split('_') : string.includes('-') ? string.toLowerCase().split('-') : [string]

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
                          { [roots.concat([prop]).join(sep)]: obj[prop] },
                ),
            {},
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
        (_, i) => i + start,
    )

export function formatETATime(milliseconds: number) {
    const seconds = milliseconds / 1000

    if (!seconds || seconds < 60) {
        return '<1m'
    } else if (seconds < 3600) {
        const minutes = Math.floor(seconds / 60)
        return `${minutes}m`
    } else {
        const hours = Math.floor(seconds / 3600)
        const remainingMinutes = Math.floor((seconds % 3600) / 60)
        return `${hours}h ${remainingMinutes}m `
    }
}
