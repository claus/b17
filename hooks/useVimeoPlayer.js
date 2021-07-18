import { useState, useRef, useEffect, useCallback } from 'react';

import Player from '@vimeo/player';

import useIntersectionObserver from 'hooks/useIntersectionObserver';

export default function useVimeoPlayer(id) {
    const [container, inView] = useIntersectionObserver();
    const playerInst = useRef();
    const player = useRef();
    const [state, setState] = useState('idle');

    const play = useCallback(() => {
        playerInst.current?.play();
    }, []);

    useEffect(() => {
        if (inView) {
            if (!playerInst.current) {
                const p = (playerInst.current = new Player(player.current, {
                    id,
                    byline: false,
                    portrait: false,
                    title: false,
                    responsive: true,
                    playsinline: false,
                    autopause: true,
                }));
                p.ready().then(() => setState('ready'));
                p.on('play', () => setState('playing'));
                p.on('playing', () => setState('playing'));
                p.on('pause', () => setState('paused'));
                p.on('ended', () => setState('ended'));
            }
        } else {
            playerInst.current?.pause();
        }
    }, [inView, id]);

    useEffect(() => {
        return () => {
            playerInst.current?.off('play');
            playerInst.current?.off('playing');
            playerInst.current?.off('pause');
            playerInst.current?.off('ended');
            playerInst.current?.destroy();
        };
    }, []);

    return [container, player, state, play];
}
