import React from 'react'
import Head from 'next/head'
import { makeStyles } from '@material-ui/core/styles'

const statusCodes = {
    400: 'Bad Request',
    404: 'This page could not be found',
    405: 'Method Not Allowed',
    500: 'Internal Server Error',
}

const useStyles = makeStyles(theme => ({
    error: {
        color: '#000',
        background: '#fff',
        fontFamily:
            '-apple-system, BlinkMacSystemFont, Roboto, "Segoe UI", "Fira Sans", Avenir, "Helvetica Neue", "Lucida Grande", sans-serif',
        height: 'calc(100vh - 56px)',
        textAlign: 'center',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',

        '@media (min-width: 0px) and (orientation: landscape)': {
            height: 'calc(100vh - 48px)',
        },

        '@media (min-width: 600px)': {
            height: 'calc(100vh - 64px)',
        }
    },

    desc: {
        display: 'inline-block',
        textAlign: 'left',
        lineHeight: '49px',
        height: '49px',
        verticalAlign: 'middle',
    },

    h1: {
        display: 'inline-block',
        borderRight: '1px solid rgba(0, 0, 0,.3)',
        margin: 0,
        marginRight: '20px',
        padding: '10px 23px 10px 0',
        fontSize: '24px',
        fontWeight: 500,
        verticalAlign: 'top',
    },

    h2: {
        fontSize: '14px',
        fontWeight: 'normal',
        lineHeight: 'inherit',
        margin: 0,
        padding: 0,
    },
}))

function Error({ statusCode, title, message }) {
    const classes = useStyles()

    const headTitle =
        title ||
        statusCodes[statusCode] ||
        'An unexpected error has occurred'

    const description =
        message ||
        statusCodes[statusCode] ||
        'An unexpected error has occurred'

    return (
        <div className={classes.error}>
            <Head>
                <title>
                    {statusCode}: {headTitle}
                </title>
            </Head>
            <div>
                <style dangerouslySetInnerHTML={{ __html: 'body { margin: 0 }' }} />
                {statusCode ? <h1 className={classes.h1}>{statusCode}</h1> : null}
                <div className={classes.desc}>
                    <h2 className={classes.h2}>{description}.</h2>
                </div>
            </div>
        </div>
    )
}

Error.getInitialProps = ({ res, err }) => {
    const statusCode = res ? res.statusCode : err ? err.statusCode : 404
    return { statusCode }
}

export default Error
