import React from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';

import styles from './Section.module.scss';

const Section = ({ headline, info, children, className }) => {
    return (
        <section className={cx(styles.root, className)}>
            <h2 className={styles.headline}>{headline}</h2>
            {info && <div className={styles.info}>{info}</div>}
            {children && <div className={styles.content}>{children}</div>}
        </section>
    );
};

Section.propTypes = {
    headline: PropTypes.string.isRequired,
    subHeadline: PropTypes.string,
    children: PropTypes.node,
    className: PropTypes.string,
};

export default Section;
