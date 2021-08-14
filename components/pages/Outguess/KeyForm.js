import React, { useRef, useEffect, useState, useCallback } from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';
import accents from 'remove-accents';

import {
    useDispatchContext,
    useStateContext,
    OUTGUESS_EXTRACT_OPTIONS,
} from 'store';

import * as ga from 'utils/ga';
import { permutations } from 'utils';
import useOutguess from './useOutguess';

import ResultPositive from './ResultPositive';
import ResultNegative from './ResultNegative';

import Section from 'components/ui/Section';
import InputField from 'components/ui/InputField';
import Button from 'components/ui/Button';
import CheckBox from 'components/ui/CheckBox';

import styles from './KeyForm.module.scss';

const KeyForm = ({ className }) => {
    const dispatch = useDispatchContext();
    const { busy, outguessExtractOptions: options } = useStateContext();
    const [keys, setKeys] = useState(null);
    const [keysValid, setKeysValid] = useState(false);
    const formRef = useRef();

    const getKeys = useCallback(() => {
        if (options.defaultKey) {
            return ['Default key'];
        }
        const converted = formRef.current.elements
            .namedItem('keys')
            .value.split(',')
            .map(key => {
                key = key.trim();
                if (options.lowercase) {
                    key = key.toLowerCase();
                }
                if (options.noWhitespace) {
                    key = key.replace(/\s+/g, '');
                }
                if (options.noAccents) {
                    key = accents.remove(key);
                }
                if (options.noNonAlphaNum) {
                    key = key.replace(/[^a-zA-Z0-9]/g, '');
                }
                return key;
            })
            .filter(key => key?.length > 0);
        return converted;
    }, [options]);

    const [result, progress, reset] = useOutguess(keys);

    useEffect(() => {
        setKeysValid(getKeys().length > 0);
    }, [options, getKeys]);

    const handleKeySubmit = event => {
        event.preventDefault();
        reset();
        const keys = getKeys();
        setKeys(permutations(keys));
        ga.event('outguess', 'outguess_test_keys', keys.join(', '));
    };

    const handleInput = () => {
        reset();
        setKeysValid(getKeys().length > 0);
    };

    const handleChange = () => {
        const item = name => formRef.current.elements.namedItem(name);
        const defaultKey = item('outguess-extract-defaultkey').checked;
        const lowercase = item('outguess-extract-lowercase').checked;
        const noWhitespace = item('outguess-extract-no-whitespace').checked;
        const noAccents = item('outguess-extract-no-accents').checked;
        const noNonAlphaNum = item('outguess-extract-no-nonalphanum').checked;
        dispatch({
            type: OUTGUESS_EXTRACT_OPTIONS,
            defaultKey,
            lowercase,
            noWhitespace,
            noAccents,
            noNonAlphaNum,
        });
        reset();
    };

    const renderResult = () => {
        if (!result) {
            return null;
        }
        if (result.bytes === null) {
            return <ResultNegative className={styles.result} />;
        }
        return <ResultPositive result={result} className={styles.result} />;
    };

    const inputDisabled = busy || options.defaultKey;
    const buttonDisabled = busy || (!keysValid && !options.defaultKey);

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
                            id="outguess-extract-defaultkey"
                            name="outguess-extract-defaultkey"
                            label='Test for "Default key"'
                            checked={options.defaultKey}
                            onChange={handleChange}
                            className={styles.checkbox}
                        />
                        <CheckBox
                            id="outguess-extract-lowercase"
                            name="outguess-extract-lowercase"
                            label="Lowercase"
                            checked={options.lowercase}
                            disabled={options.defaultKey}
                            onChange={handleChange}
                            className={styles.checkbox}
                        />
                        <CheckBox
                            id="outguess-extract-no-whitespace"
                            name="outguess-extract-no-whitespace"
                            label="Remove whitespace"
                            checked={options.noWhitespace}
                            disabled={options.defaultKey}
                            onChange={handleChange}
                            className={styles.checkbox}
                        />
                        <CheckBox
                            id="outguess-extract-no-accents"
                            name="outguess-extract-no-accents"
                            label="Convert accented characters"
                            checked={options.noAccents}
                            disabled={options.defaultKey}
                            onChange={handleChange}
                            className={styles.checkbox}
                        />
                        <CheckBox
                            id="outguess-extract-no-nonalphanum"
                            name="outguess-extract-no-nonalphanum"
                            label="Remove non-alphanumeric characters"
                            checked={options.noNonAlphaNum}
                            disabled={options.defaultKey}
                            onChange={handleChange}
                            className={styles.checkbox}
                        />
                    </fieldset>
                </div>
                <div className={styles.keyFormInput}>
                    <InputField
                        type="text"
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
                    Testing <span>{progress.current}</span> of{' '}
                    <span>{progress.total}</span> keys (
                    <span>{Math.round(progress.percent * 100)}</span>%)
                </div>
            )}
            {renderResult()}
        </Section>
    );
};

KeyForm.propTypes = {
    className: PropTypes.string,
};

export default KeyForm;
