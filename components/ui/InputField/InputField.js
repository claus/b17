import React from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';

import styles from './InputField.module.scss';

const InputField = ({ className, ...props }) => {
    return (
        <input
            type="text"
            className={cx(styles.root, className)}
            autoComplete="off"
            {...props}
        />
    );
};

InputField.propTypes = {
    className: PropTypes.string,
};

export default InputField;
