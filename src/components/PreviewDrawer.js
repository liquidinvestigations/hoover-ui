import { connect } from 'react-redux';

import Drawer from '@material-ui/core/Drawer';
import IconButton from '@material-ui/core/IconButton';
import Divider from '@material-ui/core/Divider';
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft';

import Document from './Document';

const mapStateToProps = ({ doc }) => ({ doc });

export default connect(mapStateToProps)(({ classes, doc }) => (
    <Drawer
        classes={{
            paper: classes.rightDrawerPaper,
            docked: classes.rightDrawer,
        }}
        variant="permanent"
        anchor="right">
        <div className={classes.toolbar} />
        <div className={classes.rightContent}>{doc.url && <Document />}</div>
    </Drawer>
));
