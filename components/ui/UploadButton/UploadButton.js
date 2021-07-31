import React from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';

import styles from './UploadButton.module.scss';

const UploadButton = ({ label, disabled, className, ...props }) => {
    const rootClass = cx(styles.root, className, {
        [styles['root-isDisabled']]: disabled,
    });
    return (
        <label className={rootClass}>
            <input
                type="file"
                disabled={disabled}
                className={styles.uploadButtonHidden}
                {...props}
            />
            {label}
        </label>
    );
};

UploadButton.propTypes = {
    label: PropTypes.string.isRequired,
    disabled: PropTypes.bool,
    className: PropTypes.string,
};

export default UploadButton;
