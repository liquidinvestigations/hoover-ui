import { Component } from 'react';
import CircularProgress from '@material-ui/core/CircularProgress';

export default class Loading extends Component {
    render() {
        return (
            <div style={{ padding: '1rem', textAlign: 'center' }}>
                <CircularProgress />
            </div>
        );
    }
}
