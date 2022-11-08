export default function getAuthorizationHeaders(req: { headers: Record<string, string> }): Record<string, string> {
    return {
        cookie: req.headers.cookie,
        ...Object.fromEntries(
            Object.keys(req.headers)
                .filter((key) => key.startsWith('x-forwarded'))
                .map((key) => [key, req.headers[key]])
        ),
    }
}
