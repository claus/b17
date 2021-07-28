import React from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';

import styles from './CheckBox.module.scss';

const CheckBox = ({ id, label, className, ...props }) => {
    return (
        <div className={cx(styles.root, className)}>
            <input id={id} type="checkbox" {...props} />
            <label htmlFor={id}>{label}</label>
        </div>
    );
};

CheckBox.propTypes = {
    id: PropTypes.string.isRequired,
    label: PropTypes.string.isRequired,
    className: PropTypes.string,
};

export default CheckBox;
