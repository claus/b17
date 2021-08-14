import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';

import styles from './ResultPositive.module.scss';

const ResultPositive = ({ result, className }) => {
    const { blobUrl, bytes, key, ext, mime } = result;

    useEffect(() => {
        return () => URL.revokeObjectURL(blobUrl);
    }, [blobUrl]);

    const fileName = `${key}.${ext}`;

    return (
        <div className={cx(styles.root, className)}>
            <h2 className={styles.headline}>Embedded data found!</h2>
            <p className={styles.info}>
                Key: <span className={styles.key}>{key}</span>
            </p>
            <p className={styles.info}>
                File type: <span>{mime}</span>
            </p>
            <p className={styles.info}>
                File size: <span>{bytes.byteLength} bytes</span>
            </p>
            <p className={styles.download}>
                <a
                    href={blobUrl}
                    download={fileName}
                    className={styles.downloadButton}
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className={styles.icon}
                    >
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                        <polyline points="7 10 12 15 17 10"></polyline>
                        <line x1="12" y1="15" x2="12" y2="3"></line>
                    </svg>{' '}
                    <span className={styles.label}>Download</span>
                </a>
            </p>
        </div>
    );
};

ResultPositive.propTypes = {
    result: PropTypes.shape({
        key: PropTypes.string.isRequired,
        ext: PropTypes.string.isRequired,
        mime: PropTypes.string.isRequired,
        blobUrl: PropTypes.string.isRequired,
        bytes: PropTypes.object.isRequired,
    }).isRequired,
    className: PropTypes.string,
};

export default ResultPositive;
