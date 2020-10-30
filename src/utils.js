import React from 'react';
import url from 'url';
import copy from 'copy-text-to-clipboard';
import langs from 'langs';

export function getIconImageElement(fileType) {
    const srcMap = {
        folder: '/icons/folder-line.svg',
        archive: '/icons/file-zip-line.svg',
        email: '/icons/mail-line.svg',
        pdf: '/icons/file-pdf-line.svg',
        doc: '/icons/file-word-line.svg',
        xls: '/icons/file-excel-line.svg',
        'email-archive': '/icons/file-zip-line.svg',
        ppt: '/icons/slideshow-line.svg',
        default: '/icons/file-line.svg'
    }
    const img = document.createElement('img');
    img.src = (srcMap[fileType] || srcMap.default);
    return img;
}

export function getLanguageName(key) {
    const found = langs.where('1', key);
    return found ? found.name : key;
}

export function getBasePath(docUrl) {
    return url.parse(url.resolve(docUrl, './')).pathname;
}

export function makeUnsearchable(text) {
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
        .join('');
}

export function truncatePath(str) {
    if (str.length < 100) {
        return str;
    }
    const parts = str.split('/');

    return [
        ...parts.slice(0, parts.length / 3),
        '…',
        ...parts.slice(-(parts.length / 3)),
    ].join('/');
}

export const formatThousands = n => n.toLocaleString('en');

export function parseLocation() {
    return url.parse(window.location.href, true);
}

export const isInputFocused = () => {
    const tagName = document.activeElement.tagName.toUpperCase();

    return tagName === 'INPUT' || document.activeElement.contentEditable === 'true';
};

export const copyMetadata = doc => {
    const string = [doc.content.md5, doc.content.path].join('\n');

    return copy(string)
        ? `Copied MD5 and path to clipboard`
        : `Could not copy meta metadata – unsupported browser?`;
};

export const documentViewUrl = item => `/doc/${item._collection}/${item._id}`;

export const removeCommentsAndSpacing = (str = '') =>
    str.replace(/\/\*.*\*\//g, ' ').replace(/\s+/g, ' ');
