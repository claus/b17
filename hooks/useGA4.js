import { initGA } from 'utils/ga';
import { useEffect } from 'react';

export default function useGA4() {
    useEffect(() => {
        initGA(process.env.NEXT_PUBLIC_GA);
    }, []);
}
