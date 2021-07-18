import React, { useState } from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';

import styles from './EphemeraForm.module.scss';

const EphemeraForm = ({ disabled }) => {
    const [jpegObjectURL, setJpegObjectURL] = useState(null);

    const handleUploadChange = () => {
        //
    };

    const handleDownloadSubmit = async event => {
        event.preventDefault();
        const url = event.target.elements.namedItem('ephemeraUrl').value;
        const response = await fetch('/api/proxy', {
            method: 'POST',
            body: url,
        });
        if (response.status >= 400) {
            console.log(await response.text());
        } else {
            const buffer = await response.arrayBuffer();
            const bytes = new Uint8Array(buffer);
            if (jpegObjectURL) {
                URL.revokeObjectURL(jpegObjectURL);
            }
            setJpegObjectURL(
                URL.createObjectURL(
                    new Blob([bytes.buffer], { type: 'image/jpeg' })
                )
            );
            console.log(bytes);
        }
    };

    const uploadButtonClass = cx(styles.uploadButton, {
        [styles['uploadButton-isDisabled']]: disabled,
    });

    return (
        <div className={styles.root}>
            <label className={uploadButtonClass}>
                <input
                    type="file"
                    onChange={handleUploadChange}
                    className={styles.uploadButtonHidden}
                    disabled={disabled}
                />
                Upload
            </label>
            <hr className={styles.separator} />
            <form
                noValidate
                onSubmit={handleDownloadSubmit}
                className={styles.ephemeraDownloadForm}
            >
                <input
                    type="url"
                    name="ephemeraUrl"
                    placeholder="https://example.com/ephemera.jpeg"
                    className={styles.input}
                    disabled={disabled}
                />
                <input
                    type="submit"
                    name="submit"
                    value={'Load'}
                    className={styles.submitButton}
                    disabled={disabled}
                />
            </form>
        </div>
    );
};

EphemeraForm.propTypes = {
    disabled: PropTypes.bool,
    className: PropTypes.string,
};

export default EphemeraForm;
