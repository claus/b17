import React from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';

import { useDispatchContext, useStateContext, SET_JPEG } from 'store';
import { useOutguessAPI } from 'components/OutguessAPIProvider';

import styles from './EphemeraForm.module.scss';

const EphemeraForm = ({ disabled }) => {
    const api = useOutguessAPI();
    const dispatch = useDispatchContext();
    const { jpeg } = useStateContext();

    const setJpeg = (byteArray, fileName) => {
        if (jpeg) {
            URL.revokeObjectURL(jpeg.objectUrl);
            api.freeBitmap();
        }
        const pointer = api.createBuffer(byteArray.byteLength);
        api.ctx.HEAP8.set(byteArray, pointer);
        const result = api.readBitmap(pointer, byteArray.byteLength);
        if (result === 0) {
            console.log('JPEG OK!');
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
            // TODO: Error
            console.log('Decode: Not a JPEG');
            dispatch({
                type: SET_JPEG,
                jpeg: null,
            });
        }
    };

    const handleUploadChange = () => {
        if (event.target.files.length === 0) return;
        const fileName = event.target.files[0].name;
        const reader = new FileReader();
        reader.onload = function () {
            const buffer = this.result;
            const bytes = new Uint8Array(buffer);
            if (bytes.byteLength < 2 || bytes[0] != 0xff || bytes[1] != 0xd8) {
                // TODO: Error
                console.log('Upload: Not a JPEG');
            } else {
                setJpeg(bytes, fileName);
            }
            // const p = api.createBuffer(array.byteLength);
            // Module.HEAP8.set(array, p);
            // if (api.readBitmap(p, array.byteLength) === 0) {
            //     console.log('JPEG is ok.');
            //     for (let i = 0; i < 10000; i++) {
            //         const res = api.decode('112313091989');
            //         if (res === 0) {
            //             const resultPointer = api.getDecodeResultData();
            //             const resultSize = api.getDecodeResultLen();
            //             const resultView = new Uint8Array(
            //                 Module.HEAP8.buffer,
            //                 resultPointer,
            //                 resultSize
            //             );
            //             const result = new Uint8Array(resultView);
            //             console.log(`Result size: ${resultSize}`);
            //             document.getElementById('image').src =
            //                 URL.createObjectURL(
            //                     new Blob([result.buffer], {
            //                         type: 'image/jpeg',
            //                     })
            //                 );
            //             api.freeDecodeResultData();
            //         } else {
            //             console.log('Unable to decode.');
            //         }
            //     }
            //     api.freeBitmap();
            // } else {
            //     console.log('JPEG NOT ok!');
            // }
        };
        reader.readAsArrayBuffer(event.target.files[0]);
    };

    const handleDownloadSubmit = async event => {
        event.preventDefault();
        const url = event.target.elements.namedItem('ephemeraUrl').value;
        const response = await fetch('/api/proxy', {
            method: 'POST',
            body: url,
        });
        if (response.status >= 400) {
            // TODO: Error
            const message = await response.text();
            console.log(`Download: ${message}`);
        } else {
            const contentDisp = response.headers.get('Content-Disposition');
            const fileName = contentDisp.match(/^attachment; filename="(.*)"$/);
            const buffer = await response.arrayBuffer();
            const bytes = new Uint8Array(buffer);
            setJpeg(bytes, fileName?.[1] ?? '');
        }
    };

    const uploadButtonClass = cx(styles.uploadButton, {
        [styles['uploadButton-isDisabled']]: disabled,
    });

    return (
        <div className={styles.root}>
            <label className={uploadButtonClass}>
                <input
                    type="file"
                    onChange={handleUploadChange}
                    className={styles.uploadButtonHidden}
                    disabled={disabled}
                />
                Upload
            </label>
            <hr className={styles.separator} />
            <form
                noValidate
                onSubmit={handleDownloadSubmit}
                className={styles.ephemeraDownloadForm}
            >
                <input
                    type="url"
                    name="ephemeraUrl"
                    placeholder="https://example.com/ephemera.jpeg"
                    className={styles.input}
                    disabled={disabled}
                    autoComplete="off"
                />
                <input
                    type="submit"
                    name="submit"
                    value="Load"
                    className={styles.submitButton}
                    disabled={disabled}
                />
            </form>
        </div>
    );
};

EphemeraForm.propTypes = {
    disabled: PropTypes.bool,
    className: PropTypes.string,
};

export default EphemeraForm;
