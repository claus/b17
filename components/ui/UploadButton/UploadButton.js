import React from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';

import styles from './UploadButton.module.scss';

const UploadButton = ({
    label,
    disabled,
    className,
    getDropzoneProps,
    ...props
}) => {
    const rootClass = cx(styles.root, className, {
        [styles['root-isDisabled']]: disabled,
    });
    const inputProps = {
        disabled: disabled,
        className: styles.uploadButtonHidden,
        ...props,
    };
    const inputPropsDropzone = getDropzoneProps
        ? getDropzoneProps(inputProps)
        : inputProps;
    return (
        <label className={rootClass}>
            <input {...inputPropsDropzone} />
            {label}
        </label>
    );
};

UploadButton.propTypes = {
    label: PropTypes.string.isRequired,
    disabled: PropTypes.bool,
    className: PropTypes.string,
    getDropzoneProps: PropTypes.func,
};

export default UploadButton;
