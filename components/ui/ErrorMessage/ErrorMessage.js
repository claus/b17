import React from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';

import styles from './ErrorMessage.module.scss';

const ErrorMessage = ({ children, className }) => {
    return <div className={cx(styles.root, className)}>{children}</div>;
};

ErrorMessage.propTypes = {
    children: PropTypes.string.isRequired,
    className: PropTypes.string,
};

export default ErrorMessage;
