import { Component } from 'react';
import BatchPage from '../src/components/BatchPage';

export default class BatchSearch extends Component {
    state = {};

    componentDidCatch(error) {
        this.setState({ error });
    }

    render() {
        if (this.state.error) return <p>{this.state.error.toString()}</p>;
        return <BatchPage />;
    }
}
