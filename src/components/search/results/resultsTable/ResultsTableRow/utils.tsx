import { Hit } from '../../../../../Types'

export const createNestedHitPathMap = (hit: Hit): Record<string, string | number | boolean | string[] | undefined> => ({
    _collection: hit._collection,
    '_source.filetype': hit._source.filetype,
    '_source.has-thumbnails': hit._source['has-thumbnails'],
    '_source.filename': hit._source.filename,
    '_source.path': hit._source.path,
    '_source.tags': hit._source.tags,
    '_source.private-tags': hit._source['private-tags'],
    '_source.word-count': hit._source['word-count'],
    '_source.size': hit._source.size,
    '_source.content-type': hit._source['content-type'],
    '_source.date': hit._source.date,
    '_source.date-created': hit._source['date-created'],
    '_source.email-domains': hit._source['email-domains'],
    '_source.from': hit._source.from,
    '_source.to': hit._source.to,
    '_source.ocr': hit._source.ocr,
    '_source.pgp': hit._source.pgp,
})
