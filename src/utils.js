import React from 'react'
import url from 'url'
import copy from 'copy-text-to-clipboard'
import langs from 'langs'
import { Tooltip } from '@material-ui/core'
import { ELLIPSIS_TERM_LENGTH } from './constants'
import file, { ReactComponent as FileIcon } from '../icons/file-line.svg'
import folder, { ReactComponent as FolderIcon } from '../icons/folder-line.svg'
import archive, { ReactComponent as ArchiveIcon } from '../icons/file-zip-line.svg'
import email, { ReactComponent as EmailIcon } from '../icons/mail-line.svg'
import pdf, { ReactComponent as PdfIcon } from '../icons/file-pdf-line.svg'
import doc, { ReactComponent as DocIcon } from '../icons/file-word-line.svg'
import xls, { ReactComponent as XlsIcon } from '../icons/file-excel-line.svg'
import { DateTime } from 'luxon'

export const getIconImageElement = fileType => {
    const srcMap = {
        folder,
        archive,
        email,
        pdf,
        doc,
        xls,
        'email-archive': archive,
        default: file
    }
    const img = document.createElement('img');
    img.src = (srcMap[fileType] || srcMap.default);
    return img
}

export const getIconReactComponent = fileType => {
    const iconMap = {
        folder: FolderIcon,
        archive: ArchiveIcon,
        email: EmailIcon,
        pdf: PdfIcon,
        doc: DocIcon,
        xls: XlsIcon,
        'email-archive': ArchiveIcon,
        default: FileIcon
    }
    return iconMap[fileType] || iconMap.default
}

export const getLanguageName = key => {
    const found = langs.where('1', key);
    return found ? found.name : key
}

export const formatDateTime = dateTime => DateTime
    .fromISO(dateTime, { locale: 'en-US' })
    .toLocaleString(DateTime.DATETIME_FULL)

export const getBasePath = docUrl => url.parse(url.resolve(docUrl, './')).pathname

export const makeUnsearchable = text => {
    let inMark = false;

    const chars = text.split('');

    return chars
        .map((c, i) => {
            if (c === '<') {
                const slice = text.slice(i);
                inMark =
                    slice.indexOf('<mark>') === 0 || slice.indexOf('</mark>') === 0;
            }

            if (c === '>') {
                const prefix = text.slice(i - 5, i);
                inMark = !(
                    prefix.indexOf('<mark') === 0 || prefix.indexOf('</mark')
                );
            }

            if (inMark || c === ' ' || c === '\n') {
                return c;
            } else {
                return `${c}<span class="no-find">S</span>`;
            }
        })
        .join('')
}

export const truncatePath = str => {
    if (str.length < 100) {
        return str;
    }
    const parts = str.split('/');

    return [
        ...parts.slice(0, parts.length / 3),
        '…',
        ...parts.slice(-(parts.length / 3)),
    ].join('/')
}

export const shortenName = (name, length = ELLIPSIS_TERM_LENGTH) => name && name.length > length ?
    <Tooltip title={name}>
        <span>{`${name.substr(0, 2/3*length-3)}...${name.substr(-1/3*length)}`}</span>
    </Tooltip> : name

export const formatThousands = n =>
    String(n).replace(/(?<!\..*)(\d)(?=(?:\d{3})+(?:\.|$))/g, '$1,')

export const copyMetadata = doc => {
    const string = [doc.content.md5, doc.content.path].join('\n');

    return copy(string)
        ? `Copied MD5 and path to clipboard`
        : `Could not copy meta metadata – unsupported browser?`
};

const documentUrlPrefix = '/doc'
export const collectionUrl = collection => [documentUrlPrefix, collection].join('/')
export const documentViewUrl = item => [documentUrlPrefix, item._collection, item._id].join('/')
export const getPreviewParams = item => ({ preview: { c: item._collection, i: item._id } })

export const removeCommentsAndSpacing = (str = '') =>
    str.replace(/\/\*.*\*\//g, ' ').replace(/\s+/g, ' ')

export const humanFileSize = (bytes, si= true, dp= 1) => {
    const thresh = si ? 1000 : 1024

    if (Math.abs(bytes) < thresh) {
        return bytes + ' B'
    }

    const units = si
        ? ['kB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']
        : ['KiB', 'MiB', 'GiB', 'TiB', 'PiB', 'EiB', 'ZiB', 'YiB']
    let u = -1
    const r = 10**dp

    do {
        bytes /= thresh
        ++u
    } while (Math.round(Math.abs(bytes) * r) / r >= thresh && u < units.length - 1)


    return bytes.toFixed(dp) + ' ' + units[u]
}
