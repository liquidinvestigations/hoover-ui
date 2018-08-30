import Header from './Header';
import ProgressIndicator from './ProgressIndicator';

export default ({ children, classes }) => (
    <div>
        <ProgressIndicator type="linear" />
        <div>
            <Header />
            {children}
        </div>
    </div>
);
