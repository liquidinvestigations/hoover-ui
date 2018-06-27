import EventEmitter from 'events';
import Router from 'next/router';

const events = new EventEmitter();
events.setMaxListeners(10);

Router.onRouteChangeStart = url => events.emit('changeStart', url);
Router.onRouteChangeComplete = url => events.emit('changeComplete', url);
Router.onRouteChangeError = (err, url) => events.emit('changeError', err, url);
Router.onBeforeHistoryChange = url => events.emit('beforeHistoryChange', url);

export default events;
