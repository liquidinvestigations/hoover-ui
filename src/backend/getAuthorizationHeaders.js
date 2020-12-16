export default function getAuthorizationHeaders(req) {
    return {
        cookie: req.headers.cookie,
        ...Object.fromEntries(
            Object.keys(req.headers)
                .filter(key => key.startsWith('x-forwarded'))
                .map(key => [key, req.headers[key]])
        )
    }
}
