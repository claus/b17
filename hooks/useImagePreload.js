import { useState, useCallback, useRef } from 'react';

export default function useImagePreload(load) {
    const [loaded, setLoaded] = useState(false);
    const imageEl = useRef();
    const imageRef = useCallback(
        el => {
            if (load) {
                const handleLoad = () => {
                    imageEl.current?.removeEventListener('load', handleLoad);
                    setLoaded(true);
                };
                if (el) {
                    imageEl.current = el;
                    if (el.complete && el.naturalWidth) {
                        handleLoad();
                    } else {
                        el.addEventListener('load', handleLoad);
                    }
                } else {
                    imageEl.current?.removeEventListener('load', handleLoad);
                    imageEl.current = null;
                }
            }
        },
        [load]
    );
    return [imageRef, loaded];
}
