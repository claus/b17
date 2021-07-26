import React, { useState } from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';

import { cleanUrl } from 'utils';
import { useDispatchContext, useStateContext, SET_JPEG } from 'store';
import { useOutguessAPI } from 'components/OutguessAPIProvider';

import Section from 'components/ui/Section';
import InputField from 'components/ui/InputField';

import styles from './EphemeraForm.module.scss';

const EphemeraForm = ({ disabled }) => {
    const api = useOutguessAPI();
    const dispatch = useDispatchContext();
    const { jpeg, busy } = useStateContext();
    const [error, setError] = useState(null);

    const setJpeg = (byteArray, fileName) => {
        if (jpeg) {
            URL.revokeObjectURL(jpeg.objectUrl);
            api.freeBitmap();
        }
        const pointer = api.createBuffer(byteArray.byteLength);
        api.ctx.HEAP8.set(byteArray, pointer);
        const result = api.readBitmap(pointer, byteArray.byteLength);
        if (result === 0) {
            dispatch({
                type: SET_JPEG,
                jpeg: {
                    fileName,
                    fileLength: byteArray.byteLength,
                    width: api.getImageWidth(),
                    height: api.getImageHeight(),
                    objectURL: URL.createObjectURL(
                        new Blob([byteArray.buffer], { type: 'image/jpeg' })
                    ),
                },
            });
        } else {
            dispatch({ type: SET_JPEG, jpeg: null });
            setError('Error decoding the file. Are you sure this is a JPEG?');
        }
    };

    const handleUploadChange = () => {
        if (event.target.files.length === 0) return;
        setError(null);
        dispatch({ type: SET_JPEG, jpeg: null });
        const fileName = event.target.files[0].name;
        const reader = new FileReader();
        reader.onload = function () {
            const buffer = this.result;
            const bytes = new Uint8Array(buffer);
            if (bytes.byteLength < 2 || bytes[0] != 0xff || bytes[1] != 0xd8) {
                setError('The uploaded file is not a JPEG.');
            } else {
                setJpeg(bytes, fileName);
            }
        };
        reader.readAsArrayBuffer(event.target.files[0]);
    };

    const handleDownloadSubmit = async event => {
        event.preventDefault();
        setError(null);
        dispatch({ type: SET_JPEG, jpeg: null });
        const url = event.target.elements.namedItem('ephemeraUrl').value;
        const response = await fetch('/api/proxy', {
            method: 'POST',
            body: cleanUrl(url),
        });
        if (response.status >= 400) {
            const message = await response.text();
            setError(message);
        } else {
            const contentDisp = response.headers.get('Content-Disposition');
            const fileName = contentDisp.match(/^attachment; filename="(.*)"$/);
            const buffer = await response.arrayBuffer();
            const bytes = new Uint8Array(buffer);
            setJpeg(bytes, fileName?.[1] ?? '');
        }
    };

    const uploadButtonClass = cx(styles.uploadButton, {
        [styles['uploadButton-isDisabled']]: disabled || busy,
    });

    return (
        <Section
            headline="Ephemera"
            info="Either upload a JPEG from your device, or download one from the Internet (Discord links work!)"
        >
            <div className={styles.root}>
                <label className={uploadButtonClass}>
                    <input
                        type="file"
                        onChange={handleUploadChange}
                        className={styles.uploadButtonHidden}
                        disabled={disabled || busy}
                    />
                    Upload
                </label>
                <hr className={styles.separator} />
                <form
                    noValidate
                    onSubmit={handleDownloadSubmit}
                    className={styles.ephemeraDownloadForm}
                >
                    <InputField
                        type="url"
                        name="ephemeraUrl"
                        placeholder="https://example.com/ephemera.jpeg"
                        disabled={disabled || busy}
                        className={styles.input}
                    />
                    <input
                        type="submit"
                        name="submit"
                        value="Load"
                        className={styles.submitButton}
                        disabled={disabled || busy}
                    />
                </form>
            </div>
            {error && <div className={styles.error}>{error}</div>}
        </Section>
    );
};

EphemeraForm.propTypes = {
    disabled: PropTypes.bool,
    className: PropTypes.string,
};

export default EphemeraForm;
