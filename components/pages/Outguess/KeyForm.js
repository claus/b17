import React, { useRef, useEffect, useState, useCallback } from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';
import accents from 'remove-accents';

import {
    useDispatchContext,
    useStateContext,
    SET_BUSY,
    OUTGUESS_SET_OPTIONS,
} from 'store';

import * as ga from 'utils/ga';
import { permutations } from 'utils';
import { useOutguessAPI } from 'components/OutguessAPIProvider';

import Section from 'components/ui/Section';
import InputField from 'components/ui/InputField';
import Button from 'components/ui/Button';
import CheckBox from 'components/ui/CheckBox';

import styles from './KeyForm.module.scss';

const KeyForm = ({ className }) => {
    const api = useOutguessAPI();
    const dispatch = useDispatchContext();
    const { busy, outguessOptions } = useStateContext();
    const [keys, setKeys] = useState(null);
    const [keysValid, setKeysValid] = useState(false);
    const [progress, setProgress] = useState(0);
    const [result, setResult] = useState(null);
    const formRef = useRef();
    const raf = useRef();
    const index = useRef(0);

    const getKeys = useCallback(() => {
        if (outguessOptions.defaultKey) {
            return ['Default key'];
        }
        const converted = formRef.current.elements
            .namedItem('keys')
            .value.split(',')
            .map(key => {
                key = key.trim();
                if (outguessOptions.lowercase) {
                    key = key.toLowerCase();
                }
                if (outguessOptions.noWhitespace) {
                    key = key.replace(/\s+/g, '');
                }
                if (outguessOptions.noAccents) {
                    key = accents.remove(key);
                }
                if (outguessOptions.noNonAlphaNum) {
                    key = key.replace(/[^a-zA-Z0-9]/g, '');
                }
                return key;
            })
            .filter(key => key?.length > 0);
        return converted;
    }, [outguessOptions]);

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
                            ga.event('outguess', 'outguess_test_found', key);
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

    useEffect(() => {
        setKeysValid(getKeys().length > 0);
    }, [outguessOptions, getKeys]);

    const handleKeySubmit = event => {
        event.preventDefault();
        const keys = getKeys();
        index.current = 0;
        setResult(null);
        setKeys(permutations(keys));
        ga.event('outguess', 'outguess_test_keys', keys.join(', '));
    };

    const handleInput = () => {
        index.current = 0;
        setResult(null);
        setKeysValid(getKeys().length > 0);
    };

    const handleChange = () => {
        const item = name => formRef.current.elements.namedItem(name);
        const defaultKey = item('outguess-options-defaultkey').checked;
        const lowercase = item('outguess-options-lowercase').checked;
        const noWhitespace = item('outguess-options-no-whitespace').checked;
        const noAccents = item('outguess-options-no-accents').checked;
        const noNonAlphaNum = item('outguess-options-no-nonalphanum').checked;
        dispatch({
            type: OUTGUESS_SET_OPTIONS,
            defaultKey,
            lowercase,
            noWhitespace,
            noAccents,
            noNonAlphaNum,
        });
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

    const inputDisabled = busy || outguessOptions.defaultKey;
    const buttonDisabled = busy || (!keysValid && !outguessOptions.defaultKey);

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
                ref={formRef}
            >
                <div className={styles.checkboxes}>
                    <fieldset disabled={busy}>
                        <CheckBox
                            id="outguess-options-defaultkey"
                            name="outguess-options-defaultkey"
                            label='Test for "Default key"'
                            checked={outguessOptions.defaultKey}
                            onChange={handleChange}
                            className={styles.checkbox}
                        />
                        <CheckBox
                            id="outguess-options-lowercase"
                            name="outguess-options-lowercase"
                            label="Lowercase"
                            checked={outguessOptions.lowercase}
                            disabled={outguessOptions.defaultKey}
                            onChange={handleChange}
                            className={styles.checkbox}
                        />
                        <CheckBox
                            id="outguess-options-no-whitespace"
                            name="outguess-options-no-whitespace"
                            label="Remove whitespace"
                            checked={outguessOptions.noWhitespace}
                            disabled={outguessOptions.defaultKey}
                            onChange={handleChange}
                            className={styles.checkbox}
                        />
                        <CheckBox
                            id="outguess-options-no-accents"
                            name="outguess-options-no-accents"
                            label="Convert accented characters"
                            checked={outguessOptions.noAccents}
                            disabled={outguessOptions.defaultKey}
                            onChange={handleChange}
                            className={styles.checkbox}
                        />
                        <CheckBox
                            id="outguess-options-no-nonalphanum"
                            name="outguess-options-no-nonalphanum"
                            label="Remove non-alphanumeric characters"
                            checked={outguessOptions.noNonAlphaNum}
                            disabled={outguessOptions.defaultKey}
                            onChange={handleChange}
                            className={styles.checkbox}
                        />
                    </fieldset>
                </div>
                <div className={styles.keyFormInput}>
                    <InputField
                        type="url"
                        name="keys"
                        disabled={inputDisabled}
                        onInput={handleInput}
                        className={styles.input}
                    />
                    <Button
                        label="Test"
                        disabled={buttonDisabled}
                        className={styles.submitButton}
                    />
                </div>
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
