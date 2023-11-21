import { T } from '@tolgee/react'

import Error from '../../../../pages/_error'
import { RequestError } from '../../../Types'

export const DocPageError = ({ error }: { error: RequestError }) => (
    <Error
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
