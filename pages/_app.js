import 'styles/globals.css';
import 'styles/colors.scss';

import { useEffect } from 'react';
import { useRouter } from 'next/router';
import * as ga from 'utils/ga';

import useLoadFonts from 'hooks/useLoadFonts';

import { GlobalProvider } from 'store';
import OutguessAPIProvider from 'components/OutguessAPIProvider';

import Head from 'next/head';

import styles from 'styles/modules/app.module.scss';

const fontFamilies = [
    'neue-haas-grotesk-display:n7',
    'neue-haas-grotesk-text:n4,n5,n7',
    'roboto:n4',
];

function MyApp({ Component, pageProps }) {
    const router = useRouter();
    const fontsLoaded = useLoadFonts(fontFamilies);

    useEffect(() => {
        const onRouteChange = url => ga.pageview(url);
        router.events.on('routeChangeComplete', onRouteChange);
        return () => router.events.off('routeChangeComplete', onRouteChange);
    }, [router.events]);

    return (
        <GlobalProvider>
            <OutguessAPIProvider>
                <Head>
                    <meta
                        name="viewport"
                        content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0"
                    />
                </Head>
                <main className={styles.main}>
                    <Component {...pageProps} fontsLoaded={fontsLoaded} />
                </main>
            </OutguessAPIProvider>
        </GlobalProvider>
    );
}

export default MyApp;
