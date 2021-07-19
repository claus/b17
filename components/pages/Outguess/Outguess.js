import { useState } from 'react';
import cx from 'classnames';

import Head from 'next/head';

import { useStateContext } from 'store';
import { useOutguessAPI } from 'components/OutguessAPIProvider';

import EphemeraForm from './EphemeraForm';
import EphemeraInfo from './EphemeraInfo';
import KeyForm from './KeyForm';

import styles from './Outguess.module.scss';

const OutguessPage = ({ fontsLoaded }) => {
    const api = useOutguessAPI();
    const { jpeg } = useStateContext();

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
                {jpeg && (
                    <div className={styles.step2}>
                        <KeyForm className={styles.keyForm} />
                        <EphemeraInfo className={styles.ephemeraInfo} />
                    </div>
                )}
            </main>
        </div>
    );
};

export default OutguessPage;
