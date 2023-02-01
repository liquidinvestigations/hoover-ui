import { IncomingMessage, OutgoingHttpHeaders } from 'http'

export default function getAuthorizationHeaders(req: IncomingMessage): OutgoingHttpHeaders {
    return {
        cookie: req.headers.cookie || '',
        ...Object.fromEntries(
            Object.keys(req.headers)
                .filter((key) => key.startsWith('x-forwarded'))
                .map((key) => [key, req.headers[key]])
        ),
    }
}
