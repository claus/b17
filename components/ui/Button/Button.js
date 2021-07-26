import React from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';

import styles from './Button.module.scss';

const Button = ({ label, className, ...props }) => {
    return (
        <input
            type="submit"
            name="submit"
            value={label}
            className={cx(styles.root, className)}
            {...props}
        />
    );
};

Button.propTypes = {
    label: PropTypes.string.isRequired,
    className: PropTypes.string,
};

export default Button;
