import React from 'react';
import PropTypes from 'prop-types';

import styles from './Header.module.scss';

const Header = ({ title }) => {
    return (
        <header className={styles.root}>
            <span className={styles.door}>∩</span>
            <h1 className={styles.title}>{title}</h1>
        </header>
    );
};

Header.propTypes = {
    title: PropTypes.string.isRequired,
};

export default Header;
