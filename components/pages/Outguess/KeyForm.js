import React, { useRef, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';

import { useDispatchContext, useStateContext, SET_BUSY } from 'store';

import { permutations, detectFileType } from 'utils';
import { useOutguessAPI } from 'components/OutguessAPIProvider';

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
                        const fileInfo = detectFileType(bytes);
                        if (fileInfo) {
                            console.log(keys, index.current);
                            console.log('CREATE URL');
                            const blob = new Blob([fileInfo.bytes], {
                                type: fileInfo.mime,
                            });
                            const blobUrl = URL.createObjectURL(blob);
                            setResult({ ...fileInfo, blobUrl });
                            dispatch({ type: SET_BUSY, busy: false });
                            break;
                        }
                        // console.log(`Result size: ${result.byteLength}`);
                        // document.getElementById('image').src =
                        //     URL.createObjectURL(
                        //         new Blob([result.buffer], {
                        //             type: 'image/jpeg',
                        //         })
                        //     );
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
        setKeys(permutations(event.target.elements.namedItem('keys').value));
    };

    const progressPercent = Math.round(progress * 100);

    return (
        <div className={cx(styles.root, className)}>
            <h2 className={styles.headline}>Keys</h2>
            <form
                noValidate
                onSubmit={handleKeySubmit}
                className={styles.keyForm}
            >
                <input
                    type="url"
                    name="keys"
                    placeholder=""
                    className={styles.input}
                    disabled={busy}
                    autoComplete="off"
                />
                <input
                    type="submit"
                    name="submit"
                    value="Test"
                    className={styles.submitButton}
                    disabled={busy}
                />
            </form>
            {busy && (
                <div className={styles.progress}>
                    Testing <span>{index.current}</span> of{' '}
                    <span>{keys?.length ?? 0}</span> keys (
                    <span>{progressPercent}</span>%)
                </div>
            )}
            {result && (
                <Result result={result} password={keys[index.current - 1]} />
            )}
        </div>
    );
};

const Result = ({ result, password }) => {
    const fileName = `${password}.${result.ext}`;

    useEffect(() => {
        const blobUrl = result.blobUrl;
        return () => {
            console.log(`revoke ${blobUrl}`);
            URL.revokeObjectURL(blobUrl);
        };
    }, [result.blobUrl]);

    return (
        <div className={styles.result}>
            <h2 className={styles.resultHeadline}>Embedded data found!</h2>
            <p className={styles.resultInfo}>Type: {result.mime}</p>
            <p className={styles.resultInfo}>
                Size: {result.bytes.byteLength} bytes
            </p>
            <p className={styles.resultInfo}>Key: {password}</p>
            <p className={styles.resultDownload}>
                <a href={result.blobUrl} download={fileName}>
                    Download
                </a>
            </p>
        </div>
    );
};

Result.propTypes = {
    result: PropTypes.object.isRequired,
    password: PropTypes.string.isRequired,
};

KeyForm.propTypes = {
    className: PropTypes.string,
};

export default KeyForm;
