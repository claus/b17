import React from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';

import { useStateContext } from 'store';

import Section from 'components/ui/Section';

import styles from './EphemeraInfo.module.scss';

const EphemeraInfo = ({ className }) => {
    const { jpeg } = useStateContext();
    const info = (
        <div className={styles.infoContainer}>
            <p>{`Name: ${jpeg.fileName}`}</p>
            <p>{`File size: ${jpeg.fileLength} bytes`}</p>
            <p>{`Image size: ${jpeg.width} x ${jpeg.height} px`}</p>
        </div>
    );
    return (
        <aside className={cx(styles.root, className)}>
            <Section headline="Selected Ephemera" info={info}>
                <img
                    width={jpeg.width}
                    height={jpeg.height}
                    src={jpeg.objectURL}
                    alt=""
                    className={styles.image}
                />
            </Section>
        </aside>
    );
};

EphemeraInfo.propTypes = {
    className: PropTypes.string,
};

export default EphemeraInfo;
