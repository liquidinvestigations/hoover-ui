import { NextPage } from 'next'
import Head from 'next/head'

import { useStyles } from '../styles/error'

const statusCodes = {
    400: 'Bad Request',
    404: 'This page could not be found',
    405: 'Method Not Allowed',
    429: 'Too many Requests',
    500: 'Internal Server Error',
}

type ErrorProps = {
    statusCode: number
    title?: string
    message?: string
}

const Error: NextPage<ErrorProps> = ({ statusCode, title, message }) => {
    const { classes } = useStyles()

    const headTitle = title || statusCodes[statusCode as keyof typeof statusCodes] || 'An unexpected error has occurred'

    const description = message || statusCodes[statusCode as keyof typeof statusCodes] || 'An unexpected error has occurred'

    return (
        <div className={classes.error}>
            <Head>
                <title>{`${statusCode}: ${headTitle}`}</title>
            </Head>
            <div>
                {statusCode ? <h1 className={classes.h1}>{statusCode}</h1> : null}
                <div className={classes.desc}>
                    <h2>{description}.</h2>
                </div>
            </div>
        </div>
    )
}

Error.getInitialProps = ({ res, err }) => {
    const statusCode = res ? res.statusCode : err && err.statusCode ? err.statusCode : 404
    return { statusCode } as ErrorProps
}

export default Error
