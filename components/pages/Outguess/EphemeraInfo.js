import React from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';

import { useStateContext } from 'store';

import styles from './EphemeraInfo.module.scss';

const EphemeraInfo = ({ className }) => {
    const { jpeg } = useStateContext();
    return (
        <aside className={cx(styles.root, className)}>
            <h2 className={styles.headline}>Selected Ephemera</h2>
            <p className={styles.info}>
                {`Name: ${jpeg.fileName}`}
            </p>
            <p className={styles.info}>
                {`Size: ${jpeg.fileLength} bytes`}
            </p>
            <p className={styles.info}>
                {`Image size: ${jpeg.width} x ${jpeg.height} px`}
            </p>
            <img src={jpeg.objectURL} alt="" className={styles.image} />
        </aside>
    );
};

EphemeraInfo.propTypes = {
    // prop: PropTypes.string.isRequired,
    className: PropTypes.string,
};

export default EphemeraInfo;
