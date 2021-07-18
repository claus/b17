import { useState, useCallback } from 'react';

export default function useIntersectionObserver(
    once = true,
    rootMargin = '100000px 0px 0px 0px'
) {
    const [inView, setInView] = useState(false);
    const observedRef = useCallback(
        el => {
            let observer;
            if (el) {
                if (!inView || !once) {
                    observer = new IntersectionObserver(
                        ([entry]) => {
                            if (entry.isIntersecting && once) {
                                observer.unobserve(el);
                            }
                            setInView(entry.isIntersecting);
                        },
                        { rootMargin: rootMargin }
                    );
                    observer.observe(el);
                }
            } else {
                observer?.unobserve(el);
            }
        },
        [inView, once, rootMargin]
    );
    return [observedRef, inView];
}
