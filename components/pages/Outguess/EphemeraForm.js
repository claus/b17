import React, { useState } from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';

import * as ga from 'utils/ga';
import { cleanUrl } from 'utils';
import { useDispatchContext, useStateContext, SET_JPEG } from 'store';
import { useOutguessAPI } from 'components/OutguessAPIProvider';
import { useDropzone } from 'react-dropzone';

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
    const disabled = busy;

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

    const dropzone = useDropzone({
        onDropAccepted: upload, // eslint-disable-line no-use-before-define
        onDropRejected: () => setError(null),
        accept: 'image/jpeg',
        multiple: false,
        noKeyboard: true,
        noClick: true,
        disabled,
    });

    const {
        getRootProps,
        getInputProps,
        isDragAccept,
        inputRef,
    } = dropzone;

    function upload(files) {
        if (!files || files.length === 0) return;
        const file = files[0];
        setError(null);
        dispatch({ type: SET_JPEG, jpeg: null });
        const fileName = file.name;
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
            inputRef.current.value = null;
        };
        reader.readAsArrayBuffer(file);
    }

    const handleUpload = event => {
        upload(event.target.files);
    };

    const handleUploadClick = () => {
        setError(null);
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

    const rootClass = cx(styles.root, {
        [styles.isDragAccept]: isDragAccept,
    });

    return (
        <Section
            headline="Ephemera"
            info="Either upload a JPEG from your device, or download one from the Internet (Discord links work!)"
        >
            <div {...getRootProps({ className: rootClass })}>
                <UploadButton
                    label="Upload"
                    accept="image/jpeg"
                    multiple={false}
                    onChange={handleUpload}
                    onClick={handleUploadClick}
                    disabled={disabled}
                    getDropzoneProps={getInputProps}
                    className={styles.uploadButton}
                />
                <hr className={styles.separator} />
                <form
                    noValidate
                    onSubmit={handleDownload}
                    className={styles.downloadForm}
                >
                    <InputField
                        type="url"
                        name="ephemeraUrl"
                        placeholder="https://example.com/ephemera.jpeg"
                        disabled={disabled}
                        className={styles.input}
                    />
                    <Button label="Load" disabled={disabled} />
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
