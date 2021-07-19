import { useRef, useState } from 'react';

import Head from 'next/head';

import styles from '../styles/Home.module.scss';

export default function Home() {
    const input = useRef();
    const removeAccents = useRef();
    const removeNonAlphaNum = useRef();
    const [response, setResponse] = useState();
    const [error, setError] = useState();
    const [busy, setBusy] = useState(false);

    const handleSubmit = async event => {
        setBusy(true);
        setError(null);
        setResponse(null);
        event.preventDefault();
        const url = new URL(
            `${window.location.protocol}//${window.location.host}/api/outguess`
        );
        const search = new URLSearchParams({
            key: input.current.value,
            removeAccents: removeAccents.current.checked ? '1' : '0',
            removeNonAlphaNum: removeNonAlphaNum.current.checked ? '1' : '0',
        });
        url.search = search;
        const res = await fetch(url);
        const json = await res.json();
        if (json.error) {
            setError(json);
        } else {
            setResponse(json);
        }
        setBusy(false);
    };

    return (
        <div className={styles.container}>
            <Head>
                <meta charSet="utf-8" />
                <meta
                    name="viewport"
                    content="width=device-width, initial-scale=1"
                />
                <title>∩∩∩∩∩∩∩∩∩∩∩∩∩</title>
            </Head>

            <main className={styles.main}>
                <h1 className={styles.title}>∩</h1>
                <form onSubmit={handleSubmit}>
                    <fieldset className={styles.fieldset} disabled={busy}>
                        <legend>Please enter your key</legend>
                        <div className={styles.inputs}>
                            <input
                                type="text"
                                name="b17key"
                                ref={input}
                                className={styles.input}
                            />
                            <input
                                type="submit"
                                name="submit"
                                value={busy ? 'Please wait...' : 'Submit'}
                                className={styles.submit}
                            />
                        </div>
                        <div className={styles.checkboxes}>
                            <input
                                type="checkbox"
                                id="removeAccents"
                                name="removeAccents"
                                ref={removeAccents}
                            />
                            <label
                                htmlFor="removeAccents"
                                className={styles.removeAccents}
                            >
                                Remove accents/umlauts
                            </label>
                            <input
                                type="checkbox"
                                id="removeNonAlphaNum"
                                name="removeNonAlphaNum"
                                ref={removeNonAlphaNum}
                                className={styles.removeNonAlphaNum}
                            />
                            <label htmlFor="removeNonAlphaNum">
                                Remove non-alphanumeric characters
                            </label>
                        </div>
                    </fieldset>
                </form>
                {response && (
                    <div className={styles.results}>
                        <h2 className={styles.resultsHeadline}>Results</h2>
                        <ul className={styles.resultsList}>
                            {response.map((item, i) => (
                                <ResultItem item={item} key={i} />
                            ))}
                        </ul>
                    </div>
                )}
                {error && (
                    <div className={styles.resultsError}>{error.error}</div>
                )}
            </main>
        </div>
    );
}

function ResultItem({ item }) {
    if (typeof item.code !== 'undefined') {
        return (
            <li className={styles.resultError}>
                <span>{item.key}</span> ⛔️
            </li>
        );
    }
    const url = `/api/download?filename=${encodeURIComponent(item.file)}`;
    return (
        <li className={styles.resultSuccess}>
            <span>{item.key}: </span> 🎉🏆👍
            <br />
            <a href={url} download>
                {item.file}
            </a>
            <br />
            <span>{` (${item.mime})`}</span>
        </li>
    );
}
