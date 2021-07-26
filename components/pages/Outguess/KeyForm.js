import React, { useRef, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';

import { useDispatchContext, useStateContext, SET_BUSY } from 'store';

import { permutations } from 'utils';
import { useOutguessAPI } from 'components/OutguessAPIProvider';

import Section from 'components/ui/Section';
import InputField from 'components/ui/InputField';
import Button from 'components/ui/Button';

import styles from './KeyForm.module.scss';

const KeyForm = ({ className }) => {
    const api = useOutguessAPI();
    const dispatch = useDispatchContext();
    const { busy } = useStateContext();
    const [keys, setKeys] = useState(null);
    const [progress, setProgress] = useState(0);
    const [result, setResult] = useState(null);
    const raf = useRef();
    const index = useRef(0);

    useEffect(() => {
        if (keys?.length > 0) {
            let keyFound = false;
            dispatch({ type: SET_BUSY, busy: true });
            const keyRunner = () => {
                const start = performance.now();
                while (index.current < keys.length) {
                    const key = keys[index.current++];
                    const res = api.decode(key);
                    if (res === 0) {
                        const resultPointer = api.getDecodeResultData();
                        const resultSize = api.getDecodeResultLen();
                        const resultView = new Uint8Array(
                            api.ctx.HEAP8.buffer,
                            resultPointer,
                            resultSize
                        );
                        const bytes = new Uint8Array(resultView);
                        const fileInfo = api.getDecodeResultType();
                        if (fileInfo) {
                            const blob = new Blob([bytes], {
                                type: fileInfo.mime,
                            });
                            const blobUrl = URL.createObjectURL(blob);
                            keyFound = true;
                            setResult({ ...fileInfo, bytes, blobUrl });
                            dispatch({ type: SET_BUSY, busy: false });
                            break;
                        }
                        api.freeDecodeResultData();
                    }
                    if (performance.now() - start > 12) {
                        setProgress(index.current / keys.length);
                        if (index.current < keys.length) {
                            raf.current = requestAnimationFrame(keyRunner);
                        }
                        break;
                    }
                }
                if (index.current === keys.length) {
                    dispatch({ type: SET_BUSY, busy: false });
                    if (!keyFound) {
                        setResult({ bytes: null });
                    }
                }
            };
            keyRunner();
        }
        return () => {
            cancelAnimationFrame(raf.current);
        };
    }, [keys, dispatch, api]);

    const handleKeySubmit = event => {
        event.preventDefault();
        index.current = 0;
        setResult(null);
        const input = event.target.elements.namedItem('keys').value;
        setKeys(permutations(input.toLowerCase()));
    };

    const handleInput = () => {
        index.current = 0;
        setResult(null);
    };

    const renderResult = () => {
        if (!result) {
            return null;
        }
        if (result.bytes === null) {
            return <ResultNegative />;
        }
        return (
            <ResultPositive
                result={result}
                password={keys[index.current - 1]}
            />
        );
    };

    const progressPercent = Math.round(progress * 100);

    return (
        <Section
            headline="Keys"
            info="Enter up to 7 comma-separated keys to test all permutations"
            className={cx(styles.root, className)}
        >
            <form
                noValidate
                onSubmit={handleKeySubmit}
                className={styles.keyForm}
            >
                <InputField
                    type="url"
                    name="keys"
                    disabled={busy}
                    onInput={handleInput}
                    className={styles.input}
                />
                <Button
                    label="Test"
                    disabled={busy}
                    className={styles.submitButton}
                />
            </form>
            {busy && (
                <div className={styles.progress}>
                    Testing <span>{index.current}</span> of{' '}
                    <span>{keys?.length ?? 0}</span> keys (
                    <span>{progressPercent}</span>%)
                </div>
            )}
            {renderResult()}
        </Section>
    );
};

const ResultNegative = () => {
    return (
        <div className={cx(styles.result, styles.resultNegative)}>
            <p className={styles.resultInfo}>No embedded data found</p>
        </div>
    );
};

const ResultPositive = ({ result, password }) => {
    useEffect(() => {
        const blobUrl = result.blobUrl;
        return () => URL.revokeObjectURL(blobUrl);
    }, [result.blobUrl]);

    const fileName = `${password}.${result.ext}`;

    return (
        <div className={cx(styles.result, styles.resultPositive)}>
            <h2 className={styles.resultHeadline}>Embedded data found!</h2>
            <p className={styles.resultInfo}>Type: {result.mime}</p>
            <p className={styles.resultInfo}>
                Size: {result.bytes.byteLength} bytes
            </p>
            <p className={styles.resultInfo}>Key: {password}</p>
            <p className={styles.resultDownload}>
                <a
                    href={result.blobUrl}
                    download={fileName}
                    className={styles.resultDownloadButton}
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className={styles.icon}
                    >
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                        <polyline points="7 10 12 15 17 10"></polyline>
                        <line x1="12" y1="15" x2="12" y2="3"></line>
                    </svg>{' '}
                    <span className={styles.label}>Download</span>
                </a>
            </p>
        </div>
    );
};

ResultPositive.propTypes = {
    result: PropTypes.object.isRequired,
    password: PropTypes.string.isRequired,
};

KeyForm.propTypes = {
    className: PropTypes.string,
};

export default KeyForm;
