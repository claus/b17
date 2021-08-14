import { useState, useRef, useEffect, useCallback } from 'react';
import { useDispatchContext, SET_BUSY } from 'store';
import { useOutguessAPI } from 'components/OutguessAPIProvider';
import * as ga from 'utils/ga';

export default function useOutguess(keys) {
    const api = useOutguessAPI();
    const dispatch = useDispatchContext();
    const [result, setResult] = useState(null);
    const [progress, setProgress] = useState({ current: 0, percent: 0 });
    const index = useRef(0);
    const raf = useRef();

    const reset = useCallback(() => {
        cancelAnimationFrame(raf.current);
        raf.current = null;
        index.current = 0;
        setProgress({ current: 0, percent: 0 });
        setResult(null);
    }, []);

    useEffect(() => {
        if (keys?.length > 0) {
            let keyFound = false;
            const startTime = performance.now();
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
                            setResult({ ...fileInfo, bytes, blobUrl, key });
                            dispatch({ type: SET_BUSY, busy: false });
                            ga.event('outguess', 'outguess_test_found', key);
                            break;
                        }
                        api.freeDecodeResultData();
                    }
                    if (performance.now() - start > 12) {
                        setProgress({
                            total: keys.length,
                            current: index.current,
                            percent: index.current / keys.length,
                        });
                        if (index.current < keys.length) {
                            raf.current = requestAnimationFrame(keyRunner);
                        }
                        break;
                    }
                }
                if (index.current === keys.length) {
                    const endTime = performance.now();
                    console.log(`${(endTime - startTime) / 1000} sec`);
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

    return [result, progress, reset];
}
