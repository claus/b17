import cx from 'classnames';

import { useStateContext } from 'store';

import Head from 'components/misc/Head';

import EphemeraForm from './EphemeraForm';
import EphemeraInfo from './EphemeraInfo';
import KeyForm from './KeyForm';

import styles from './Outguess.module.scss';

const OutguessPage = ({ fontsLoaded }) => {
    const { jpeg } = useStateContext();

    const rootStyle = cx(styles.root, {
        [styles['root-isHidden']]: !fontsLoaded,
    });

    return (
        <div className={rootStyle}>
            <Head
                title="∩The∩∩∩Outguess∩∩∩Device∩∩∩∩∩∩"
                description="Uses Outguess to find hidden data in JPEG Ephemera"
                url="https://thedoor.dev/outguess"
            />
            <main className={styles.main}>
                <header className={styles.header}>
                    <span className={styles.door}>∩</span>
                    <h1 className={styles.title}>The Outguess Device</h1>
                </header>
                <EphemeraForm />
                {jpeg && (
                    <div className={styles.step2}>
                        <KeyForm
                            className={styles.keyForm}
                            key={`${jpeg.fileName}-${jpeg.fileLength}`}
                        />
                        <EphemeraInfo className={styles.ephemeraInfo} />
                    </div>
                )}
            </main>
        </div>
    );
};

export default OutguessPage;
