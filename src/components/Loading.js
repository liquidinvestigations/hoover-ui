import CircularProgress from '@material-ui/core/CircularProgress';

export default class Loading extends React.Component {
    render() {
        return (
            <div style={{ padding: '1rem', textAlign: 'center' }}>
                <CircularProgress />
            </div>
        );
    }
}
