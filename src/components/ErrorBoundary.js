import Typography from '@mui/material/Typography'
import { Component } from 'react'

import { logError } from '../backend/api'

export default class ErrorBoundary extends Component {
    state = { error: null }

    static defaultProps = {
        visible: true,
    }

    componentDidCatch(error, info) {
        console.error(error, info)
        this.setState({ error, info })
        logError({ error: error.message, info, url: window.location.href })
    }

    render() {
        const { error } = this.state
        const { visible, children } = this.props

        if (error) {
            if (visible) {
                return <Typography color="error">{error.message}</Typography>
            } else {
                return null
            }
        }

        return children
    }
}
