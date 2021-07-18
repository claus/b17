import { useState, useEffect } from 'react';

export default function useDetectTouch() {
    const [isTouch, setIsTouch] = useState(true);
    useEffect(() => {
        setIsTouch(
            window.matchMedia('(hover: none) and (pointer: coarse)').matches
        );
    }, []);
    return isTouch;
}
