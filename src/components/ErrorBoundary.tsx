import Typography from '@mui/material/Typography'
import { Component, ErrorInfo, ReactNode } from 'react'

interface ErrorBoundaryProps {
    visible: boolean
    children: ReactNode | ReactNode[]
}

interface ErrorBoundaryState {
    error: Error | undefined
    info?: ErrorInfo
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
    state: ErrorBoundaryState = { error: undefined }

    static defaultProps = {
        visible: true,
    }

    componentDidCatch(error: Error, info: ErrorInfo) {
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
