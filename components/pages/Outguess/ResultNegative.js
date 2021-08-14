import PropTypes from 'prop-types';
import cx from 'classnames';

import styles from './ResultNegative.module.scss';

const ResultNegative = ({ className }) => {
    return (
        <div className={cx(styles.root, className)}>No embedded data found</div>
    );
};

ResultNegative.propTypes = {
    result: PropTypes.object.isRequired,
    password: PropTypes.string.isRequired,
    className: PropTypes.string,
};

export default ResultNegative;
