import cx from 'classnames';

import { useStateContext } from 'store';

import Head from 'components/misc/Head';
import Header from 'components/ui/Header';

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
                <Header title="The Outguess Device" />
                <EphemeraForm />
                {jpeg && (
                    <div className={styles.extract}>
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
