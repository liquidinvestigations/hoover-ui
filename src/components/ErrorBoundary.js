import { Component } from 'react';

export default class ErrorBoundary extends Component {
    state = { error: null };

    componentDidCatch(error, info) {
        console.log(error, info);
        this.setState({ error, info });
    }

    render() {
        if (this.state.error) {
            if (this.props.visible) {
                return <p style={{ margin: '3rem' }}>{this.state.error.message}</p>;
            } else {
                return null;
            }
        }

        return this.props.children;
    }
}
