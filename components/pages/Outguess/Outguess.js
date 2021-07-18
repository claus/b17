import { useState } from 'react';
import cx from 'classnames';

import Head from 'next/head';

import { useOutguessAPI } from 'components/OutguessAPIProvider';

import EphemeraForm from './EphemeraForm';

import styles from './Outguess.module.scss';

const OutguessPage = ({ fontsLoaded }) => {
    const api = useOutguessAPI();


    const rootStyle = cx(styles.root, {
        [styles['root-isHidden']]: !fontsLoaded,
    });

    return (
        <div className={rootStyle}>
            <Head>
                <title>∩The∩∩∩Outguess∩∩∩Device∩∩∩∩∩∩</title>
            </Head>
            <main className={styles.main}>
                <header className={styles.header}>
                    <span className={styles.door}>∩</span>
                    <h1 className={styles.title}>The Outguess Device</h1>
                </header>
                <EphemeraForm />
            </main>
        </div>
    );
};

export default OutguessPage;
