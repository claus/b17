/* global OutguessModule */

import React, {
    createContext,
    useState,
    useCallback,
    useContext,
    useRef,
} from 'react';

import PropTypes from 'prop-types';
import Script from 'next/script';

const noop = () => {};

const OutguessAPI = createContext();
const OutguessStdOut = createContext();
const OutguessStdErr = createContext();

const OutguessAPIProvider = ({ children }) => {
    const [api, setApi] = useState({
        isReady: false,
        ctx: null,
        createBuffer: noop,
        readBitmap: noop,
        freeBitmap: noop,
        getImageWidth: noop,
        getImageHeight: noop,
        getImageDepth: noop,
        getImageMax: noop,
        decode: noop,
        getDecodeResultLen: noop,
        getDecodeResultData: noop,
        freeDecodeResultData: noop,
    });

    const stdErrContent = useRef([]);
    const stdOutContent = useRef([]);

    // const [, setStdErr] = useState();
    // const [, setStdOut] = useState();

    const handleOutguessScriptLoad = useCallback(async () => {
        const Outguess = await OutguessModule({
            preRun: ctx => {
                const STDOUT = 'stdout';
                const STDERR = 'stderr';
                // const buffers = { [STDOUT]: '', [STDERR]: '' };
                // const handler = type => code => {
                //     const buffer = buffers[type];
                //     if (code === 10 && buffer !== '') {
                //         console.log(`${type}: ${buffer}`);
                //         if (type === STDOUT) {
                //             stdOutContent.current.push(buffer);
                //             setStdOut(JSON.stringify(stdOutContent.current));
                //         } else {
                //             stdErrContent.current.push(buffer);
                //             setStdErr(JSON.stringify(stdErrContent.current));
                //         }
                //         buffer = '';
                //     } else {
                //         buffer += String.fromCharCode(code);
                //     }
                // };
                const handler = () => () => {};
                ctx.stdout = handler(STDOUT);
                ctx.stderr = handler(STDERR);
            },
        });

        // prettier-ignore
        setApi({
            isReady: true,
            ctx: Outguess,
            createBuffer: Outguess.cwrap('create_buffer', 'number', ['number']),
            readBitmap: Outguess.cwrap('read_bitmap', 'number', ['number', 'number']),
            freeBitmap: Outguess.cwrap('free_bitmap', '', []),
            getImageWidth: Outguess.cwrap('get_image_width', 'number', []),
            getImageHeight: Outguess.cwrap('get_image_height', 'number', []),
            getImageDepth: Outguess.cwrap('get_image_depth', 'number', []),
            getImageMax: Outguess.cwrap('get_image_max', 'number', []),
            decode: Outguess.cwrap('decode', 'number', ['string']),
            freeDecodeResultData: Outguess.cwrap('free_decode_result_data', '', []),
            getDecodeResultLen: Outguess.cwrap('get_decode_result_len', 'number', []),
            getDecodeResultData: Outguess.cwrap('get_decode_result_data', 'number', []),
            getDecodeResultType: () => {
                const type = Outguess.cwrap('get_decode_result_type', 'number', [])();
                switch (type) {
                    case 1: return { mime: 'image/jpeg', ext: 'jpg' };
                    case 2: return { mime: 'image/png', ext: 'png' };
                    case 3: return { mime: 'image/gif', ext: 'gif' };
                    case 4: return { mime: 'image/tiff', ext: 'tiff' };
                    case 5: return { mime: 'application/pdf', ext: 'pdf' };
                    case 6: return { mime: 'audio/wav', ext: 'wav' };
                    case 7: return { mime: 'text/plain', ext: 'txt' };
                }
                return null;
            }
        });
    }, []);

    return (
        <OutguessAPI.Provider value={api}>
            <OutguessStdOut.Provider value={stdOutContent.current}>
                <OutguessStdErr.Provider value={stdErrContent.current}>
                    <Script
                        id="outguess"
                        src="/assets/outguess/outguess.js"
                        strategy="afterInteractive"
                        onLoad={handleOutguessScriptLoad}
                    />
                    {children}
                </OutguessStdErr.Provider>
            </OutguessStdOut.Provider>
        </OutguessAPI.Provider>
    );
};

OutguessAPIProvider.propTypes = {
    children: PropTypes.node.isRequired,
};

export const useOutguessAPI = () => useContext(OutguessAPI);
export const useOutguessStdOut = () => useContext(OutguessStdOut);
export const useOutguessStdErr = () => useContext(OutguessStdErr);

export default OutguessAPIProvider;
