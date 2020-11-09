import React, { Component } from 'react'
import Typography from '@material-ui/core/Typography'

export default class ErrorBoundary extends Component {
    state = { error: null }

    static defaultProps = {
        visible: true,
    }

    componentDidCatch(error, info) {
        console.error(error, info)
        this.setState({ error, info })
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
