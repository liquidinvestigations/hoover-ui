import { T } from '@tolgee/react'

import { RequestError } from '../../../Types'
import ErrorPage from '../../ErrorPage'

export const DocPageError = ({ error }: { error: RequestError }) => (
    <ErrorPage
        statusCode={error.status}
        title={error.statusText}
        message={
            (
                <>
                    <T keyName="request_to_url_error" params={{ url: error.url, status: error.status, statusText: error.statusText }}>
                        {'Request to {url} returned HTTP {status} {statusText}'}
                    </T>
                </>
            ) as unknown as string
        }
    />
)
