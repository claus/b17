import React, { useState } from 'react';
import PropTypes from 'prop-types';

import * as ga from 'utils/ga';
import { cleanUrl } from 'utils';
import { useDispatchContext, useStateContext, SET_JPEG } from 'store';
import { useOutguessAPI } from 'components/OutguessAPIProvider';

import UploadButton from 'components/ui/UploadButton';
import Button from 'components/ui/Button';
import Section from 'components/ui/Section';
import InputField from 'components/ui/InputField';

import styles from './EphemeraForm.module.scss';

const EphemeraForm = () => {
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
            ga.event('outguess', 'outguess_decode_jpeg', fileName);
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

    const handleUploadClick = event => {
        event.target.value = null;
        setError(null);
    }

    const handleUpload = () => {
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
                ga.event('outguess', 'outguess_upload_jpeg', fileName);
                setJpeg(bytes, fileName);
            }
        };
        reader.readAsArrayBuffer(event.target.files[0]);
    };

    const handleDownload = async event => {
        event.preventDefault();
        setError(null);
        dispatch({ type: SET_JPEG, jpeg: null });
        const url = event.target.elements.namedItem('ephemeraUrl').value;
        if (!url || url.length === 0) {
            setError('Please enter a URL');
            return;
        }
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
            ga.event('outguess', 'outguess_download_jpeg', cleanUrl(url));
            setJpeg(bytes, fileName?.[1] ?? '');
        }
    };

    return (
        <Section
            headline="Ephemera"
            info="Either upload a JPEG from your device, or download one from the Internet (Discord links work!)"
        >
            <div className={styles.root}>
                <UploadButton
                    label="Upload"
                    accept="image/jpeg"
                    onChange={handleUpload}
                    onClick={handleUploadClick}
                    disabled={busy}
                />
                <hr className={styles.separator} />
                <form
                    noValidate
                    onSubmit={handleDownload}
                    className={styles.ephemeraDownloadForm}
                >
                    <InputField
                        type="url"
                        name="ephemeraUrl"
                        placeholder="https://example.com/ephemera.jpeg"
                        disabled={busy}
                        className={styles.input}
                    />
                    <Button label="Load" disabled={busy} />
                </form>
            </div>
            {error && <div className={styles.error}>{error}</div>}
        </Section>
    );
};

EphemeraForm.propTypes = {
    className: PropTypes.string,
};

export default EphemeraForm;
