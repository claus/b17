/* global OutguessModule */

import React, { createContext, useState, useCallback, useContext } from 'react';
import PropTypes from 'prop-types';
import Script from 'next/script';

const noop = () => {};

const OutguessAPI = createContext();

const OutguessAPIProvider = ({ children }) => {
    const [api, setApi] = useState({
        isReady: false,
        createBuffer: noop,
        readBitmap: noop,
        freeBitmap: noop,
        decode: noop,
        getDecodeResultLen: noop,
        getDecodeResultData: noop,
        freeDecodeResultData: noop,
    });

    const handleOutguessScriptLoad = useCallback(async () => {
        const Outguess = await OutguessModule({
            preRun: ctx => {
                const STDOUT = 'stdout';
                const STDERR = 'stderr';
                const buffers = { [STDOUT]: '', [STDERR]: '' };
                const handler = type => code => {
                    const buffer = buffers[type];
                    if (code === 10 && buffer !== '') {
                        console.log(`${type}: ${buffer}`);
                        buffer = '';
                    } else {
                        buffer += String.fromCharCode(code);
                    }
                };
                ctx.stdout = handler(STDOUT);
                ctx.stderr = handler(STDERR);
            },
        });

        // prettier-ignore
        setApi({
            isReady: true,
            createBuffer: Outguess.cwrap('create_buffer', 'number', ['number']),
            readBitmap: Outguess.cwrap('read_bitmap', 'number', ['number', 'number']),
            freeBitmap: Outguess.cwrap('free_bitmap', '', []),
            decode: Outguess.cwrap('decode', 'number', ['string']),
            getDecodeResultLen: Outguess.cwrap('get_decode_result_len', 'number', []),
            getDecodeResultData: Outguess.cwrap('get_decode_result_data', 'number', []),
            freeDecodeResultData: Outguess.cwrap('free_decode_result_data', '', []),
        });
    }, []);

    return (
        <OutguessAPI.Provider value={api}>
            <Script
                id="outguess"
                src="/assets/outguess/outguess.js"
                strategy="afterInteractive"
                onLoad={handleOutguessScriptLoad}
            />
            {children}
        </OutguessAPI.Provider>
    );
};

OutguessAPIProvider.propTypes = {
    children: PropTypes.node.isRequired,
};

export const useOutguessAPI = () => useContext(OutguessAPI);

export default OutguessAPIProvider;
