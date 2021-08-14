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

    const keyBase = `${jpeg?.fileName}-${jpeg?.fileLength}`;

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
                        <div className={styles.forms}>
                            <KeyForm key={`${keyBase}-keyForm`} />
                        </div>
                        <EphemeraInfo className={styles.ephemeraInfo} />
                    </div>
                )}
            </main>
        </div>
    );
};

export default OutguessPage;
