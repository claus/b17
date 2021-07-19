import 'styles/globals.css';

import useLoadFonts from 'hooks/useLoadFonts';

import { GlobalProvider } from 'store';
import OutguessAPIProvider from 'components/OutguessAPIProvider';

import Head from 'next/head';

const fontFamilies = [
    'neue-haas-grotesk-display:n7',
    'neue-haas-grotesk-text:n4,n5,n7',
    'roboto:n4',
];

function MyApp({ Component, pageProps }) {
    const fontsLoaded = useLoadFonts(fontFamilies);
    return (
        <GlobalProvider>
            <OutguessAPIProvider>
                <Head>
                    <meta
                        name="viewport"
                        content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0"
                    />
                </Head>
                <Component {...pageProps} fontsLoaded={fontsLoaded} />
            </OutguessAPIProvider>
        </GlobalProvider>
    );
}

export default MyApp;
