import { PureComponent } from 'react';
import PropTypes from 'prop-types';
import Snackbar from '@material-ui/core/Snackbar';
import { HotKeys } from 'react-hotkeys';
import { withStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';

import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';

import Modal from '@material-ui/core/Modal';

import { isInputFocused } from '../utils';

const styles = theme => ({
    keyHelp: {
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        backgroundColor: theme.palette.background.paper,
        boxShadow: theme.shadows[5],
        padding: theme.spacing.unit * 4,
    },
});

const KeyHelp = withStyles(styles)(({ open, onClose, classes, keys }) => (
    <Modal open={open} onClose={onClose}>
        <div className={classes.keyHelp}>
            <Typography variant="h6">Keyboard shortcuts</Typography>

            <List dense>
                {keys.map(({ key, help }) => (
                    <ListItem key={key}>
                        <span className="mono">
                            {Array.isArray(key) ? key.join(' or ') : key}
                        </span>
                        <ListItemText primary={help} />
                    </ListItem>
                ))}
            </List>
        </div>
    </Modal>
));

export default class extends PureComponent {
    static propTypes = {
        keys: PropTypes.arrayOf(
            PropTypes.shape({
                name: PropTypes.string.isRequired,
                key: PropTypes.string.isRequired,
                help: PropTypes.string.isRequired,
                handler: PropTypes.func.isRequired,
            }).isRequired
        ).isRequired,
        focused: PropTypes.bool,
    };

    state = {
        keyHelpOpen: false,
        snackbarMessage: null,
    };

    static defaultProps = {
        keys: [],
        focused: false,
    };

    showKeyHelp = e => {
        if (!isInputFocused()) {
            e.preventDefault();
            this.setState({ keyHelpOpen: true });
        }
    };

    hideKeyHelp = () => this.setState({ keyHelpOpen: false });
    openHelp = () => this.setState({ keyHelpOpen: true });
    handleSnackbarClose = () => this.setState({ snackbarMessage: null });
    setSnackbarMessage = snackbarMessage => this.setState({ snackbarMessage });

    render() {
        const { keys, children, focused } = this.props;
        const { snackbarMessage, keyHelpOpen } = this.state;

        const keysWithHelp = [
            ...keys,
            {
                name: 'openHelp',
                key: '?',
                handler: this.openHelp,
                help: 'Open this help',
            },
        ];

        const keyMap = {};

        const handlers = {};

        keysWithHelp.forEach(({ name, key, handler }) => {
            keyMap[name] = key;
            handlers[name] = event => handler(event, this.setSnackbarMessage);
        });

        return (
            <div>
                <HotKeys keyMap={keyMap} handlers={handlers} focused={focused.toString()}>
                    {children}
                </HotKeys>

                <KeyHelp
                    open={keyHelpOpen}
                    onClose={this.hideKeyHelp}
                    keys={keysWithHelp}
                />

                <Snackbar
                    anchorOrigin={{
                        vertical: 'bottom',
                        horizontal: 'left',
                    }}
                    open={Boolean(snackbarMessage)}
                    autoHideDuration={6000}
                    onClose={this.handleSnackbarClose}
                    ContentProps={{
                        'aria-describedby': 'snackbar-message',
                    }}
                    message={<span id="snackbar-message-id">{snackbarMessage}</span>}
                />
            </div>
        );
    }
}
